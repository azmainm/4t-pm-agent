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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
let NotificationService = class NotificationService {
    configService;
    logger;
    webhookUrl;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('NotificationService');
        this.webhookUrl = this.configService.get('teams.webhookUrl') || '';
    }
    async sendSprintPlanReady(planId, fileName, dateRange) {
        const card = {
            type: 'message',
            attachments: [
                {
                    contentType: 'application/vnd.microsoft.card.adaptive',
                    content: {
                        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                        type: 'AdaptiveCard',
                        version: '1.4',
                        body: [
                            {
                                type: 'TextBlock',
                                text: 'Sprint Plan Ready for Review',
                                weight: 'Bolder',
                                size: 'Large',
                            },
                            {
                                type: 'TextBlock',
                                text: `**${fileName}**`,
                                wrap: true,
                            },
                            {
                                type: 'TextBlock',
                                text: `Sprint: ${dateRange.start} to ${dateRange.end}`,
                                wrap: true,
                            },
                            {
                                type: 'TextBlock',
                                text: `Plan ID: ${planId}`,
                                isSubtle: true,
                                wrap: true,
                            },
                            {
                                type: 'TextBlock',
                                text: 'The sprint plan has been uploaded to OneDrive. Please review and approve from the admin portal to create Jira tasks.',
                                wrap: true,
                            },
                        ],
                    },
                },
            ],
        };
        await this.postToWebhook(card);
        this.logger.info({ planId, fileName }, 'Sprint plan ready notification sent');
    }
    async sendApprovalConfirmation(planId, issueCount) {
        const card = {
            type: 'message',
            attachments: [
                {
                    contentType: 'application/vnd.microsoft.card.adaptive',
                    content: {
                        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                        type: 'AdaptiveCard',
                        version: '1.4',
                        body: [
                            {
                                type: 'TextBlock',
                                text: 'Sprint Plan Approved',
                                weight: 'Bolder',
                                size: 'Large',
                                color: 'Good',
                            },
                            {
                                type: 'TextBlock',
                                text: `${issueCount} Jira issues have been created and assigned.`,
                                wrap: true,
                            },
                            {
                                type: 'TextBlock',
                                text: `Plan ID: ${planId}`,
                                isSubtle: true,
                            },
                        ],
                    },
                },
            ],
        };
        await this.postToWebhook(card);
        this.logger.info({ planId, issueCount }, 'Approval confirmation sent');
    }
    async sendError(context, error, requestId) {
        const card = {
            type: 'message',
            attachments: [
                {
                    contentType: 'application/vnd.microsoft.card.adaptive',
                    content: {
                        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                        type: 'AdaptiveCard',
                        version: '1.4',
                        body: [
                            {
                                type: 'TextBlock',
                                text: 'PM Agent Error',
                                weight: 'Bolder',
                                size: 'Large',
                                color: 'Attention',
                            },
                            {
                                type: 'TextBlock',
                                text: `**Context:** ${context}`,
                                wrap: true,
                            },
                            {
                                type: 'TextBlock',
                                text: `**Error:** ${error}`,
                                wrap: true,
                            },
                            ...(requestId
                                ? [
                                    {
                                        type: 'TextBlock',
                                        text: `**Request ID:** ${requestId}`,
                                        isSubtle: true,
                                    },
                                ]
                                : []),
                        ],
                    },
                },
            ],
        };
        await this.postToWebhook(card);
        this.logger.info({ context, requestId }, 'Error notification sent');
    }
    async postToWebhook(payload) {
        if (!this.webhookUrl) {
            this.logger.warn('Teams webhook URL not configured, skipping notification');
            return;
        }
        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            this.logger.error({ status: response.status, statusText: response.statusText }, 'Failed to send Teams notification');
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], NotificationService);
//# sourceMappingURL=notification.service.js.map