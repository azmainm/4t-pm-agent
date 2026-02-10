import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { SummarizationService } from '../llm/summarization.service.js';
import { StandupTicketsRepository } from '../database/repositories/standup-tickets.repository.js';
import { DailySummaryRepository } from '../database/repositories/daily-summary.repository.js';
import { AgentRunRepository } from '../database/repositories/agent-run.repository.js';
import { NotificationService } from '../notification/notification.service.js';

export interface IngestionResult {
  runId: string;
  success: boolean;
  summaryGenerated: boolean;
  transcriptId?: string;
  error?: string;
}

@Injectable()
export class IngestionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
    private readonly summarizationService: SummarizationService,
    private readonly standupTicketsRepo: StandupTicketsRepository,
    private readonly summaryRepo: DailySummaryRepository,
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
      // Step 1: Read today's transcript from standuptickets DB
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.logger.info({ runId, event: 'ingestion.fetch_transcript', date: today });
      
      const transcript = await this.standupTicketsRepo.findByDate(today);

      if (!transcript) {
        this.logger.warn({ runId, event: 'ingestion.no_transcript', date: today });
        await this.agentRunRepo.updateStatus(runId, 'completed', {});
        return {
          runId,
          success: true,
          summaryGenerated: false,
        };
      }

      await this.agentRunRepo.addStep(runId, {
        stepName: 'fetch_transcript',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
        metadata: { transcriptId: transcript._id, segmentCount: transcript.transcript_data.length },
      });

      this.logger.info({ runId, transcriptId: transcript._id, event: 'ingestion.transcript.found' });

      // Step 2: Check if summary already exists
      const existingSummary = await this.summaryRepo.findByDate(today);
      if (existingSummary) {
        this.logger.info({ runId, event: 'ingestion.summary.exists' });
        await this.agentRunRepo.updateStatus(runId, 'completed', {});
        return {
          runId,
          success: true,
          summaryGenerated: false,
          transcriptId: transcript._id,
        };
      }

      // Step 3: Generate summary using GPT
      this.logger.info({ runId, event: 'ingestion.summary.start' });
      
      const summary = await this.summarizationService.summarizeTranscript({
        segments: transcript.transcript_data.map((seg, index) => ({
          speaker: seg.speaker,
          timestamp: seg.timestamp,
          text: seg.text,
          startTime: seg.timestamp,
          endTime: seg.timestamp,
        })) as any, // Cast to bypass type check - data is compatible
        participants: [],
      });

      await this.agentRunRepo.addStep(runId, {
        stepName: 'generate_summary',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
        metadata: { model: 'gpt-5-nano' },
      });

      // Step 4: Save summary to sprint_agent DB
      const savedSummary = await this.summaryRepo.create({
        date: today,
        transcriptId: transcript._id,
        overallSummary: summary.overallSummary,
        actionItems: summary.actionItems,
        decisions: summary.decisions,
        blockers: summary.blockers,
        perPersonSummary: summary.perPersonSummary.map(p => ({
          name: p.person,
          summary: p.progressItems.join('; '),
          nextSteps: p.commitments,
        })),
        generatedAt: new Date(),
      });

      await this.agentRunRepo.addStep(runId, {
        stepName: 'save_summary',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
        metadata: { summaryId: savedSummary._id.toString() },
      });

      this.logger.info({
        runId,
        transcriptId: transcript._id,
        summaryId: savedSummary._id.toString(),
        event: 'ingestion.summary.saved',
      });

      // Mark as completed
      await this.agentRunRepo.updateStatus(runId, 'completed', {});

      return {
        runId,
        success: true,
        summaryGenerated: true,
        transcriptId: transcript._id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error({ runId, error: errorMessage }, 'Daily ingestion failed');

      await this.agentRunRepo.updateStatus(runId, 'failed', {
        error: errorMessage,
      });

      await this.notificationService.sendError('Daily Ingestion', errorMessage, runId);

      return {
        runId,
        success: false,
        summaryGenerated: false,
        error: errorMessage,
      };
    }
  }
}
