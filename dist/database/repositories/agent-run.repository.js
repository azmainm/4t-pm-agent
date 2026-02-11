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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRunRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const agent_run_schema_js_1 = require("../schemas/agent-run.schema.js");
let AgentRunRepository = class AgentRunRepository {
    agentRunModel;
    constructor(agentRunModel) {
        this.agentRunModel = agentRunModel;
    }
    async create(data) {
        const run = new this.agentRunModel(data);
        return run.save();
    }
    async findByRunId(runId) {
        return this.agentRunModel.findOne({ runId }).exec();
    }
    async updateStatus(runId, status, updates) {
        return this.agentRunModel
            .findOneAndUpdate({ runId }, { status, completedAt: new Date(), ...updates }, { new: true })
            .exec();
    }
    async addStep(runId, step) {
        return this.agentRunModel
            .findOneAndUpdate({ runId }, { $push: { steps: step } }, { new: true })
            .exec();
    }
    async updateStats(runId, stats) {
        return this.agentRunModel
            .findOneAndUpdate({ runId }, { $set: { stats } }, { new: true })
            .exec();
    }
    async findRecent(limit) {
        return this.agentRunModel
            .find()
            .sort({ startedAt: -1 })
            .limit(limit)
            .exec();
    }
};
exports.AgentRunRepository = AgentRunRepository;
exports.AgentRunRepository = AgentRunRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(agent_run_schema_js_1.AgentRun.name, 'sprint_agent')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AgentRunRepository);
//# sourceMappingURL=agent-run.repository.js.map