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
exports.AgentToolsRegistry = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const fetch_summaries_tool_js_1 = require("./tools/fetch-summaries.tool.js");
const fetch_transcripts_tool_js_1 = require("./tools/fetch-transcripts.tool.js");
const fetch_messages_tool_js_1 = require("./tools/fetch-messages.tool.js");
const fetch_previous_plan_tool_js_1 = require("./tools/fetch-previous-plan.tool.js");
const search_context_tool_js_1 = require("./tools/search-context.tool.js");
const generate_plan_tool_js_1 = require("./tools/generate-plan.tool.js");
let AgentToolsRegistry = class AgentToolsRegistry {
    fetchSummariesTool;
    fetchTranscriptsTool;
    fetchMessagesTool;
    fetchPreviousPlanTool;
    searchContextTool;
    generatePlanTool;
    logger;
    tools = new Map();
    constructor(fetchSummariesTool, fetchTranscriptsTool, fetchMessagesTool, fetchPreviousPlanTool, searchContextTool, generatePlanTool, logger) {
        this.fetchSummariesTool = fetchSummariesTool;
        this.fetchTranscriptsTool = fetchTranscriptsTool;
        this.fetchMessagesTool = fetchMessagesTool;
        this.fetchPreviousPlanTool = fetchPreviousPlanTool;
        this.searchContextTool = searchContextTool;
        this.generatePlanTool = generatePlanTool;
        this.logger = logger;
        this.logger.setContext('AgentToolsRegistry');
    }
    registerHandlers(handlers) {
        const toolInstances = [
            this.fetchSummariesTool,
            this.fetchTranscriptsTool,
            this.fetchMessagesTool,
            this.fetchPreviousPlanTool,
            this.searchContextTool,
            this.generatePlanTool,
        ];
        for (const tool of toolInstances) {
            const name = tool.definition.function.name;
            const handler = handlers[name];
            if (typeof handler === 'function') {
                this.tools.set(name, { definition: tool.definition, handler });
                this.logger.debug({ toolName: name }, 'Tool registered');
            }
        }
    }
    getToolDefinitions() {
        return Array.from(this.tools.values()).map((t) => t.definition);
    }
    async executeTool(name, args) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
        }
        this.logger.info({ toolName: name, args }, 'Executing tool');
        const startTime = Date.now();
        const result = await tool.handler(args);
        this.logger.info({ toolName: name, durationMs: Date.now() - startTime }, 'Tool execution complete');
        return result;
    }
    hasHandler(name) {
        return this.tools.has(name);
    }
};
exports.AgentToolsRegistry = AgentToolsRegistry;
exports.AgentToolsRegistry = AgentToolsRegistry = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fetch_summaries_tool_js_1.FetchSummariesTool,
        fetch_transcripts_tool_js_1.FetchTranscriptsTool,
        fetch_messages_tool_js_1.FetchMessagesTool,
        fetch_previous_plan_tool_js_1.FetchPreviousPlanTool,
        search_context_tool_js_1.SearchContextTool,
        generate_plan_tool_js_1.GeneratePlanTool,
        nestjs_pino_1.PinoLogger])
], AgentToolsRegistry);
//# sourceMappingURL=agent-tools.registry.js.map