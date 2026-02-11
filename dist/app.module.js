"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_module_js_1 = require("./config/config.module.js");
const observability_module_js_1 = require("./observability/observability.module.js");
const database_module_js_1 = require("./database/database.module.js");
const health_module_js_1 = require("./health/health.module.js");
const auth_module_js_1 = require("./auth/auth.module.js");
const graph_module_js_1 = require("./graph/graph.module.js");
const processing_module_js_1 = require("./processing/processing.module.js");
const llm_module_js_1 = require("./llm/llm.module.js");
const docx_module_js_1 = require("./docx/docx.module.js");
const jira_module_js_1 = require("./jira/jira.module.js");
const notification_module_js_1 = require("./notification/notification.module.js");
const ingestion_module_js_1 = require("./ingestion/ingestion.module.js");
const sprint_plan_module_js_1 = require("./sprint-plan/sprint-plan.module.js");
const api_key_guard_js_1 = require("./common/guards/api-key.guard.js");
const logging_interceptor_js_1 = require("./common/interceptors/logging.interceptor.js");
const timeout_interceptor_js_1 = require("./common/interceptors/timeout.interceptor.js");
const all_exceptions_filter_js_1 = require("./common/filters/all-exceptions.filter.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_js_1.ConfigModule,
            observability_module_js_1.ObservabilityModule,
            database_module_js_1.DatabaseModule,
            health_module_js_1.HealthModule,
            auth_module_js_1.AuthModule,
            graph_module_js_1.GraphModule,
            processing_module_js_1.ProcessingModule,
            llm_module_js_1.LlmModule,
            docx_module_js_1.DocxModule,
            jira_module_js_1.JiraModule,
            notification_module_js_1.NotificationModule,
            ingestion_module_js_1.IngestionModule,
            sprint_plan_module_js_1.SprintPlanModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: api_key_guard_js_1.ApiKeyGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_js_1.LoggingInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: timeout_interceptor_js_1.TimeoutInterceptor },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_js_1.AllExceptionsFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map