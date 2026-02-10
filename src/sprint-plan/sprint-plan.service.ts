import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { TranscriptRepository } from '../database/repositories/transcript.repository.js';
import { TeamsMessageRepository } from '../database/repositories/teams-message.repository.js';
import { SprintPlanRepository } from '../database/repositories/sprint-plan.repository.js';
import { AgentRunRepository } from '../database/repositories/agent-run.repository.js';
import { ReactAgentService } from '../llm/agent/react-agent.service.js';
import { ContextBuilderService } from '../processing/context-builder.service.js';
import { DocxGeneratorService } from '../docx/docx-generator.service.js';
import { OnedriveService } from '../graph/onedrive.service.js';
import { JiraService, type JiraIssueResult } from '../jira/jira.service.js';
import { NotificationService } from '../notification/notification.service.js';
import type { SprintPlanOutput } from '../llm/dto/sprint-plan-output.dto.js';

export interface SprintPlanResult {
  runId: string;
  success: boolean;
  sprintPlanId?: string;
  error?: string;
}

@Injectable()
export class SprintPlanService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
    private readonly transcriptRepo: TranscriptRepository,
    private readonly teamsMessageRepo: TeamsMessageRepository,
    private readonly sprintPlanRepo: SprintPlanRepository,
    private readonly agentRunRepo: AgentRunRepository,
    private readonly reactAgent: ReactAgentService,
    private readonly contextBuilder: ContextBuilderService,
    private readonly docxGenerator: DocxGeneratorService,
    private readonly onedriveService: OnedriveService,
    private readonly jiraService: JiraService,
    private readonly notificationService: NotificationService,
  ) {
    this.logger.setContext('SprintPlanService');
  }

  async generateSprintPlan(): Promise<SprintPlanResult> {
    const runId = randomUUID();
    const startedAt = new Date();

    this.logger.info({ runId, event: 'sprint_plan.started' });

    const agentRun = await this.agentRunRepo.create({
      runId,
      runType: 'sprint_plan',
      startedAt,
      status: 'running',
      steps: [],
    });

    try {
      // Calculate sprint dates (2 weeks)
      const today = new Date();
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Step 1: Fetch all data
      this.logger.info({ runId, event: 'sprint_plan.fetch_data' });

      const [transcripts, messages, previousPlan] = await Promise.all([
        this.transcriptRepo.findWithSummaries(twoWeeksAgo, today),
        this.teamsMessageRepo.findByDateRange(twoWeeksAgo, today),
        this.sprintPlanRepo.findLatest(),
      ]);

      await this.agentRunRepo.addStep(runId, {
        stepName: 'fetch_data',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
        metadata: {
          transcriptsCount: transcripts.length,
          messagesCount: messages.length,
          hasPreviousPlan: !!previousPlan,
        },
      });

      this.logger.info({
        runId,
        transcriptsCount: transcripts.length,
        messagesCount: messages.length,
        hasPreviousPlan: !!previousPlan,
      });

      // Step 2: Build context
      const contextInput = {
        dailySummaries: transcripts.map(t => ({
          date: t.date,
          overallSummary: t.dailySummary?.overallSummary || '',
          actionItems: t.dailySummary?.actionItems || [],
          decisions: t.dailySummary?.decisions || [],
          blockers: t.dailySummary?.blockers || [],
          perPersonSummary: (t.dailySummary?.perPersonSummary || []).map(p => ({
            ...p,
            commitments: p.nextSteps || [],
          })),
        })),
        teamsMessages: messages.map(m => ({
          senderName: m.senderName,
          content: m.content,
          sentAt: m.timestamp,
          channelOrChatName: m.channelOrChatName,
          source: m.source,
        })),
        previousPlanText: previousPlan?.extractedText || '',
      };

      const context = this.contextBuilder.buildSprintPlanContext(contextInput);

      await this.agentRunRepo.addStep(runId, {
        stepName: 'build_context',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
        metadata: { contextLength: context.length },
      });

      // Step 3: Run agent to generate plan
      this.logger.info({ runId, event: 'sprint_plan.agent.start' });
      
      // Build system prompt with roster
      const teamMembers = this.configService.get<any[]>('roster.members', []);
      const systemPrompt = `You are a sprint planning agent. Generate a comprehensive sprint plan based on the provided context.\n\nTeam: ${teamMembers.map(m => m.name).join(', ')}`;
      const userMessage = `Based on the following context, generate the sprint plan:\n\n${context}`;
      
      const agentResult = await this.reactAgent.runSprintPlanAgent(systemPrompt, userMessage);
      const sprintPlanOutput = agentResult.plan;

      await this.agentRunRepo.addStep(runId, {
        stepName: 'agent_generate_plan',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
      });

      this.logger.info({ runId, event: 'sprint_plan.agent.completed' });

      // Step 4: Save plan to DB
      const nextSprintStart = new Date(today);
      nextSprintStart.setDate(nextSprintStart.getDate() + 1);
      const nextSprintEnd = new Date(nextSprintStart);
      nextSprintEnd.setDate(nextSprintEnd.getDate() + 14);

      const planDataWithRubric = {
        ...sprintPlanOutput,
        pointsRubric: {
          '1': 'straightforward, clear path',
          '2': 'some complexity but well-understood',
          '3': 'moderate complexity or some unknowns',
          '4': 'complex, multiple pieces, or unclear areas',
          '5': 'very complex, significant unknown',
        },
      };

      const sprintPlan = await this.sprintPlanRepo.create({
        sprintStartDate: new Date(sprintPlanOutput.sprintDateRange.start),
        sprintEndDate: new Date(sprintPlanOutput.sprintDateRange.end),
        planData: planDataWithRubric as any,
        status: 'generated',
      });

      this.logger.info({ runId, event: 'sprint_plan.saved', sprintPlanId: sprintPlan._id });

      // Step 5: Generate .docx
      const docxBuffer = await this.docxGenerator.generate(sprintPlanOutput);

      await this.agentRunRepo.addStep(runId, {
        stepName: 'generate_docx',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
        metadata: { docxSize: docxBuffer.length },
      });

      this.logger.info({ runId, event: 'sprint_plan.docx.generated' });

      // Step 6: Upload to OneDrive
      const fileName = `Sprint_${sprintPlanOutput.sprintDateRange.start}_Plan_v1.0.docx`;
      const sprintPlansFolderId = this.configService.get<string>('onedrive.sprintPlansFolderId')!;
      const uploadResult = await this.onedriveService.uploadFile(sprintPlansFolderId, fileName, docxBuffer);

      // Archive previous plan (both .docx and .md files)
      if (previousPlan?.onedriveFileName) {
        const archiveFolderId = this.configService.get<string>('onedrive.archiveFolderId')!;
        const baseName = previousPlan.onedriveFileName.replace(/\.docx$/, '');
        
        // Get all files in sprint plans folder
        const allFiles = await this.onedriveService.listFolder(sprintPlansFolderId);
        
        // Find and move both .docx and .md files matching the previous plan
        const filesToArchive = allFiles.filter(
          (file) => file.name.startsWith(baseName) && (file.name.endsWith('.docx') || file.name.endsWith('.md')),
        );
        
        for (const file of filesToArchive) {
          await this.onedriveService.moveItem(file.id, archiveFolderId);
          this.logger.info({ fileId: file.id, fileName: file.name }, 'Archived old sprint plan file');
        }
      }

      await this.sprintPlanRepo.updateOnedriveFile(
        sprintPlan._id.toString(),
        uploadResult.id,
        fileName,
      );

      await this.agentRunRepo.addStep(runId, {
        stepName: 'upload_to_onedrive',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
        metadata: { fileId: uploadResult.id },
      });

      this.logger.info({ runId, event: 'sprint_plan.uploaded', fileId: uploadResult.id });

      // Step 7: Send notification with approval option
      await this.notificationService.sendSprintPlanReady(
        sprintPlan._id.toString(),
        fileName,
        { start: sprintPlanOutput.sprintDateRange.start, end: sprintPlanOutput.sprintDateRange.end },
      );

      // Mark as completed
      await this.agentRunRepo.updateStatus(runId, 'completed', {
        sprintPlanId: sprintPlan._id.toString(),
        stats: {
          transcriptsFetched: transcripts.length,
          messagesFetched: messages.length,
          durationMs: Date.now() - startedAt.getTime(),
        },
      });

      this.logger.info({ runId, event: 'sprint_plan.completed', sprintPlanId: sprintPlan._id });

      return {
        runId,
        success: true,
        sprintPlanId: sprintPlan._id.toString(),
      };
    } catch (error) {
      this.logger.error({ runId, error: error.message, stack: error.stack }, 'Sprint plan generation failed');

      await this.agentRunRepo.updateStatus(runId, 'failed', {
        error: error.message,
      });

      await this.notificationService.sendError('Sprint Plan Generation', error.message, runId);

      return {
        runId,
        success: false,
        error: error.message,
      };
    }
  }

  async approveAndCreateJiraTasks(sprintPlanId: string): Promise<{ success: boolean; jiraIssueKeys?: string[]; error?: string }> {
    try {
      const sprintPlan = await this.sprintPlanRepo.findById(sprintPlanId);
      if (!sprintPlan) {
        return { success: false, error: 'Sprint plan not found' };
      }

      this.logger.info({ sprintPlanId, event: 'sprint_plan.approve.start' });

      // Create Jira issues
      const jiraIssues = await this.jiraService.createIssuesForPlan(sprintPlan.planData as any);

      // Update plan status and Jira keys
      await this.sprintPlanRepo.updateStatus(sprintPlanId, 'approved', {
        approvedAt: new Date(),
      });

      await this.sprintPlanRepo.updateJiraIssues(
        sprintPlanId,
        jiraIssues.map((i: JiraIssueResult) => i.jiraIssueKey),
      );

      this.logger.info({ sprintPlanId, event: 'sprint_plan.approved', jiraIssuesCount: jiraIssues.length });

      await this.notificationService.sendApprovalConfirmation(
        sprintPlanId,
        jiraIssues.length,
      );

      return {
        success: true,
        jiraIssueKeys: jiraIssues.map((i: JiraIssueResult) => i.jiraIssueKey),
      };
    } catch (error) {
      this.logger.error({ sprintPlanId, error: error.message }, 'Approval failed');
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
