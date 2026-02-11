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
exports.SummarizationService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const openai_service_js_1 = require("./openai.service.js");
const summarization_prompt_js_1 = require("./agent/prompts/summarization-prompt.js");
let SummarizationService = class SummarizationService {
    openaiService;
    logger;
    constructor(openaiService, logger) {
        this.openaiService = openaiService;
        this.logger = logger;
        this.logger.setContext('SummarizationService');
    }
    async summarizeTranscript(transcript) {
        const transcriptText = transcript.segments
            .map((s) => `${s.speaker}: ${s.text}`)
            .join('\n');
        this.logger.info({
            participants: transcript.participants,
            segmentCount: transcript.segments.length,
            textLength: transcriptText.length,
        }, 'Summarizing transcript');
        const response = await this.openaiService.chatCompletion({
            messages: [
                { role: 'system', content: summarization_prompt_js_1.SUMMARIZATION_PROMPT },
                { role: 'user', content: transcriptText },
            ],
            response_format: { type: 'json_object' },
        });
        const content = response.choices[0].message.content || '{}';
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        this.logger.info({
            actionItems: parsed.actionItems?.length || 0,
            decisions: parsed.decisions?.length || 0,
            blockers: parsed.blockers?.length || 0,
        }, 'Transcript summarized');
        return {
            overallSummary: parsed.overallSummary || '',
            perPersonSummary: parsed.perPersonSummary || [],
            actionItems: parsed.actionItems || [],
            decisions: parsed.decisions || [],
            blockers: parsed.blockers || [],
            keyTopics: parsed.keyTopics || [],
            upcomingWork: parsed.upcomingWork || [],
            llmModel: this.openaiService.getDefaultModel(),
            inputTokens: response.usage?.prompt_tokens || 0,
            outputTokens: response.usage?.completion_tokens || 0,
        };
    }
};
exports.SummarizationService = SummarizationService;
exports.SummarizationService = SummarizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_service_js_1.OpenaiService,
        nestjs_pino_1.PinoLogger])
], SummarizationService);
//# sourceMappingURL=summarization.service.js.map