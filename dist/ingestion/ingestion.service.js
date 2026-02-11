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
exports.IngestionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const crypto_1 = require("crypto");
const summarization_service_js_1 = require("../llm/summarization.service.js");
const standup_tickets_repository_js_1 = require("../database/repositories/standup-tickets.repository.js");
const daily_summary_repository_js_1 = require("../database/repositories/daily-summary.repository.js");
const agent_run_repository_js_1 = require("../database/repositories/agent-run.repository.js");
const notification_service_js_1 = require("../notification/notification.service.js");
let IngestionService = class IngestionService {
    configService;
    logger;
    summarizationService;
    standupTicketsRepo;
    summaryRepo;
    agentRunRepo;
    notificationService;
    constructor(configService, logger, summarizationService, standupTicketsRepo, summaryRepo, agentRunRepo, notificationService) {
        this.configService = configService;
        this.logger = logger;
        this.summarizationService = summarizationService;
        this.standupTicketsRepo = standupTicketsRepo;
        this.summaryRepo = summaryRepo;
        this.agentRunRepo = agentRunRepo;
        this.notificationService = notificationService;
        this.logger.setContext('IngestionService');
    }
    async runDailyIngestion() {
        const runId = (0, crypto_1.randomUUID)();
        const startedAt = new Date();
        this.logger.info({ runId, event: 'ingestion.started' });
        const agentRun = await this.agentRunRepo.create({
            runId,
            runType: 'ingestion',
            startedAt,
            status: 'running',
            steps: [],
        });
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            this.logger.info({ runId, event: 'ingestion.fetch_transcript', date: today });
            const transcript = await this.standupTicketsRepo.findByDate(today);
            if (!transcript) {
                this.logger.warn({ runId, event: 'ingestion.no_transcript', date: today });
                await this.agentRunRepo.updateStatus(runId, 'completed', {});
                return {
                    runId,
                    success: true,
                    summaryGenerated: false,
                };
            }
            await this.agentRunRepo.addStep(runId, {
                stepName: 'fetch_transcript',
                startedAt: new Date(),
                completedAt: new Date(),
                success: true,
                metadata: { transcriptId: transcript._id, segmentCount: transcript.transcript_data.length },
            });
            this.logger.info({ runId, transcriptId: transcript._id, event: 'ingestion.transcript.found' });
            const existingSummary = await this.summaryRepo.findByDate(today);
            if (existingSummary) {
                this.logger.info({ runId, event: 'ingestion.summary.exists' });
                await this.agentRunRepo.updateStatus(runId, 'completed', {});
                return {
                    runId,
                    success: true,
                    summaryGenerated: false,
                    transcriptId: transcript._id,
                };
            }
            this.logger.info({ runId, event: 'ingestion.summary.start' });
            const transcriptData = Array.isArray(transcript.transcript_data)
                ? transcript.transcript_data
                : [];
            const summary = await this.summarizationService.summarizeTranscript({
                segments: transcriptData.map((seg) => ({
                    speaker: seg.speaker,
                    timestamp: seg.timestamp,
                    text: seg.text,
                    startTime: seg.timestamp,
                    endTime: seg.timestamp,
                })),
                participants: [],
            });
            await this.agentRunRepo.addStep(runId, {
                stepName: 'generate_summary',
                startedAt: new Date(),
                completedAt: new Date(),
                success: true,
                metadata: { model: 'gpt-5-nano' },
            });
            const savedSummary = await this.summaryRepo.create({
                date: today,
                transcriptId: transcript._id,
                overallSummary: summary.overallSummary,
                actionItems: summary.actionItems,
                decisions: summary.decisions,
                blockers: summary.blockers,
                perPersonSummary: summary.perPersonSummary.map(p => ({
                    name: p.person,
                    summary: p.progressItems.join('; '),
                    nextSteps: p.commitments,
                })),
                upcomingWork: summary.upcomingWork || [],
                generatedAt: new Date(),
            });
            await this.agentRunRepo.addStep(runId, {
                stepName: 'save_summary',
                startedAt: new Date(),
                completedAt: new Date(),
                success: true,
                metadata: { summaryId: savedSummary._id.toString() },
            });
            this.logger.info({
                runId,
                transcriptId: transcript._id,
                summaryId: savedSummary._id.toString(),
                event: 'ingestion.summary.saved',
            });
            await this.agentRunRepo.updateStatus(runId, 'completed', {});
            return {
                runId,
                success: true,
                summaryGenerated: true,
                transcriptId: transcript._id,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error({ runId, error: errorMessage }, 'Daily ingestion failed');
            await this.agentRunRepo.updateStatus(runId, 'failed', {
                error: errorMessage,
            });
            await this.notificationService.sendError('Daily Ingestion', errorMessage, runId);
            return {
                runId,
                success: false,
                summaryGenerated: false,
                error: errorMessage,
            };
        }
    }
};
exports.IngestionService = IngestionService;
exports.IngestionService = IngestionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_pino_1.PinoLogger,
        summarization_service_js_1.SummarizationService,
        standup_tickets_repository_js_1.StandupTicketsRepository,
        daily_summary_repository_js_1.DailySummaryRepository,
        agent_run_repository_js_1.AgentRunRepository,
        notification_service_js_1.NotificationService])
], IngestionService);
//# sourceMappingURL=ingestion.service.js.map