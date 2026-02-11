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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenaiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const openai_1 = __importDefault(require("openai"));
let OpenaiService = class OpenaiService {
    configService;
    logger;
    client;
    model;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('OpenaiService');
        this.client = new openai_1.default({
            apiKey: this.configService.get('openai.apiKey'),
        });
        this.model = this.configService.get('openai.model', 'gpt-5-nano');
    }
    async chatCompletion(params) {
        const model = params.model || this.model;
        const startTime = Date.now();
        const isGpt5Model = /^gpt-5-/i.test(model);
        this.logger.debug({ model, messageCount: params.messages.length, useResponsesApi: isGpt5Model }, 'OpenAI chat completion request');
        let response;
        if (isGpt5Model) {
            const combinedInput = params.messages
                .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
                .join('\n\n');
            const apiResponse = await fetch('https://api.openai.com/v1/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.configService.get('openai.apiKey')}`,
                },
                body: JSON.stringify({
                    model,
                    input: combinedInput,
                    max_output_tokens: params.max_tokens || 4000,
                    reasoning: { effort: 'minimal' },
                }),
            });
            if (!apiResponse.ok) {
                const error = await apiResponse.text();
                throw new Error(`OpenAI Responses API error: ${apiResponse.status} ${error}`);
            }
            const data = await apiResponse.json();
            this.logger.debug({ responsesApiData: data }, 'Raw Responses API response');
            let content = '';
            if (Array.isArray(data.output)) {
                const messageObj = data.output.find((item) => item.type === 'message');
                if (messageObj && Array.isArray(messageObj.content)) {
                    const textObj = messageObj.content.find((item) => item.type === 'output_text');
                    if (textObj && textObj.text) {
                        content = textObj.text;
                    }
                }
            }
            else {
                content = data.output || data.content || '';
            }
            this.logger.debug({ contentLength: content.length, contentType: typeof content }, 'Extracted content from Responses API');
            response = {
                id: data.id || 'resp-' + Date.now(),
                object: 'chat.completion',
                created: data.created || Math.floor(Date.now() / 1000),
                model,
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content,
                        },
                        finish_reason: 'stop',
                        logprobs: null,
                    },
                ],
                usage: data.usage || {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0,
                },
            };
        }
        else {
            response = await this.client.chat.completions.create({
                ...params,
                model,
            });
        }
        const durationMs = Date.now() - startTime;
        this.logger.info({
            model,
            durationMs,
            inputTokens: response.usage?.prompt_tokens,
            outputTokens: response.usage?.completion_tokens,
            finishReason: response.choices[0]?.finish_reason,
        }, 'OpenAI chat completion response');
        return response;
    }
    getDefaultModel() {
        return this.model;
    }
};
exports.OpenaiService = OpenaiService;
exports.OpenaiService = OpenaiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], OpenaiService);
//# sourceMappingURL=openai.service.js.map