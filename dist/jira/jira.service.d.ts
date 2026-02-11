import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import type { SprintPlanOutput } from '../llm/dto/sprint-plan-output.dto.js';
export interface JiraIssueResult {
    jiraIssueKey: string;
    assignee: string;
    summary: string;
    status: string;
    browserUrl?: string;
}
export declare class JiraService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private client;
    private projectKey;
    private boardId;
    private teamMembers;
    constructor(configService: ConfigService, logger: PinoLogger);
    onModuleInit(): void;
    createIssuesForPlan(plan: SprintPlanOutput): Promise<JiraIssueResult[]>;
    private buildAdfDescription;
    private mapPriority;
    private getActiveSprintId;
    private moveToSprint;
}
