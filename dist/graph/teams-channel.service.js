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
exports.TeamsChannelService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const graph_client_service_js_1 = require("./graph-client.service.js");
let TeamsChannelService = class TeamsChannelService {
    graphClient;
    configService;
    logger;
    constructor(graphClient, configService, logger) {
        this.graphClient = graphClient;
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('TeamsChannelService');
    }
    async fetchAllChannelMessages(startDate, endDate) {
        const daysBack = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return this.fetchRecentMessages(daysBack);
    }
    async fetchRecentMessages(daysBack) {
        const teamId = this.configService.get('teams.teamId');
        const targetUserId = this.configService.get('azure.targetUserId');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        this.logger.info({ teamId }, 'Fetching all channels in team');
        const channelsResponse = await this.graphClient
            .getClient()
            .api(`/teams/${teamId}/channels`)
            .get();
        const channels = channelsResponse.value || [];
        this.logger.info({ channelCount: channels.length }, 'Found channels');
        const allMessages = [];
        for (const channel of channels) {
            const channelId = channel.id;
            const channelName = channel.displayName;
            this.logger.info({ channelId, channelName, daysBack }, 'Fetching channel messages');
            try {
                const messages = await this.fetchChannelMessages(teamId, channelId, channelName, cutoffDate);
                allMessages.push(...messages);
                this.logger.info({ channelId, messageCount: messages.length }, 'Channel messages fetched');
            }
            catch (error) {
                this.logger.error({ channelId, error: error.message }, 'Failed to fetch channel messages');
            }
        }
        return allMessages;
    }
    async fetchChannelMessages(teamId, channelId, channelName, cutoffDate) {
        const messages = [];
        let nextLink = `/teams/${teamId}/channels/${channelId}/messages?$top=50`;
        while (nextLink) {
            const response = await this.graphClient.getClient().api(nextLink).get();
            for (const msg of response.value || []) {
                const sentAt = new Date(msg.createdDateTime);
                if (sentAt < cutoffDate)
                    continue;
                messages.push(this.mapMessage(msg, channelId, channelName, false));
                if (msg.id) {
                    const replies = await this.fetchReplies(teamId, channelId, channelName, msg.id, cutoffDate);
                    messages.push(...replies);
                }
            }
            nextLink = response['@odata.nextLink'] || undefined;
        }
        return messages;
    }
    async fetchReplies(teamId, channelId, channelName, messageId, cutoffDate) {
        const replies = [];
        try {
            const response = await this.graphClient
                .getClient()
                .api(`/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`)
                .get();
            for (const reply of response.value || []) {
                const sentAt = new Date(reply.createdDateTime);
                if (sentAt < cutoffDate)
                    continue;
                replies.push(this.mapMessage(reply, channelId, channelName, true, messageId));
            }
        }
        catch (error) {
            this.logger.warn({ messageId, error: error.message }, 'Failed to fetch replies');
        }
        return replies;
    }
    mapMessage(msg, channelId, channelName, isReply, parentMessageId) {
        const from = msg.from;
        const user = from?.user;
        const body = msg.body;
        return {
            messageId: msg.id,
            source: 'channel',
            channelOrChatId: channelId,
            channelOrChatName: channelName,
            senderName: user?.displayName || 'Unknown',
            senderEmail: user?.email || '',
            content: this.stripHtml(body?.content || ''),
            htmlContent: body?.content || '',
            sentAt: new Date(msg.createdDateTime),
            parentMessageId,
            mentions: this.extractMentions(msg.mentions),
            isReply,
        };
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
    extractMentions(mentions) {
        if (!mentions)
            return [];
        return mentions
            .map((m) => {
            const mentioned = m.mentioned;
            const user = mentioned?.user;
            return user?.displayName || '';
        })
            .filter(Boolean);
    }
};
exports.TeamsChannelService = TeamsChannelService;
exports.TeamsChannelService = TeamsChannelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graph_client_service_js_1.GraphClientService,
        config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], TeamsChannelService);
//# sourceMappingURL=teams-channel.service.js.map