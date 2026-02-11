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
exports.TranscriptService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const graph_client_service_js_1 = require("./graph-client.service.js");
const RETRY_DELAY_MS = 300_000;
const MAX_RETRIES = 3;
let TranscriptService = class TranscriptService {
    graphClient;
    configService;
    logger;
    constructor(graphClient, configService, logger) {
        this.graphClient = graphClient;
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('TranscriptService');
    }
    extractMeetingId(joinUrl) {
        const url = new URL(joinUrl);
        const pathParts = url.pathname.split('/');
        const encodedId = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
        return decodeURIComponent(encodedId);
    }
    async fetchOnlineMeetingId(joinUrl) {
        const targetUserId = this.configService.get('azure.targetUserId');
        const encodedJoinUrl = encodeURIComponent(joinUrl);
        const response = await this.graphClient
            .getClient()
            .api(`/users/${targetUserId}/onlineMeetings`)
            .filter(`JoinWebUrl eq '${joinUrl}'`)
            .select('id')
            .get();
        if (!response.value || response.value.length === 0) {
            throw new Error(`No online meeting found for join URL: ${joinUrl}`);
        }
        return response.value[0].id;
    }
    async fetchTranscript(meetingId) {
        const targetUserId = this.configService.get('azure.targetUserId');
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                this.logger.info({ meetingId, attempt }, 'Fetching transcript');
                const transcriptsResponse = await this.graphClient
                    .getClient()
                    .api(`/users/${targetUserId}/onlineMeetings/${meetingId}/transcripts`)
                    .get();
                const transcripts = transcriptsResponse.value || [];
                if (transcripts.length === 0) {
                    if (attempt < MAX_RETRIES) {
                        this.logger.warn({ meetingId, attempt, retryInMs: RETRY_DELAY_MS }, 'No transcripts available yet, retrying');
                        await this.delay(RETRY_DELAY_MS);
                        continue;
                    }
                    throw new Error(`No transcripts available for meeting ${meetingId} after ${MAX_RETRIES} retries`);
                }
                const transcriptId = transcripts[0].id;
                const vttContent = await this.graphClient
                    .getClient()
                    .api(`/users/${targetUserId}/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content`)
                    .query({ $format: 'text/vtt' })
                    .get();
                this.logger.info({ meetingId, transcriptId, contentLength: vttContent.length }, 'Transcript fetched successfully');
                return vttContent;
            }
            catch (error) {
                if (attempt < MAX_RETRIES &&
                    error instanceof Error &&
                    (error.message.includes('404') ||
                        error.message.includes('Not Found'))) {
                    this.logger.warn({ meetingId, attempt, error: error.message }, 'Transcript not yet available, retrying');
                    await this.delay(RETRY_DELAY_MS);
                    continue;
                }
                throw error;
            }
        }
        throw new Error(`Failed to fetch transcript for meeting ${meetingId}`);
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.TranscriptService = TranscriptService;
exports.TranscriptService = TranscriptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graph_client_service_js_1.GraphClientService,
        config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], TranscriptService);
//# sourceMappingURL=transcript.service.js.map