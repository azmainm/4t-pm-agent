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
exports.SprintPlanSchema = exports.SprintPlan = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let SprintPlan = class SprintPlan extends mongoose_2.Document {
    sprintStartDate;
    sprintEndDate;
    planData;
    onedriveFileId;
    onedriveFileName;
    status;
    approvedAt;
    extractedText;
    jiraIssueKeys;
};
exports.SprintPlan = SprintPlan;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], SprintPlan.prototype, "sprintStartDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], SprintPlan.prototype, "sprintEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Object }),
    __metadata("design:type", Object)
], SprintPlan.prototype, "planData", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SprintPlan.prototype, "onedriveFileId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SprintPlan.prototype, "onedriveFileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'draft', enum: ['draft', 'generated', 'approved', 'archived'] }),
    __metadata("design:type", String)
], SprintPlan.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], SprintPlan.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SprintPlan.prototype, "extractedText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], SprintPlan.prototype, "jiraIssueKeys", void 0);
exports.SprintPlan = SprintPlan = __decorate([
    (0, mongoose_1.Schema)({ collection: 'sprintPlans', timestamps: true })
], SprintPlan);
exports.SprintPlanSchema = mongoose_1.SchemaFactory.createForClass(SprintPlan);
exports.SprintPlanSchema.index({ sprintStartDate: -1 });
exports.SprintPlanSchema.index({ status: 1 });
//# sourceMappingURL=sprint-plan.schema.js.map