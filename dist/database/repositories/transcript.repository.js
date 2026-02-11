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
exports.TranscriptRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transcript_schema_js_1 = require("../schemas/transcript.schema.js");
let TranscriptRepository = class TranscriptRepository {
    transcriptModel;
    constructor(transcriptModel) {
        this.transcriptModel = transcriptModel;
    }
    async create(data) {
        const transcript = new this.transcriptModel(data);
        return transcript.save();
    }
    async findByDateRange(startDate, endDate) {
        return this.transcriptModel
            .find({
            date: { $gte: startDate, $lte: endDate },
        })
            .sort({ date: 1 })
            .exec();
    }
    async findByMeetingId(meetingId) {
        return this.transcriptModel.findOne({ meetingId }).exec();
    }
    async findLatest(limit) {
        return this.transcriptModel.find().sort({ date: -1 }).limit(limit).exec();
    }
    async updateDailySummary(id, dailySummary) {
        return this.transcriptModel
            .findByIdAndUpdate(id, { dailySummary }, { new: true })
            .exec();
    }
    async findWithSummaries(startDate, endDate) {
        return this.transcriptModel
            .find({
            date: { $gte: startDate, $lte: endDate },
            dailySummary: { $exists: true },
        })
            .sort({ date: 1 })
            .exec();
    }
};
exports.TranscriptRepository = TranscriptRepository;
exports.TranscriptRepository = TranscriptRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transcript_schema_js_1.Transcript.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TranscriptRepository);
//# sourceMappingURL=transcript.repository.js.map