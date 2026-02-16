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
exports.TeamsChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const graph_client_service_js_1 = require("./graph-client.service.js");
let TeamsChatService = class TeamsChatService {
    graphClient;
    configService;
    logger;
    constructor(graphClient, configService, logger) {
        this.graphClient = graphClient;
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('TeamsChatService');
    }
    async fetchAllChatMessages(startDate, endDate) {
        const daysBack = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return this.fetchRecentMessages(daysBack);
    }
    async fetchRecentMessages(daysBack) {
        const targetUserId = this.configService.get('azure.targetUserId');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        this.logger.info({ targetUserId }, 'Fetching all chats for user');
        const chatsResponse = await this.graphClient
            .getClient()
            .api(`/users/${targetUserId}/chats`)
            .get();
        const chats = chatsResponse.value || [];
        this.logger.info({ chatCount: chats.length }, 'Found chats');
        const allMessages = [];
        for (const chat of chats) {
            const chatId = chat.id;
            const chatName = chat.topic || 'Unnamed Chat';
            this.logger.info({ chatId, chatName, daysBack }, 'Fetching chat messages');
            try {
                const messages = await this.fetchChatMessages(targetUserId, chatId, chatName, cutoffDate);
                allMessages.push(...messages);
                this.logger.info({ chatId, messageCount: messages.length }, 'Chat messages fetched');
            }
            catch (error) {
                this.logger.error({ chatId, error: error.message }, 'Failed to fetch chat messages');
            }
        }
        return allMessages;
    }
    async fetchChatMessages(userId, chatId, chatName, cutoffDate) {
        const messages = [];
        let nextLink = `/users/${userId}/chats/${chatId}/messages?$top=50`;
        while (nextLink) {
            const response = await this.graphClient.getClient().api(nextLink).get();
            for (const msg of response.value || []) {
                const sentAt = new Date(msg.createdDateTime);
                if (sentAt < cutoffDate)
                    continue;
                const from = msg.from;
                const user = from?.user;
                const body = msg.body;
                messages.push({
                    messageId: msg.id,
                    source: 'chat',
                    channelOrChatId: chatId,
                    channelOrChatName: chatName,
                    senderName: user?.displayName || 'Unknown',
                    senderEmail: user?.email || '',
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
    stripHtml(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();
    }
};
exports.TeamsChatService = TeamsChatService;
exports.TeamsChatService = TeamsChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graph_client_service_js_1.GraphClientService,
        config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], TeamsChatService);
//# sourceMappingURL=teams-chat.service.js.map