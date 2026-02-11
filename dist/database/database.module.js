"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const daily_summary_schema_js_1 = require("./schemas/daily-summary.schema.js");
const sprint_plan_schema_js_1 = require("./schemas/sprint-plan.schema.js");
const agent_run_schema_js_1 = require("./schemas/agent-run.schema.js");
const daily_summary_repository_js_1 = require("./repositories/daily-summary.repository.js");
const sprint_plan_repository_js_1 = require("./repositories/sprint-plan.repository.js");
const agent_run_repository_js_1 = require("./repositories/agent-run.repository.js");
const standup_tickets_repository_js_1 = require("./repositories/standup-tickets.repository.js");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRootAsync({
                connectionName: 'sprint_agent',
                useFactory: (configService) => ({
                    uri: configService.get('mongodb.uri'),
                    dbName: configService.get('mongodb.dbName'),
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                connectionName: 'standuptickets',
                useFactory: (configService) => ({
                    uri: configService.get('mongodb.standupTicketsUri'),
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: daily_summary_schema_js_1.DailySummary.name, schema: daily_summary_schema_js_1.DailySummarySchema },
                { name: sprint_plan_schema_js_1.SprintPlan.name, schema: sprint_plan_schema_js_1.SprintPlanSchema },
                { name: agent_run_schema_js_1.AgentRun.name, schema: agent_run_schema_js_1.AgentRunSchema },
            ], 'sprint_agent'),
        ],
        providers: [
            daily_summary_repository_js_1.DailySummaryRepository,
            sprint_plan_repository_js_1.SprintPlanRepository,
            agent_run_repository_js_1.AgentRunRepository,
            standup_tickets_repository_js_1.StandupTicketsRepository,
        ],
        exports: [
            daily_summary_repository_js_1.DailySummaryRepository,
            sprint_plan_repository_js_1.SprintPlanRepository,
            agent_run_repository_js_1.AgentRunRepository,
            standup_tickets_repository_js_1.StandupTicketsRepository,
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map