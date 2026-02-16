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
exports.SprintPlanRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sprint_plan_schema_js_1 = require("../schemas/sprint-plan.schema.js");
let SprintPlanRepository = class SprintPlanRepository {
    sprintPlanModel;
    constructor(sprintPlanModel) {
        this.sprintPlanModel = sprintPlanModel;
    }
    async create(data) {
        const plan = new this.sprintPlanModel(data);
        return plan.save();
    }
    async findLatest() {
        return this.sprintPlanModel
            .findOne()
            .sort({ sprintStartDate: -1 })
            .exec();
    }
    async findByDateRange(startDate, endDate) {
        return this.sprintPlanModel
            .findOne({
            sprintStartDate: { $gte: startDate },
            sprintEndDate: { $lte: endDate },
        })
            .exec();
    }
    async updateStatus(id, status, updates) {
        return this.sprintPlanModel
            .findByIdAndUpdate(id, { status, ...updates }, { new: true })
            .exec();
    }
    async updateOnedriveFile(id, fileId, fileName) {
        return this.sprintPlanModel
            .findByIdAndUpdate(id, { onedriveFileId: fileId, onedriveFileName: fileName }, { new: true })
            .exec();
    }
    async updateJiraIssues(id, jiraIssueKeys) {
        return this.sprintPlanModel
            .findByIdAndUpdate(id, { jiraIssueKeys }, { new: true })
            .exec();
    }
    async updatePlanData(id, planData) {
        return this.sprintPlanModel
            .findByIdAndUpdate(id, { planData }, { new: true })
            .exec();
    }
    async findById(id) {
        return this.sprintPlanModel.findById(id).exec();
    }
    async findAll(limit = 20) {
        return this.sprintPlanModel
            .find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
};
exports.SprintPlanRepository = SprintPlanRepository;
exports.SprintPlanRepository = SprintPlanRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(sprint_plan_schema_js_1.SprintPlan.name, 'sprint_agent')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SprintPlanRepository);
//# sourceMappingURL=sprint-plan.repository.js.map