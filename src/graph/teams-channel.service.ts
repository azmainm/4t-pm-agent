import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';

export interface TeamsMessageData {
  messageId: string;
  source: 'channel';
  channelOrChatId: string;
  channelOrChatName: string;
  senderName: string;
  senderEmail: string;
  content: string;
  htmlContent: string;
  sentAt: Date;
  parentMessageId?: string;
  mentions: string[];
  isReply: boolean;
}

@Injectable()
export class TeamsChannelService {
  constructor(
    private readonly graphClient: GraphClientService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('TeamsChannelService');
  }

  async fetchAllChannelMessages(startDate: Date, endDate: Date): Promise<TeamsMessageData[]> {
    const daysBack = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return this.fetchRecentMessages(daysBack);
  }

  async fetchRecentMessages(daysBack: number): Promise<TeamsMessageData[]> {
    const teamId = this.configService.get<string>('teams.teamId')!;
    const channelIds = this.configService.get<string[]>('teams.channelIds')!;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const allMessages: TeamsMessageData[] = [];

    for (const channelId of channelIds) {
      this.logger.info({ channelId, daysBack }, 'Fetching channel messages');

      try {
        const messages = await this.fetchChannelMessages(
          teamId,
          channelId,
          cutoffDate,
        );
        allMessages.push(...messages);
        this.logger.info(
          { channelId, messageCount: messages.length },
          'Channel messages fetched',
        );
      } catch (error) {
        this.logger.error(
          { channelId, error: (error as Error).message },
          'Failed to fetch channel messages',
        );
      }
    }

    return allMessages;
  }

  private async fetchChannelMessages(
    teamId: string,
    channelId: string,
    cutoffDate: Date,
  ): Promise<TeamsMessageData[]> {
    const messages: TeamsMessageData[] = [];
    let nextLink: string | undefined =
      `/teams/${teamId}/channels/${channelId}/messages?$top=50`;

    while (nextLink) {
      const response = await this.graphClient.getClient().api(nextLink).get();

      for (const msg of response.value || []) {
        const sentAt = new Date(msg.createdDateTime);
        if (sentAt < cutoffDate) continue;

        messages.push(this.mapMessage(msg, channelId, false));

        // Fetch replies for each message
        if (msg.id) {
          const replies = await this.fetchReplies(
            teamId,
            channelId,
            msg.id,
            cutoffDate,
          );
          messages.push(...replies);
        }
      }

      nextLink = response['@odata.nextLink'] || undefined;
    }

    return messages;
  }

  private async fetchReplies(
    teamId: string,
    channelId: string,
    messageId: string,
    cutoffDate: Date,
  ): Promise<TeamsMessageData[]> {
    const replies: TeamsMessageData[] = [];

    try {
      const response = await this.graphClient
        .getClient()
        .api(
          `/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`,
        )
        .get();

      for (const reply of response.value || []) {
        const sentAt = new Date(reply.createdDateTime);
        if (sentAt < cutoffDate) continue;
        replies.push(this.mapMessage(reply, channelId, true, messageId));
      }
    } catch (error) {
      this.logger.warn(
        { messageId, error: (error as Error).message },
        'Failed to fetch replies',
      );
    }

    return replies;
  }

  private mapMessage(
    msg: Record<string, unknown>,
    channelId: string,
    isReply: boolean,
    parentMessageId?: string,
  ): TeamsMessageData {
    const from = msg.from as Record<string, unknown> | undefined;
    const user = from?.user as Record<string, unknown> | undefined;
    const body = msg.body as Record<string, string> | undefined;

    return {
      messageId: msg.id as string,
      source: 'channel',
      channelOrChatId: channelId,
      channelOrChatName: '',
      senderName: (user?.displayName as string) || 'Unknown',
      senderEmail: (user?.email as string) || '',
      content: this.stripHtml(body?.content || ''),
      htmlContent: body?.content || '',
      sentAt: new Date(msg.createdDateTime as string),
      parentMessageId,
      mentions: this.extractMentions(msg.mentions as Array<Record<string, unknown>> | undefined),
      isReply,
    };
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractMentions(
    mentions: Array<Record<string, unknown>> | undefined,
  ): string[] {
    if (!mentions) return [];
    return mentions
      .map((m) => {
        const mentioned = m.mentioned as Record<string, unknown> | undefined;
        const user = mentioned?.user as Record<string, unknown> | undefined;
        return (user?.displayName as string) || '';
      })
      .filter(Boolean);
  }
}
