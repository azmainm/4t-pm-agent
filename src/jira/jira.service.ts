import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Version3Client } from 'jira.js';
import type { SprintPlanOutput } from '../llm/dto/sprint-plan-output.dto.js';
import type { TeamMember } from '../config/roster.config.js';

export interface JiraIssueResult {
  jiraIssueKey: string;
  assignee: string;
  summary: string;
  status: string;
  browserUrl?: string;
}

@Injectable()
export class JiraService implements OnModuleInit {
  private client!: Version3Client;
  private projectKey!: string;
  private boardId!: number;
  private teamMembers!: TeamMember[];

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('JiraService');
  }

  onModuleInit() {
    this.client = new Version3Client({
      host: this.configService.get<string>('jira.host')!,
      authentication: {
        basic: {
          email: this.configService.get<string>('jira.email')!,
          apiToken: this.configService.get<string>('jira.apiToken')!,
        },
      },
    });
    this.projectKey = this.configService.get<string>('jira.projectKey')!;
    this.boardId = this.configService.get<number>('jira.boardId')!;
    this.teamMembers = this.configService.get<TeamMember[]>('roster.members')!;

    this.logger.info({ projectKey: this.projectKey }, 'Jira client initialized');
  }

  async createIssuesForPlan(
    plan: SprintPlanOutput,
  ): Promise<JiraIssueResult[]> {
    const results: JiraIssueResult[] = [];
    const activeSprintId = await this.getActiveSprintId();

    for (const owner of plan.ownerBreakdown) {
      const member = this.teamMembers.find(
        (m) => m.name.toLowerCase() === owner.name.toLowerCase(),
      );

      if (!member) {
        this.logger.warn(
          { name: owner.name },
          'Team member not found in roster, skipping Jira issue creation',
        );
        continue;
      }

      for (const focus of owner.focuses) {
        for (const task of focus.tasks) {
          try {
            const description = this.buildAdfDescription(task, focus);

            const issue = await this.client.issues.createIssue({
              fields: {
                project: { key: this.projectKey },
                summary: task.title,
                description: description as any,
                issuetype: { name: 'Task' },
                assignee: { accountId: member.jiraAccountId },
                priority: { name: this.mapPriority(task.priority) },
                labels: [
                  'sprint-agent',
                  focus.focusName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, ''),
                ],
              },
            });

            const issueKey = issue.key!;

            // Assign to active sprint if available
            if (activeSprintId) {
              await this.moveToSprint(issueKey, activeSprintId);
            }

            this.logger.info(
              { issueKey, assignee: owner.name, summary: task.title },
              'Jira issue created',
            );

            results.push({
              jiraIssueKey: issueKey,
              assignee: owner.name,
              summary: task.title,
              status: 'created',
            });
          } catch (error) {
            this.logger.error(
              {
                assignee: owner.name,
                task: task.title,
                error: (error as Error).message,
              },
              'Failed to create Jira issue',
            );

            results.push({
              jiraIssueKey: 'FAILED',
              assignee: owner.name,
              summary: task.title,
              status: `error: ${(error as Error).message}`,
            });
          }
        }
      }
    }

    this.logger.info(
      {
        totalCreated: results.filter((r) => r.status === 'created').length,
        totalFailed: results.filter((r) => r.status !== 'created').length,
      },
      'Jira issue creation complete',
    );

    return results;
  }

  private buildAdfDescription(
    task: SprintPlanOutput['ownerBreakdown'][0]['focuses'][0]['tasks'][0],
    focus: SprintPlanOutput['ownerBreakdown'][0]['focuses'][0],
  ): Record<string, unknown> {
    const content: Record<string, unknown>[] = [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Focus: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: focus.focusName },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Goal: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: focus.goal },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Points: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: `${task.points}` },
          { type: 'text', text: ' | ' },
          { type: 'text', text: 'Priority: ', marks: [{ type: 'strong' }] },
          { type: 'text', text: task.priority },
        ],
      },
      { type: 'rule' },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: task.description }],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Acceptance Criteria' }],
      },
      {
        type: 'taskList',
        attrs: { localId: 'ac-list' },
        content: task.acceptanceCriteria.map((criterion) => ({
          type: 'taskItem',
          attrs: { localId: `ac-${Math.random().toString(36).slice(2)}`, state: 'TODO' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: criterion }],
            },
          ],
        })),
      },
    ];

    return {
      type: 'doc',
      version: 1,
      content,
    };
  }

  private mapPriority(priority: string): string {
    const map: Record<string, string> = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };
    return map[priority] || 'Medium';
  }

  private async getActiveSprintId(): Promise<number | null> {
    try {
      const response = await (this.client as any).board.getAllSprints({
        boardId: this.boardId,
        state: 'active',
      });

      const activeSprints = response.values || [];
      if (activeSprints.length === 0) {
        this.logger.warn('No active sprint found');
        return null;
      }

      return activeSprints[0].id!;
    } catch (error) {
      this.logger.warn(
        { error: (error as Error).message },
        'Failed to get active sprint',
      );
      return null;
    }
  }

  private async moveToSprint(
    issueKey: string,
    sprintId: number,
  ): Promise<void> {
    try {
      await (this.client as any).sprint.moveIssuesToSprintAndRank({
        sprintId,
        issues: [issueKey],
      });
    } catch (error) {
      this.logger.warn(
        { issueKey, sprintId, error: (error as Error).message },
        'Failed to move issue to sprint',
      );
    }
  }
}
