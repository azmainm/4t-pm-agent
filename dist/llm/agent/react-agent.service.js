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
exports.ReactAgentService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const openai_service_js_1 = require("../openai.service.js");
const agent_tools_registry_js_1 = require("./agent-tools.registry.js");
const sprint_plan_output_dto_js_1 = require("../dto/sprint-plan-output.dto.js");
const MAX_ITERATIONS = 15;
const MAX_VALIDATION_RETRIES = 2;
let ReactAgentService = class ReactAgentService {
    openaiService;
    toolsRegistry;
    logger;
    constructor(openaiService, toolsRegistry, logger) {
        this.openaiService = openaiService;
        this.toolsRegistry = toolsRegistry;
        this.logger = logger;
        this.logger.setContext('ReactAgentService');
    }
    async runSprintPlanAgent(systemPrompt, userMessage) {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ];
        const iterations = [];
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let finalPlan = null;
        for (let i = 0; i < MAX_ITERATIONS; i++) {
            this.logger.info({ iteration: i }, 'Agent iteration starting');
            const response = await this.openaiService.chatCompletion({
                messages,
                tools: this.toolsRegistry.getToolDefinitions(),
                tool_choice: 'auto',
                temperature: 0.3,
            });
            const message = response.choices[0].message;
            const inputTokens = response.usage?.prompt_tokens || 0;
            const outputTokens = response.usage?.completion_tokens || 0;
            totalInputTokens += inputTokens;
            totalOutputTokens += outputTokens;
            messages.push(message);
            const toolCallNames = (message.tool_calls || []).map((tc) => tc.function.name);
            iterations.push({
                iteration: i,
                toolCalls: toolCallNames,
                inputTokens,
                outputTokens,
                finishReason: response.choices[0].finish_reason || 'unknown',
            });
            this.logger.info({
                iteration: i,
                toolCalls: toolCallNames,
                finishReason: response.choices[0].finish_reason,
            }, 'Agent iteration complete');
            if (!message.tool_calls || message.tool_calls.length === 0) {
                if (message.content) {
                    finalPlan = this.parseAndValidateOutput(message.content);
                }
                break;
            }
            for (const toolCall of message.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
                try {
                    const result = await this.toolsRegistry.executeTool(toolName, toolArgs);
                    if (toolName === 'generate_sprint_plan' && toolArgs.plan) {
                        finalPlan = this.parseAndValidateOutput(JSON.stringify(toolArgs.plan));
                    }
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: typeof result === 'string' ? result : JSON.stringify(result),
                    });
                }
                catch (error) {
                    this.logger.error({ toolName, error: error.message }, 'Tool execution failed');
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({
                            error: error.message,
                        }),
                    });
                }
            }
            if (finalPlan)
                break;
        }
        if (!finalPlan) {
            throw new Error(`Agent failed to produce a valid sprint plan after ${MAX_ITERATIONS} iterations`);
        }
        return {
            plan: finalPlan,
            iterations,
            totalInputTokens,
            totalOutputTokens,
        };
    }
    parseAndValidateOutput(content) {
        let jsonStr = content.trim();
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }
        const parsed = JSON.parse(jsonStr);
        const result = sprint_plan_output_dto_js_1.SprintPlanOutputSchema.safeParse(parsed);
        if (!result.success) {
            this.logger.warn({ errors: result.error.issues }, 'Sprint plan output validation failed');
            throw new Error(`Output validation failed: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
        }
        return result.data;
    }
    async callLLM(prompt) {
        const response = await this.openaiService.chatCompletion({
            messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0]?.message?.content || '';
    }
};
exports.ReactAgentService = ReactAgentService;
exports.ReactAgentService = ReactAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_service_js_1.OpenaiService,
        agent_tools_registry_js_1.AgentToolsRegistry,
        nestjs_pino_1.PinoLogger])
], ReactAgentService);
//# sourceMappingURL=react-agent.service.js.map