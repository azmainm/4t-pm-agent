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
exports.DailySummarySchema = exports.DailySummary = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DailySummary = class DailySummary extends mongoose_2.Document {
    date;
    transcriptId;
    overallSummary;
    actionItems;
    decisions;
    blockers;
    perPersonSummary;
    upcomingWork;
    generatedAt;
};
exports.DailySummary = DailySummary;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Date)
], DailySummary.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DailySummary.prototype, "transcriptId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DailySummary.prototype, "overallSummary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], DailySummary.prototype, "actionItems", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], DailySummary.prototype, "decisions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], DailySummary.prototype, "blockers", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                name: String,
                summary: String,
                nextSteps: [String],
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], DailySummary.prototype, "perPersonSummary", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                task: String,
                owner: String,
                status: String,
                targetSprint: String,
                priority: String,
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], DailySummary.prototype, "upcomingWork", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], DailySummary.prototype, "generatedAt", void 0);
exports.DailySummary = DailySummary = __decorate([
    (0, mongoose_1.Schema)({ collection: 'dailySummaries', timestamps: true })
], DailySummary);
exports.DailySummarySchema = mongoose_1.SchemaFactory.createForClass(DailySummary);
exports.DailySummarySchema.index({ date: -1 });
//# sourceMappingURL=daily-summary.schema.js.map