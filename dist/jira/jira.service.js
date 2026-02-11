"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const jira_js_1 = require("jira.js");
let JiraService = class JiraService {
    configService;
    logger;
    client;
    projectKey;
    boardId;
    teamMembers;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('JiraService');
    }
    onModuleInit() {
        this.client = new jira_js_1.Version3Client({
            host: this.configService.get('jira.host'),
            authentication: {
                basic: {
                    email: this.configService.get('jira.email'),
                    apiToken: this.configService.get('jira.apiToken'),
                },
            },
        });
        this.projectKey = this.configService.get('jira.projectKey');
        this.boardId = this.configService.get('jira.boardId');
        this.teamMembers = this.configService.get('roster.members');
        this.logger.info({ projectKey: this.projectKey }, 'Jira client initialized');
    }
    async createIssuesForPlan(plan) {
        const results = [];
        const activeSprintId = await this.getActiveSprintId();
        for (const owner of plan.ownerBreakdown) {
            const member = this.teamMembers.find((m) => m.name.toLowerCase() === owner.name.toLowerCase());
            if (!member) {
                this.logger.warn({ name: owner.name }, 'Team member not found in roster, skipping Jira issue creation');
                continue;
            }
            for (const focus of owner.focuses) {
                for (const task of focus.tasks) {
                    try {
                        const description = this.buildAdfDescription(task, focus);
                        this.logger.debug({
                            projectKey: this.projectKey,
                            summary: task.title,
                            assigneeId: member.jiraAccountId,
                            priority: this.mapPriority(task.priority),
                        }, 'Creating Jira issue');
                        const issue = await this.client.issues.createIssue({
                            fields: {
                                project: { key: this.projectKey },
                                summary: task.title,
                                description: description,
                                issuetype: { name: 'Task' },
                                assignee: member.jiraAccountId ? { accountId: member.jiraAccountId } : undefined,
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
                        const issueKey = issue.key;
                        if (activeSprintId) {
                            try {
                                await this.moveToSprint(issueKey, activeSprintId);
                                this.logger.info({ issueKey, sprintId: activeSprintId }, 'Issue added to sprint');
                            }
                            catch (sprintError) {
                                this.logger.warn({ issueKey, error: sprintError.message }, 'Failed to add issue to sprint (issue still created)');
                            }
                        }
                        try {
                            await this.client.issues.doTransition({
                                issueIdOrKey: issueKey,
                                transition: {
                                    id: '11',
                                },
                            });
                            this.logger.info({ issueKey }, 'Issue status set to TO DO');
                        }
                        catch (statusError) {
                            this.logger.warn({ issueKey, error: statusError.message }, 'Failed to set issue status to TO DO (issue still created)');
                        }
                        this.logger.info({ issueKey, assignee: owner.name, summary: task.title }, 'Jira issue created');
                        results.push({
                            jiraIssueKey: issueKey,
                            assignee: owner.name,
                            summary: task.title,
                            status: 'created',
                            browserUrl: `${this.configService.get('jira.host')}/browse/${issueKey}`,
                        });
                    }
                    catch (error) {
                        const errorMessage = error.response?.data
                            ? JSON.stringify(error.response.data)
                            : error.message;
                        this.logger.error({
                            assignee: owner.name,
                            task: task.title,
                            error: errorMessage,
                        }, 'Failed to create Jira issue');
                        results.push({
                            jiraIssueKey: 'FAILED',
                            assignee: owner.name,
                            summary: task.title,
                            status: `error: ${errorMessage}`,
                        });
                    }
                }
            }
        }
        this.logger.info({
            totalCreated: results.filter((r) => r.status === 'created').length,
            totalFailed: results.filter((r) => r.status !== 'created').length,
        }, 'Jira issue creation complete');
        return results;
    }
    buildAdfDescription(task, focus) {
        const content = [
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
            {
                type: 'rule',
            },
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
                type: 'bulletList',
                content: task.acceptanceCriteria.map((criterion) => ({
                    type: 'listItem',
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
    mapPriority(priority) {
        const map = {
            high: 'High',
            medium: 'Medium',
            low: 'Low',
        };
        return map[priority] || 'Medium';
    }
    async getActiveSprintId() {
        try {
            const url = `/rest/agile/1.0/board/${this.boardId}/sprint?state=active`;
            const response = await this.client.sendRequest({
                url,
                method: 'GET',
            }, (response) => response);
            const activeSprints = response?.values || [];
            if (activeSprints.length === 0) {
                this.logger.warn('No active sprint found');
                return null;
            }
            return activeSprints[0].id;
        }
        catch (error) {
            this.logger.warn({ error: error.message }, 'Failed to get active sprint');
            return null;
        }
    }
    async moveToSprint(issueKey, sprintId) {
        try {
            await this.client.sprint.moveIssuesToSprintAndRank({
                sprintId,
                issues: [issueKey],
            });
        }
        catch (error) {
            this.logger.warn({ issueKey, sprintId, error: error.message }, 'Failed to move issue to sprint');
        }
    }
};
exports.JiraService = JiraService;
exports.JiraService = JiraService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], JiraService);
//# sourceMappingURL=jira.service.js.map