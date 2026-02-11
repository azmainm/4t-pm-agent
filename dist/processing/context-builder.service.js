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
exports.ContextBuilderService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
let ContextBuilderService = class ContextBuilderService {
    logger;
    constructor(logger) {
        this.logger = logger;
        this.logger.setContext('ContextBuilderService');
    }
    buildSprintPlanContext(input) {
        const sections = [];
        sections.push('=== DAILY STANDUP SUMMARIES (Last 2 Weeks) ===\n');
        for (const summary of input.dailySummaries) {
            const dateStr = summary.date.toISOString().split('T')[0];
            sections.push(`--- ${dateStr} ---`);
            sections.push(summary.overallSummary);
            if (summary.actionItems.length > 0) {
                sections.push('\nAction Items:');
                summary.actionItems.forEach((item) => sections.push(`  - ${item}`));
            }
            if (summary.decisions.length > 0) {
                sections.push('\nDecisions:');
                summary.decisions.forEach((d) => sections.push(`  - ${d}`));
            }
            if (summary.blockers.length > 0) {
                sections.push('\nBlockers:');
                summary.blockers.forEach((b) => sections.push(`  - ${b}`));
            }
            sections.push('\nPer Person:');
            for (const person of summary.perPersonSummary) {
                sections.push(`  ${person.person}:`);
                person.progressItems.forEach((p) => sections.push(`    Progress: ${p}`));
                person.blockers.forEach((b) => sections.push(`    Blocker: ${b}`));
                person.commitments.forEach((c) => sections.push(`    Commitment: ${c}`));
            }
            sections.push('');
        }
        sections.push('\n=== TEAMS MESSAGES (Last 2 Weeks) ===\n');
        const sortedMessages = [...input.teamsMessages].sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
        for (const msg of sortedMessages) {
            const dateStr = msg.sentAt.toISOString().split('T')[0];
            sections.push(`[${dateStr}] [${msg.source}:${msg.channelOrChatName}] ${msg.senderName}: ${msg.content}`);
        }
        if (input.previousPlanText) {
            sections.push('\n=== PREVIOUS SPRINT PLAN ===\n');
            sections.push(input.previousPlanText);
        }
        const context = sections.join('\n');
        const estimatedTokens = Math.ceil(context.length / 4);
        this.logger.info({
            summaryCount: input.dailySummaries.length,
            messageCount: input.teamsMessages.length,
            previousPlanFound: !!input.previousPlanText,
            contextLength: context.length,
            estimatedTokens,
        }, 'Sprint plan context built');
        return context;
    }
};
exports.ContextBuilderService = ContextBuilderService;
exports.ContextBuilderService = ContextBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], ContextBuilderService);
//# sourceMappingURL=context-builder.service.js.map