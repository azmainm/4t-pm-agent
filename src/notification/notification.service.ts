import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class NotificationService {
  private webhookUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('NotificationService');
    this.webhookUrl = this.configService.get<string>('teams.webhookUrl')!;
  }

  async sendSprintPlanReady(
    planId: string,
    fileName: string,
    dateRange: { start: string; end: string },
  ): Promise<void> {
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

  async sendApprovalConfirmation(
    planId: string,
    issueCount: number,
  ): Promise<void> {
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

  async sendError(context: string, error: string, requestId?: string): Promise<void> {
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

  private async postToWebhook(payload: unknown): Promise<void> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      this.logger.error(
        { status: response.status, statusText: response.statusText },
        'Failed to send Teams notification',
      );
    }
  }
}
