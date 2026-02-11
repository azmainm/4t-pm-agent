"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmModule = void 0;
const common_1 = require("@nestjs/common");
const openai_service_js_1 = require("./openai.service.js");
const summarization_service_js_1 = require("./summarization.service.js");
const react_agent_service_js_1 = require("./agent/react-agent.service.js");
const agent_tools_registry_js_1 = require("./agent/agent-tools.registry.js");
const fetch_summaries_tool_js_1 = require("./agent/tools/fetch-summaries.tool.js");
const fetch_transcripts_tool_js_1 = require("./agent/tools/fetch-transcripts.tool.js");
const fetch_messages_tool_js_1 = require("./agent/tools/fetch-messages.tool.js");
const fetch_previous_plan_tool_js_1 = require("./agent/tools/fetch-previous-plan.tool.js");
const search_context_tool_js_1 = require("./agent/tools/search-context.tool.js");
const generate_plan_tool_js_1 = require("./agent/tools/generate-plan.tool.js");
let LlmModule = class LlmModule {
};
exports.LlmModule = LlmModule;
exports.LlmModule = LlmModule = __decorate([
    (0, common_1.Module)({
        providers: [
            openai_service_js_1.OpenaiService,
            summarization_service_js_1.SummarizationService,
            react_agent_service_js_1.ReactAgentService,
            agent_tools_registry_js_1.AgentToolsRegistry,
            fetch_summaries_tool_js_1.FetchSummariesTool,
            fetch_transcripts_tool_js_1.FetchTranscriptsTool,
            fetch_messages_tool_js_1.FetchMessagesTool,
            fetch_previous_plan_tool_js_1.FetchPreviousPlanTool,
            search_context_tool_js_1.SearchContextTool,
            generate_plan_tool_js_1.GeneratePlanTool,
        ],
        exports: [
            openai_service_js_1.OpenaiService,
            summarization_service_js_1.SummarizationService,
            react_agent_service_js_1.ReactAgentService,
            agent_tools_registry_js_1.AgentToolsRegistry,
        ],
    })
], LlmModule);
//# sourceMappingURL=llm.module.js.map