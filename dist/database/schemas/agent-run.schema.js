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
exports.AgentRunSchema = exports.AgentRun = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let AgentRun = class AgentRun extends mongoose_2.Document {
    runId;
    runType;
    startedAt;
    completedAt;
    status;
    error;
    stats;
    steps;
    sprintPlanId;
    requestId;
};
exports.AgentRun = AgentRun;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AgentRun.prototype, "runId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['ingestion', 'sprint_plan'] }),
    __metadata("design:type", String)
], AgentRun.prototype, "runType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], AgentRun.prototype, "startedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], AgentRun.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'running', enum: ['running', 'completed', 'failed'] }),
    __metadata("design:type", String)
], AgentRun.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AgentRun.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], AgentRun.prototype, "stats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object] }),
    __metadata("design:type", Array)
], AgentRun.prototype, "steps", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AgentRun.prototype, "sprintPlanId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AgentRun.prototype, "requestId", void 0);
exports.AgentRun = AgentRun = __decorate([
    (0, mongoose_1.Schema)({ collection: 'agentRuns', timestamps: true })
], AgentRun);
exports.AgentRunSchema = mongoose_1.SchemaFactory.createForClass(AgentRun);
exports.AgentRunSchema.index({ runId: 1 }, { unique: true });
exports.AgentRunSchema.index({ runType: 1, startedAt: -1 });
exports.AgentRunSchema.index({ status: 1 });
//# sourceMappingURL=agent-run.schema.js.map