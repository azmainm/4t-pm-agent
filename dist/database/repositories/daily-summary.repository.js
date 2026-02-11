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
exports.DailySummaryRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const daily_summary_schema_js_1 = require("../schemas/daily-summary.schema.js");
let DailySummaryRepository = class DailySummaryRepository {
    summaryModel;
    constructor(summaryModel) {
        this.summaryModel = summaryModel;
    }
    async create(data) {
        const summary = new this.summaryModel(data);
        return summary.save();
    }
    async findByDateRange(startDate, endDate) {
        return this.summaryModel
            .find({
            date: { $gte: startDate, $lte: endDate },
        })
            .sort({ date: 1 })
            .exec();
    }
    async findLatest(limit) {
        return this.summaryModel.find().sort({ date: -1 }).limit(limit).exec();
    }
    async findByDate(date) {
        return this.summaryModel.findOne({ date }).exec();
    }
};
exports.DailySummaryRepository = DailySummaryRepository;
exports.DailySummaryRepository = DailySummaryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(daily_summary_schema_js_1.DailySummary.name, 'sprint_agent')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DailySummaryRepository);
//# sourceMappingURL=daily-summary.repository.js.map