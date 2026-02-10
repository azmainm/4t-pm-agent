import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';

export interface TeamsChatMessageData {
  messageId: string;
  source: 'chat';
  channelOrChatId: string;
  channelOrChatName: string;
  senderName: string;
  senderEmail: string;
  content: string;
  htmlContent: string;
  sentAt: Date;
  mentions: string[];
  isReply: boolean;
}

@Injectable()
export class TeamsChatService {
  constructor(
    private readonly graphClient: GraphClientService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('TeamsChatService');
  }

  async fetchAllChatMessages(startDate: Date, endDate: Date): Promise<TeamsChatMessageData[]> {
    const daysBack = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return this.fetchRecentMessages(daysBack);
  }

  async fetchRecentMessages(daysBack: number): Promise<TeamsChatMessageData[]> {
    const targetUserId = this.configService.get<string>('azure.targetUserId')!;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // First, get ALL chats for the user
    this.logger.info({ targetUserId }, 'Fetching all chats for user');
    const chatsResponse = await this.graphClient
      .getClient()
      .api(`/users/${targetUserId}/chats`)
      .get();

    const chats = chatsResponse.value || [];
    this.logger.info({ chatCount: chats.length }, 'Found chats');

    const allMessages: TeamsChatMessageData[] = [];

    for (const chat of chats) {
      const chatId = chat.id;
      const chatName = chat.topic || 'Unnamed Chat';
      this.logger.info({ chatId, chatName, daysBack }, 'Fetching chat messages');

      try {
        const messages = await this.fetchChatMessages(
          targetUserId,
          chatId,
          cutoffDate,
        );
        allMessages.push(...messages);
        this.logger.info(
          { chatId, messageCount: messages.length },
          'Chat messages fetched',
        );
      } catch (error) {
        this.logger.error(
          { chatId, error: (error as Error).message },
          'Failed to fetch chat messages',
        );
      }
    }

    return allMessages;
  }

  private async fetchChatMessages(
    userId: string,
    chatId: string,
    cutoffDate: Date,
  ): Promise<TeamsChatMessageData[]> {
    const messages: TeamsChatMessageData[] = [];
    let nextLink: string | undefined =
      `/users/${userId}/chats/${chatId}/messages?$top=50`;

    while (nextLink) {
      const response = await this.graphClient.getClient().api(nextLink).get();

      for (const msg of response.value || []) {
        const sentAt = new Date(msg.createdDateTime);
        if (sentAt < cutoffDate) continue;

        const from = msg.from as Record<string, unknown> | undefined;
        const user = from?.user as Record<string, unknown> | undefined;
        const body = msg.body as Record<string, string> | undefined;

        messages.push({
          messageId: msg.id as string,
          source: 'chat',
          channelOrChatId: chatId,
          channelOrChatName: '',
          senderName: (user?.displayName as string) || 'Unknown',
          senderEmail: (user?.email as string) || '',
          content: this.stripHtml(body?.content || ''),
          htmlContent: body?.content || '',
          sentAt,
          mentions: [],
          isReply: false,
        });
      }

      nextLink = response['@odata.nextLink'] || undefined;
    }

    return messages;
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
}
