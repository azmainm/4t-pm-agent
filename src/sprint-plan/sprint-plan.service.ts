import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { DailySummaryRepository } from '../database/repositories/daily-summary.repository.js';
import { SprintPlanRepository } from '../database/repositories/sprint-plan.repository.js';
import { AgentRunRepository } from '../database/repositories/agent-run.repository.js';
import { ReactAgentService } from '../llm/agent/react-agent.service.js';
import { OpenaiService } from '../llm/openai.service.js';
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
    private readonly openaiService: OpenaiService,
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

      // Pass 3: Cross-reference previous plan with daily summaries (identify what's done vs pending)
      const previousPlanAnalysis = await this.analyzePreviousPlan(previousPlanText, last10Summaries, runId);

      // Pass 4: Generate final sprint plan
      const sprintPlanOutput = await this.generateFinalPlan(
        summariesAnalysis,
        messagesAnalysis,
        previousPlanAnalysis,
        runId,
      );

      // Step 3: Add points rubric to plan
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

      // Parse dates safely
      const parseDate = (dateStr: string): Date => {
        if (!dateStr) return new Date();
        // Try ISO format first
        let date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;
        // Try MM/DD/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          if (!isNaN(date.getTime())) return date;
        }
        // Fallback to calculated dates
        this.logger.warn({ dateStr }, 'Invalid date format, using calculated date');
        return new Date();
      };

      // Save to DB
      const sprintPlan = await this.sprintPlanRepo.create({
        sprintStartDate: parseDate(sprintPlanOutput.sprintDateRange.start),
        sprintEndDate: parseDate(sprintPlanOutput.sprintDateRange.end),
        planData: planDataWithRubric as any,
        status: 'generated',
      });

      this.logger.info({ runId, event: 'sprint_plan.saved', sprintPlanId: sprintPlan._id });

      // Step 4: Generate .docx (use planDataWithRubric which has the rubric)
      const docxBuffer = await this.docxGenerator.generate(planDataWithRubric as any);

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
      const upcomingWorkText = s.upcomingWork && s.upcomingWork.length > 0
        ? `\nUpcoming Work Discussed:\n${s.upcomingWork.map((w: any) => `  - ${w.task} (Owner: ${w.owner || 'Unassigned'}, Status: ${w.status}, Sprint: ${w.targetSprint}${w.priority ? ', Priority: ' + w.priority : ''})`).join('\n')}`
        : '';
      return `
Date: ${date}
Overall: ${s.overallSummary}
Action Items: ${s.actionItems.join(', ')}
Decisions: ${s.decisions.join(', ')}
Blockers: ${s.blockers.join(', ')}
Per Person:
${s.perPersonSummary.map((p: any) => `  - ${p.name}: ${p.summary} (Next: ${p.nextSteps.join(', ')})`).join('\n')}${upcomingWorkText}
      `.trim();
    }).join('\n\n---\n\n');

    const prompt = `Analyze these daily standup summaries and extract:

1. WHAT WAS COMPLETED: List specific tasks/features each person completed, organized by project
2. WHO WORKED ON WHAT: For each person, what projects/areas they focused on
3. BLOCKERS: Unresolved blockers or challenges that need to continue
4. ACTION ITEMS: Pending action items that weren't completed yet

IMPORTANT:
- Organize findings by project/product area, not just by person. Group completed work and pending items under their respective projects.
- Preserve exact spellings of product names, vendor names, and client names. Never approximate proper nouns.
- Be specific about task names and assignees. This will be used to verify what from the previous sprint plan was actually completed.

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

    // Group messages by channel/chat name for project separation
    const messagesByChannel = new Map<string, any[]>();
    for (const msg of messages) {
      const channelName = msg.channelOrChatName || 'Unknown';
      if (!messagesByChannel.has(channelName)) {
        messagesByChannel.set(channelName, []);
      }
      messagesByChannel.get(channelName)!.push(msg);
    }

    // Format messages grouped by channel, then chunk if needed
    const groupedMessagesText: string[] = [];
    for (const [channelName, channelMsgs] of messagesByChannel) {
      const msgsText = channelMsgs.map((m: any) => {
        const timestamp = m.sentAt ? new Date(m.sentAt).toISOString() : (m.timestamp ? new Date(m.timestamp).toISOString() : 'Unknown');
        return `  [${timestamp}] ${m.senderName}: ${m.content}`;
      }).join('\n');
      groupedMessagesText.push(`## Channel: ${channelName}\n${msgsText}`);
    }

    // Chunk the grouped text if too large
    const allText = groupedMessagesText.join('\n\n');
    const chunkSize = 50;
    const chunks = [];
    const allMsgsFlat = [...messagesByChannel.values()].flat();
    for (let i = 0; i < allMsgsFlat.length; i += chunkSize) {
      // Re-group each chunk by channel for context
      const chunkMsgs = allMsgsFlat.slice(i, i + chunkSize);
      const chunkByChannel = new Map<string, any[]>();
      for (const msg of chunkMsgs) {
        const ch = msg.channelOrChatName || 'Unknown';
        if (!chunkByChannel.has(ch)) chunkByChannel.set(ch, []);
        chunkByChannel.get(ch)!.push(msg);
      }
      let chunkText = '';
      for (const [ch, msgs] of chunkByChannel) {
        const msgsText = msgs.map((m: any) => {
          const timestamp = m.sentAt ? new Date(m.sentAt).toISOString() : (m.timestamp ? new Date(m.timestamp).toISOString() : 'Unknown');
          return `  [${timestamp}] ${m.senderName}: ${m.content}`;
        }).join('\n');
        chunkText += `## Channel: ${ch}\n${msgsText}\n\n`;
      }
      chunks.push(chunkText);
    }

    const chunkAnalyses = [];
    for (const [index, chunkText] of chunks.entries()) {
      const prompt = `Analyze these Teams messages (chunk ${index + 1}/${chunks.length}) and extract:

1. NEW WORK MENTIONED: Any new features, tasks, or projects discussed for future sprints
2. CURRENT WORK STATUS: Updates on ongoing tasks (progress, blockers, completion status)
3. DECISIONS MADE: Decisions that affect sprint planning (priorities, tech choices, scope changes)
4. WORK ASSIGNMENTS: Who is assigned to work on what (new or ongoing)
5. PRIORITY INDICATORS: Any explicit mentions of priority, urgency, or client requests
6. CLIENT WORK: Tasks related to client projects or client requests (note if new client or existing)
7. BUGS/ISSUES: Bug fixes or issues from clients that need addressing

IMPORTANT:
- Messages are grouped by Teams channel. Each channel typically represents a separate project. Maintain this project separation in your analysis — note which channel/project each item belongs to.
- Preserve exact spellings of product names, vendor names, and client names as they appear in the messages. Never paraphrase or approximate proper nouns.
- For each extracted item, note which channel/project it came from.

Messages:
${chunkText}`;

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

  private async analyzePreviousPlan(previousPlanText: string, summaries: any[], runId: string): Promise<string> {
    this.logger.info({ runId, event: 'sprint_plan.analyze_previous_plan' });

    if (!previousPlanText) {
      return 'No previous sprint plan available.';
    }

    // Format daily summaries for cross-reference
    const summariesText = summaries.map(s => {
      const date = new Date(s.date).toISOString().split('T')[0];
      return `${date}: ${s.overallSummary}\n${s.perPersonSummary.map((p: any) => `  - ${p.name}: ${p.summary}`).join('\n')}`;
    }).join('\n\n');

    const prompt = `You must CROSS-REFERENCE the previous sprint plan with daily standup summaries to identify what was actually completed vs what's still pending or partially complete.

PREVIOUS SPRINT PLAN:
${previousPlanText}

DAILY SUMMARIES (What actually happened):
${summariesText}

INSTRUCTIONS:
1. First, note the FOCUS AREA STRUCTURE from the previous plan — each focus area represents a distinct project. List which projects/focuses existed for each person and their status. This project separation structure should be preserved in the new plan.
2. For EACH task in the previous sprint plan, check if it appears in the daily summaries
3. Create three lists:
   - COMPLETED TASKS: Tasks from previous plan that were fully finished (with evidence from summaries). Note which project/focus they belonged to.
   - PARTIALLY COMPLETE: Tasks that were worked on but not finished. Describe qualitatively what's done and what remains (do NOT use percentages). Note which project/focus they belonged to.
   - NOT STARTED/PENDING: Tasks from previous plan NOT mentioned at all (must carry forward to next sprint). Note which project/focus they belonged to.
4. For each incomplete task (partial or pending), note:
   - Who it was originally assigned to
   - Which focus/project area it belonged to
   - What qualitatively remains to be done

Be thorough - every task from the previous plan must be categorized as completed, partially complete, or pending.`;

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

    const userMessage = `Generate the next sprint plan by following these steps:

# Daily Summaries Analysis (What got done + Who worked on what)
${summariesAnalysis}

# Teams Messages Analysis (New work + Status updates + Priorities)
${messagesAnalysis}

# Previous Sprint Plan Cross-Reference (Completed vs Partially Complete vs Pending)
${previousPlanAnalysis}

SPRINT PLANNING RULES:
1. CARRY FORWARD: All incomplete tasks (pending OR partially complete) from previous sprint MUST be included in the new sprint
   - If partially complete, update the description to note what's done and what remains
   - Assign to the same person who was working on it
2. ADD NEW WORK: Include new tasks from Teams/standup discussions
3. ASSIGN CORRECTLY: Assign tasks to people based on:
   - Who worked on related items in daily summaries
   - Who was originally assigned to carry-forward tasks
   - Who was mentioned in Teams for new work
4. PRIORITIZE TASKS:
   - HIGH priority: Client work (new or existing), bug fixes, client requests, or tasks explicitly mentioned as urgent/high priority
   - MEDIUM priority: Internal company tasks, refactoring, technical debt
   - Do NOT base priority on whether task is new or pending - base it on the nature of the work
5. PROJECT SEPARATION: Each distinct project/client MUST be its own focus area. NEVER combine multiple projects under one focus.
   - Use the previous sprint plan's focus structure as a guide for how projects are organized
   - Use Teams channel names to identify project boundaries
   - If a new project appears in messages that wasn't in the previous plan, create a new focus for it
   - Examples of WRONG: "PNW Automation & Bot Infrastructure" combining PNW, sales bot, and PM agent
   - Examples of RIGHT: separate focuses for "PNW & PIVH Automations", "Sales Bot", "Product Manager Agent", "CRM", "Onboarding Platform"
6. PRIMARY GOALS must NOT include work already completed in the previous sprint. Only include goals for work that is pending, partially complete, or new.
7. SPELLING: Always copy exact spellings of vendor names, product names, client names, and other proper nouns directly from the source data (Teams messages, previous sprint plan, daily summaries). Never paraphrase, abbreviate, or approximate proper nouns. If a name appears in the source data, use that exact spelling.
8. RECURRING NOTES: Look at the previous sprint plan's notes section. Any notes that are general/ongoing (not specific to that sprint's review) should be carried forward to the new plan. These are recurring operational notes the team wants in every sprint.
9. TASK GRANULARITY: Prefer fewer, well-scoped tasks (3-5 points each) per focus. Consolidate related small items into a single meaningful task rather than fragmenting into many 1-2 point tasks.
10. PRODUCT AWARENESS: The previous sprint plan shows which products exist and how they're organized. Use it to understand:
    - Which products are already deployed (don't plan "deployment" for them — focus on improvements or refinements instead)
    - Which products are in development
    - How the team organizes work across projects
    - Who owns which projects

IMPORTANT: You MUST respond with ONLY a JSON object (no markdown, no code blocks, no text before or after). The JSON must match this exact schema:

{
  "sprintDateRange": { "start": "${nextMonday.toISOString().split('T')[0]}", "end": "${nextNextMonday.toISOString().split('T')[0]}" },
  "primaryGoals": ["string"],
  "notes": ["Previous Sprint Review: [summarize completed, partially complete, and pending tasks - use qualitative descriptions, NOT percentages]", "carry forward any recurring/ongoing notes from the previous sprint plan"],
  "ownerBreakdown": [
    {
      "name": "Full Name",
      "focuses": [
        {
          "focusName": "Project Name",
          "goal": "Goal description",
          "tasks": [
            {
              "title": "Task title",
              "description": "What to build (if partially complete, note what's done and what remains)",
              "points": 1-5,
              "priority": "high",
              "acceptanceCriteria": ["criterion"]
            }
          ]
        }
      ]
    }
  ]
}

Generate the sprint plan with:
1. Primary Goals (3-5 bullet points) - focus on completing incomplete tasks + high-priority new work. Do NOT include already-completed work as goals.
2. Notes section - MUST include Previous Sprint Review (what completed, what partially complete, what pending — describe qualitatively, NO percentages). Also carry forward any recurring/ongoing notes from the previous sprint plan's notes section.
3. Owner breakdown with tasks for EACH person: ${teamMembers.map(m => m.name).join(', ')} - ensure ALL incomplete tasks are included, with each project as a separate focus area`;

    // Use direct JSON generation instead of tool calling for gpt-5-nano
    const response = await this.openaiService.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content || '{}';
    const sprintPlanOutput = typeof content === 'string' ? JSON.parse(content) : content;

    await this.agentRunRepo.addStep(runId, {
      stepName: 'generate_final_plan',
      startedAt: new Date(),
      completedAt: new Date(),
      success: true,
      metadata: { 
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens
      },
    });

    return sprintPlanOutput;
  }

  private async reparseWordDoc(onedriveFileId: string): Promise<SprintPlanOutput> {
    const fileBuffer = await this.onedriveService.downloadFile(onedriveFileId);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const docText = result.value;

    this.logger.info({ textLength: docText.length }, 'Extracted text from edited Word doc');

    const teamMembers = this.configService.get<any[]>('roster.members', []);

    const systemPrompt = `You are a sprint plan parser. You receive the full text of a Word document that contains a sprint plan. Your job is to extract the structured data from it and return it as JSON matching the exact schema provided.`;

    const userMessage = `Parse the following sprint plan document text into structured JSON.

Team Members (use these exact names): ${teamMembers.map(m => m.name).join(', ')}

DOCUMENT TEXT:
${docText}

IMPORTANT: You MUST respond with ONLY a JSON object (no markdown, no code blocks, no text before or after). The JSON must match this exact schema:

{
  "sprintDateRange": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "primaryGoals": ["string"],
  "notes": ["string"],
  "ownerBreakdown": [
    {
      "name": "Full Name",
      "focuses": [
        {
          "focusName": "Project Name",
          "goal": "Goal description",
          "tasks": [
            {
              "title": "Task title",
              "description": "Task description",
              "points": 1-5,
              "priority": "high|medium|low",
              "acceptanceCriteria": ["criterion"]
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Extract the sprint date range from the document header
- Map each person's section to the ownerBreakdown array
- Preserve all tasks, descriptions, points, priorities, and acceptance criteria exactly as written in the document
- If a field is missing or unclear, use reasonable defaults (e.g., priority "medium", points 2)`;

    const response = await this.openaiService.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content || '{}';
    const parsedPlan = typeof content === 'string' ? JSON.parse(content) : content;

    // Add points rubric
    const planWithRubric = {
      ...parsedPlan,
      pointsRubric: {
        '1': 'Small task, 1-2 hours',
        '2': 'Medium task, 2-4 hours',
        '3': 'Large task, 4-8 hours',
        '5': 'Very large task, 1-2 days',
        '8': 'Epic task, 2-3 days',
      },
    };

    return planWithRubric;
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

  async refreshFromOneDrive(sprintPlanId: string): Promise<any> {
    this.logger.info({ sprintPlanId }, 'Refreshing sprint plan from OneDrive');

    try {
      const sprintPlan = await this.sprintPlanRepo.findById(sprintPlanId);
      if (!sprintPlan) {
        return { success: false, error: `Sprint plan ${sprintPlanId} not found` };
      }

      if (!sprintPlan.onedriveFileId) {
        return { success: false, error: 'Sprint plan has no OneDrive file ID — cannot fetch document' };
      }

      const updatedPlanData = await this.reparseWordDoc(sprintPlan.onedriveFileId);
      const updated = await this.sprintPlanRepo.updatePlanData(sprintPlanId, updatedPlanData as any);
      if (!updated) {
        return { success: false, error: 'Failed to update plan data in database' };
      }

      // Calculate total tasks from updated plan
      const totalTasks = updatedPlanData.ownerBreakdown?.reduce(
        (sum: number, owner: any) => sum + (owner.focuses?.reduce(
          (focusSum: number, focus: any) => focusSum + (focus.tasks?.length || 0),
          0,
        ) || 0),
        0,
      ) || 0;

      this.logger.info({ sprintPlanId, totalTasks }, 'Sprint plan refreshed from OneDrive');

      return {
        success: true,
        sprintPlanId,
        totalTasks,
        primaryGoals: updatedPlanData.primaryGoals || [],
        notes: updatedPlanData.notes || [],
        ownerBreakdown: updatedPlanData.ownerBreakdown || [],
      };
    } catch (error) {
      this.logger.error({ sprintPlanId, error: (error as Error).message }, 'Failed to refresh sprint plan');
      return { success: false, error: (error as Error).message };
    }
  }

  async approveAndCreateJiraTasks(sprintPlanId: string): Promise<any> {
    this.logger.info({ sprintPlanId }, 'Approving sprint plan and creating Jira tasks');

    try {
      const sprintPlan = await this.sprintPlanRepo.findById(sprintPlanId);
      if (!sprintPlan) {
        return {
          success: false,
          error: `Sprint plan ${sprintPlanId} not found`,
        };
      }

      const jiraIssues = await this.jiraService.createIssuesForPlan(sprintPlan.planData as any);
      const successfulIssues = jiraIssues.filter(i => i.status === 'created');
      const failedIssues = jiraIssues.filter(i => i.status !== 'created');
      
      await this.sprintPlanRepo.updateJiraIssues(
        sprintPlanId, 
        jiraIssues.map((i: JiraIssueResult) => i.jiraIssueKey)
      );
      await this.sprintPlanRepo.updateStatus(sprintPlanId, 'approved');

      this.logger.info(
        { 
          sprintPlanId, 
          successfulCount: successfulIssues.length,
          failedCount: failedIssues.length,
        }, 
        'Sprint plan approved',
      );

      await this.notificationService.sendApprovalConfirmation(sprintPlanId, successfulIssues.length);

      return {
        success: true,
        sprintPlanId,
        jiraIssues: jiraIssues.map(i => ({ 
          key: i.jiraIssueKey, 
          url: i.browserUrl,
          status: i.status,
        })),
        summary: {
          total: jiraIssues.length,
          successful: successfulIssues.length,
          failed: failedIssues.length,
        },
      };
    } catch (error) {
      this.logger.error(
        { sprintPlanId, error: (error as Error).message },
        'Failed to approve sprint plan',
      );
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}
