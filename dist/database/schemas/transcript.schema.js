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
exports.TranscriptSchema = exports.Transcript = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Transcript = class Transcript extends mongoose_2.Document {
    date;
    meetingSubject;
    meetingId;
    segments;
    rawVttContent;
    dailySummary;
};
exports.Transcript = Transcript;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Transcript.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transcript.prototype, "meetingSubject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transcript.prototype, "meetingId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Array)
], Transcript.prototype, "segments", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transcript.prototype, "rawVttContent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Transcript.prototype, "dailySummary", void 0);
exports.Transcript = Transcript = __decorate([
    (0, mongoose_1.Schema)({ collection: 'transcripts', timestamps: true })
], Transcript);
exports.TranscriptSchema = mongoose_1.SchemaFactory.createForClass(Transcript);
exports.TranscriptSchema.index({ date: -1 });
exports.TranscriptSchema.index({ meetingId: 1 });
//# sourceMappingURL=transcript.schema.js.map