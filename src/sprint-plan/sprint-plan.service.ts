import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { DailySummaryRepository } from '../database/repositories/daily-summary.repository.js';
import { SprintPlanRepository } from '../database/repositories/sprint-plan.repository.js';
import { AgentRunRepository } from '../database/repositories/agent-run.repository.js';
import { ReactAgentService } from '../llm/agent/react-agent.service.js';
import { DocxGeneratorService } from '../docx/docx-generator.service.js';
import { OnedriveService } from '../graph/onedrive.service.js';
import { TeamsChannelService } from '../graph/teams-channel.service.js';
import { TeamsChatService } from '../graph/teams-chat.service.js';
import { JiraService, type JiraIssueResult } from '../jira/jira.service.js';
import { NotificationService } from '../notification/notification.service.js';
import type { SprintPlanOutput } from '../llm/dto/sprint-plan-output.dto.js';
import * as mammoth from 'mammoth';

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
    private readonly summaryRepo: DailySummaryRepository,
    private readonly sprintPlanRepo: SprintPlanRepository,
    private readonly agentRunRepo: AgentRunRepository,
    private readonly reactAgent: ReactAgentService,
    private readonly docxGenerator: DocxGeneratorService,
    private readonly onedriveService: OnedriveService,
    private readonly teamsChannelService: TeamsChannelService,
    private readonly teamsChatService: TeamsChatService,
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
      // Step 1: Gather all data
      const today = new Date();
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);

      // Get last 10 daily summaries (or all from last 14 days)
      this.logger.info({ runId, event: 'sprint_plan.fetch_summaries' });
      const summaries = await this.summaryRepo.findByDateRange(twoWeeksAgo, today);
      const last10Summaries = summaries.slice(-10);

      // Fetch Teams messages on-the-fly (don't store)
      this.logger.info({ runId, event: 'sprint_plan.fetch_messages' });
      const [channelMessages, chatMessages] = await Promise.all([
        this.teamsChannelService.fetchAllChannelMessages(twoWeeksAgo, today),
        this.teamsChatService.fetchAllChatMessages(twoWeeksAgo, today),
      ]);
      const allMessages = [...channelMessages, ...chatMessages];

      // Get previous sprint plan from OneDrive
      this.logger.info({ runId, event: 'sprint_plan.fetch_previous_plan' });
      const sprintPlansFolderId = this.configService.get<string>('onedrive.sprintPlansFolderId')!;
      const previousPlanFile = await this.onedriveService.findLatestSprintPlan(sprintPlansFolderId);
      
      let previousPlanText = '';
      let previousPlan = null;
      if (previousPlanFile) {
        const fileBuffer = await this.onedriveService.downloadFile(previousPlanFile.id);
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        previousPlanText = result.value;
        previousPlan = await this.sprintPlanRepo.findLatest();
      }

      await this.agentRunRepo.addStep(runId, {
        stepName: 'fetch_data',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
        metadata: {
          summariesCount: last10Summaries.length,
          messagesCount: allMessages.length,
          hasPreviousPlan: !!previousPlanText,
        },
      });

      this.logger.info({
        runId,
        summariesCount: last10Summaries.length,
        messagesCount: allMessages.length,
        hasPreviousPlan: !!previousPlanText,
      });

      // Step 2: Multi-pass agent analysis (dynamic context handling)
      this.logger.info({ runId, event: 'sprint_plan.agent.multi_pass_start' });

      // Pass 1: Analyze daily summaries
      const summariesAnalysis = await this.analyzeSummaries(last10Summaries, runId);

      // Pass 2: Analyze Teams messages
      const messagesAnalysis = await this.analyzeMessages(allMessages, runId);

      // Pass 3: Analyze previous plan
      const previousPlanAnalysis = await this.analyzePreviousPlan(previousPlanText, runId);

      // Pass 4: Generate final sprint plan
      const sprintPlanOutput = await this.generateFinalPlan(
        summariesAnalysis,
        messagesAnalysis,
        previousPlanAnalysis,
        runId,
      );

      // Step 3: Save plan to DB
      const planDataWithRubric = {
        ...sprintPlanOutput,
        pointsRubric: {
          '1': 'Small task, 1-2 hours',
          '2': 'Medium task, 2-4 hours',
          '3': 'Large task, 4-8 hours',
          '5': 'Very large task, 1-2 days',
          '8': 'Epic task, 2-3 days',
        },
      };

      const sprintPlan = await this.sprintPlanRepo.create({
        sprintStartDate: new Date(sprintPlanOutput.sprintDateRange.start),
        sprintEndDate: new Date(sprintPlanOutput.sprintDateRange.end),
        planData: planDataWithRubric as any,
        status: 'generated',
      });

      this.logger.info({ runId, event: 'sprint_plan.saved', sprintPlanId: sprintPlan._id });

      // Step 4: Generate .docx
      const docxBuffer = await this.docxGenerator.generate(sprintPlanOutput);

      await this.agentRunRepo.addStep(runId, {
        stepName: 'generate_docx',
        startedAt: new Date(),
        completedAt: new Date(),
        success: true,
        metadata: { docxSize: docxBuffer.length },
      });

      this.logger.info({ runId, event: 'sprint_plan.docx.generated' });

      // Step 5: Upload to OneDrive & Archive old files
      const fileName = `Sprint_${sprintPlanOutput.sprintDateRange.start}_Plan_v1.0.docx`;
      const uploadResult = await this.onedriveService.uploadFile(sprintPlansFolderId, fileName, docxBuffer);

      // Archive previous plan (both .docx and .md files)
      if (previousPlan && previousPlan.onedriveFileName) {
        const archiveFolderId = this.configService.get<string>('onedrive.archiveFolderId')!;
        const baseName = previousPlan.onedriveFileName.replace(/\.docx$/, '');
        
        const allFiles = await this.onedriveService.listFolder(sprintPlansFolderId);
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

      // Step 6: Send notification
      await this.notificationService.sendSprintPlanReady(
        sprintPlan._id.toString(),
        fileName,
        { start: sprintPlanOutput.sprintDateRange.start, end: sprintPlanOutput.sprintDateRange.end },
      );

      // Mark as completed
      await this.agentRunRepo.updateStatus(runId, 'completed', {
        sprintPlanId: sprintPlan._id.toString(),
      });

      return {
        runId,
        success: true,
        sprintPlanId: sprintPlan._id.toString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error({ runId, error: errorMessage }, 'Sprint plan generation failed');

      await this.agentRunRepo.updateStatus(runId, 'failed', {
        error: errorMessage,
      });

      await this.notificationService.sendError('Sprint Plan Generation', errorMessage, runId);

      return {
        runId,
        success: false,
        error: errorMessage,
      };
    }
  }

  private async analyzeSummaries(summaries: any[], runId: string): Promise<string> {
    this.logger.info({ runId, event: 'sprint_plan.analyze_summaries', count: summaries.length });

    const summariesText = summaries.map(s => {
      const date = new Date(s.date).toISOString().split('T')[0];
      return `
Date: ${date}
Overall: ${s.overallSummary}
Action Items: ${s.actionItems.join(', ')}
Decisions: ${s.decisions.join(', ')}
Blockers: ${s.blockers.join(', ')}
Per Person:
${s.perPersonSummary.map((p: any) => `  - ${p.name}: ${p.summary} (Next: ${p.nextSteps.join(', ')})`).join('\n')}
      `.trim();
    }).join('\n\n---\n\n');

    const prompt = `Analyze these daily standup summaries and extract:
1. Key accomplishments
2. Recurring themes/patterns
3. Blockers or challenges
4. Action items that need follow-up

Summaries:
${summariesText}`;

    const response = await this.reactAgent.callLLM(prompt);
    
    await this.agentRunRepo.addStep(runId, {
      stepName: 'analyze_summaries',
      startedAt: new Date(),
      completedAt: new Date(),
      success: true,
      metadata: { count: summaries.length },
    });

    return response;
  }

  private async analyzeMessages(messages: any[], runId: string): Promise<string> {
    this.logger.info({ runId, event: 'sprint_plan.analyze_messages', count: messages.length });

    if (messages.length === 0) {
      return 'No Teams messages to analyze.';
    }

    // Process in chunks if too many messages
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < messages.length; i += chunkSize) {
      chunks.push(messages.slice(i, i + chunkSize));
    }

    const chunkAnalyses = [];
    for (const [index, chunk] of chunks.entries()) {
      const messagesText = chunk.map((m: any) => 
        `[${new Date(m.timestamp).toISOString()}] ${m.senderName}: ${m.content}`
      ).join('\n');

      const prompt = `Analyze these Teams messages (chunk ${index + 1}/${chunks.length}) and extract:
1. Important discussions
2. Decisions made
3. Questions or issues raised

Messages:
${messagesText}`;

      const analysis = await this.reactAgent.callLLM(prompt);
      chunkAnalyses.push(analysis);
    }

    await this.agentRunRepo.addStep(runId, {
      stepName: 'analyze_messages',
      startedAt: new Date(),
      completedAt: new Date(),
      success: true,
      metadata: { count: messages.length, chunks: chunks.length },
    });

    return chunkAnalyses.join('\n\n---\n\n');
  }

  private async analyzePreviousPlan(previousPlanText: string, runId: string): Promise<string> {
    this.logger.info({ runId, event: 'sprint_plan.analyze_previous_plan' });

    if (!previousPlanText) {
      return 'No previous sprint plan available.';
    }

    const prompt = `Analyze this previous sprint plan and identify:
1. What tasks were likely completed (format/structure reference)
2. What tasks were likely not completed
3. Any patterns or structure to maintain

Previous Plan:
${previousPlanText}`;

    const analysis = await this.reactAgent.callLLM(prompt);

    await this.agentRunRepo.addStep(runId, {
      stepName: 'analyze_previous_plan',
      startedAt: new Date(),
      completedAt: new Date(),
      success: true,
    });

    return analysis;
  }

  private async generateFinalPlan(
    summariesAnalysis: string,
    messagesAnalysis: string,
    previousPlanAnalysis: string,
    runId: string,
  ): Promise<SprintPlanOutput> {
    this.logger.info({ runId, event: 'sprint_plan.generate_final' });

    const teamMembers = this.configService.get<any[]>('roster.members', []);
    const nextMonday = this.getNextMonday();
    const nextNextMonday = new Date(nextMonday);
    nextNextMonday.setDate(nextNextMonday.getDate() + 14);

    const systemPrompt = `You are a sprint planning agent. Generate a comprehensive 2-week sprint plan.

Team Members: ${teamMembers.map(m => `${m.name} (${m.role})`).join(', ')}
Sprint Period: ${nextMonday.toISOString().split('T')[0]} to ${nextNextMonday.toISOString().split('T')[0]}`;

    const userMessage = `Based on the following analysis, generate the next sprint plan:

# Daily Summaries Analysis
${summariesAnalysis}

# Teams Messages Analysis
${messagesAnalysis}

# Previous Sprint Plan Analysis
${previousPlanAnalysis}

Generate a structured sprint plan with:
1. Primary Goals (3-5 bullet points)
2. Notes section including:
   - What was completed from previous sprint
   - What was NOT completed (with reasons if known)
   - What was done EXTRA (outside the plan)
3. Owner breakdown with tasks, story points, and acceptance criteria`;

    const agentResult = await this.reactAgent.runSprintPlanAgent(systemPrompt, userMessage);

    await this.agentRunRepo.addStep(runId, {
      stepName: 'generate_final_plan',
      startedAt: new Date(),
      completedAt: new Date(),
      success: true,
    });

    return agentResult.plan;
  }

  private getNextMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
  }

  async listSprintPlans(limit = 20): Promise<any[]> {
    this.logger.info({ limit }, 'Listing sprint plans');
    
    const plans = await this.sprintPlanRepo.findAll(limit);
    
    return plans.map(plan => {
      // Calculate total tasks from planData
      const totalTasks = plan.planData?.ownerBreakdown?.reduce(
        (sum, owner) => sum + (owner.focuses?.reduce(
          (focusSum, focus) => focusSum + (focus.tasks?.length || 0),
          0
        ) || 0),
        0
      ) || 0;

      return {
        id: plan._id.toString(),
        sprintStartDate: plan.sprintStartDate,
        sprintEndDate: plan.sprintEndDate,
        status: plan.status,
        createdAt: (plan as any).createdAt || plan.sprintStartDate,
        approvedAt: plan.approvedAt,
        jiraIssueKeys: plan.jiraIssueKeys || [],
        onedriveFileName: plan.onedriveFileName,
        primaryGoals: plan.planData?.primaryGoals || [],
        notes: plan.planData?.notes || [],
        totalTasks,
      };
    });
  }

  async approveAndCreateJiraTasks(sprintPlanId: string): Promise<any> {
    this.logger.info({ sprintPlanId }, 'Approving sprint plan and creating Jira tasks');

    const sprintPlan = await this.sprintPlanRepo.findById(sprintPlanId);
    if (!sprintPlan) {
      throw new Error(`Sprint plan ${sprintPlanId} not found`);
    }

    const jiraIssues = await this.jiraService.createIssuesForPlan(sprintPlan.planData as any);
    await this.sprintPlanRepo.updateJiraIssues(sprintPlanId, jiraIssues.map((i: JiraIssueResult) => i.jiraIssueKey));
    await this.sprintPlanRepo.updateStatus(sprintPlanId, 'approved');

    this.logger.info({ sprintPlanId, issuesCreated: jiraIssues.length }, 'Jira tasks created');

    await this.notificationService.sendApprovalConfirmation(sprintPlanId, jiraIssues.length);

    return {
      sprintPlanId,
      jiraIssues: jiraIssues.map(i => ({ key: i.jiraIssueKey, url: i.browserUrl })),
    };
  }
}
