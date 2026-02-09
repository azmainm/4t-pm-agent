import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { CalendarService } from '../graph/calendar.service.js';
import { TranscriptService } from '../graph/transcript.service.js';
import { TeamsChannelService } from '../graph/teams-channel.service.js';
import { TeamsChatService } from '../graph/teams-chat.service.js';
import { VttParserService } from '../processing/vtt-parser.service.js';
import { SummarizationService } from '../llm/summarization.service.js';
import { EmbeddingService } from '../processing/embedding.service.js';
import { TranscriptRepository } from '../database/repositories/transcript.repository.js';
import { TeamsMessageRepository } from '../database/repositories/teams-message.repository.js';
import { AgentRunRepository } from '../database/repositories/agent-run.repository.js';
import { NotificationService } from '../notification/notification.service.js';
import type { TranscriptSegment } from '../processing/vtt-parser.service.js';

export interface IngestionResult {
  runId: string;
  success: boolean;
  transcriptProcessed: boolean;
  messagesCount: number;
  error?: string;
}

@Injectable()
export class IngestionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
    private readonly calendarService: CalendarService,
    private readonly transcriptService: TranscriptService,
    private readonly teamsChannelService: TeamsChannelService,
    private readonly teamsChatService: TeamsChatService,
    private readonly vttParser: VttParserService,
    private readonly summarizationService: SummarizationService,
    private readonly embeddingService: EmbeddingService,
    private readonly transcriptRepo: TranscriptRepository,
    private readonly teamsMessageRepo: TeamsMessageRepository,
    private readonly agentRunRepo: AgentRunRepository,
    private readonly notificationService: NotificationService,
  ) {
    this.logger.setContext('IngestionService');
  }

  async runDailyIngestion(): Promise<IngestionResult> {
    const runId = randomUUID();
    const startedAt = new Date();

    this.logger.info({ runId, event: 'ingestion.started' });

    const agentRun = await this.agentRunRepo.create({
      runId,
      runType: 'ingestion',
      startedAt,
      status: 'running',
      steps: [],
    });

    try {
      // Step 1: Fetch today's standup
      const standupSubject = this.configService.get<string>('teams.standupSubjectFilter', 'Daily Standup');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      this.logger.info({ runId, event: 'ingestion.calendar.fetch', date: today });
      const events = await this.calendarService.getTodayEvents(standupSubject, today, tomorrow);

      let transcriptProcessed = false;
      if (events.length > 0) {
        const standupEvent = events[0];
        await this.agentRunRepo.addStep(runId, {
          stepName: 'fetch_calendar',
          startedAt: new Date(),
          completedAt: new Date(),
          success: true,
          metadata: { eventId: standupEvent.id, subject: standupEvent.subject },
        });

        // Step 2: Fetch transcript
        this.logger.info({ runId, event: 'ingestion.transcript.fetch', eventId: standupEvent.id });
        const meetingId = await this.transcriptService.fetchOnlineMeetingId(standupEvent.onlineMeeting?.joinUrl || '');
        const transcriptContent = await this.transcriptService.fetchTranscript(meetingId);

        if (transcriptContent) {
          // Step 3: Parse VTT
          const parsed = this.vttParser.parse(transcriptContent);
          await this.agentRunRepo.addStep(runId, {
            stepName: 'parse_transcript',
            startedAt: new Date(),
            completedAt: new Date(),
            success: true,
            metadata: { segmentCount: parsed.segments.length },
          });

          // Step 4: Save to DB
          const transcript = await this.transcriptRepo.create({
            date: today,
            meetingSubject: standupEvent.subject,
            meetingId: standupEvent.id,
            segments: parsed.segments,
            rawVttContent: transcriptContent,
          });

          this.logger.info({ runId, event: 'ingestion.transcript.saved', transcriptId: transcript._id });

          // Step 5: Generate daily summary
          const summary = await this.summarizationService.summarizeTranscript(parsed);
          const summaryWithNextSteps = {
            ...summary,
            perPersonSummary: summary.perPersonSummary.map(p => ({
              ...p,
              nextSteps: p.commitments || [],
            })),
          };
          await this.transcriptRepo.updateDailySummary(transcript._id.toString(), summaryWithNextSteps);
          await this.agentRunRepo.addStep(runId, {
            stepName: 'generate_summary',
            startedAt: new Date(),
            completedAt: new Date(),
            success: true,
          });

          this.logger.info({ runId, event: 'ingestion.summary.generated', transcriptId: transcript._id });

          // Step 6: Generate embeddings (optional, async)
          this.embeddingService.generateEmbeddings(
            parsed.segments.map((s: TranscriptSegment) => s.text),
            'transcript',
            today,
            { transcriptId: transcript._id.toString() },
          ).catch((err: Error) => {
            this.logger.warn({ runId, error: err.message }, 'Embedding generation failed');
          });

          transcriptProcessed = true;
        }
      }

      // Step 7: Fetch Teams messages (last 14 days)
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      this.logger.info({ runId, event: 'ingestion.teams_messages.fetch', startDate: twoWeeksAgo });
      
      const [channelMessages, chatMessages] = await Promise.all([
        this.teamsChannelService.fetchAllChannelMessages(twoWeeksAgo, today),
        this.teamsChatService.fetchAllChatMessages(twoWeeksAgo, today),
      ]);

      const allMessages = [...channelMessages, ...chatMessages];
      
      if (allMessages.length > 0) {
        await this.teamsMessageRepo.createMany(allMessages as any);
        await this.agentRunRepo.addStep(runId, {
          stepName: 'fetch_teams_messages',
          startedAt: new Date(),
          completedAt: new Date(),
          success: true,
          metadata: { messageCount: allMessages.length },
        });
      }

      this.logger.info({ runId, event: 'ingestion.teams_messages.saved', count: allMessages.length });

      // Mark as completed
      await this.agentRunRepo.updateStatus(runId, 'completed', {
        stats: {
          transcriptsFetched: transcriptProcessed ? 1 : 0,
          messagesFetched: allMessages.length,
          summariesGenerated: transcriptProcessed ? 1 : 0,
          durationMs: Date.now() - startedAt.getTime(),
        },
      });

      this.logger.info({ runId, event: 'ingestion.completed' });

      return {
        runId,
        success: true,
        transcriptProcessed,
        messagesCount: allMessages.length,
      };
    } catch (error) {
      this.logger.error({ runId, error: error.message, stack: error.stack }, 'Ingestion failed');

      await this.agentRunRepo.updateStatus(runId, 'failed', {
        error: error.message,
      });

      // Send Teams notification
      await this.notificationService.sendError('Daily Ingestion', error.message, runId);

      return {
        runId,
        success: false,
        transcriptProcessed: false,
        messagesCount: 0,
        error: error.message,
      };
    }
  }
}
