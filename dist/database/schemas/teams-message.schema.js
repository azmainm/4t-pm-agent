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
exports.TeamsMessageSchema = exports.TeamsMessage = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TeamsMessage = class TeamsMessage extends mongoose_2.Document {
    messageId;
    source;
    channelOrChatId;
    channelOrChatName;
    senderName;
    senderEmail;
    content;
    timestamp;
    replyToId;
};
exports.TeamsMessage = TeamsMessage;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamsMessage.prototype, "messageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['channel', 'chat'] }),
    __metadata("design:type", String)
], TeamsMessage.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamsMessage.prototype, "channelOrChatId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamsMessage.prototype, "channelOrChatName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamsMessage.prototype, "senderName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamsMessage.prototype, "senderEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamsMessage.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], TeamsMessage.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], TeamsMessage.prototype, "replyToId", void 0);
exports.TeamsMessage = TeamsMessage = __decorate([
    (0, mongoose_1.Schema)({ collection: 'teamsMessages', timestamps: true })
], TeamsMessage);
exports.TeamsMessageSchema = mongoose_1.SchemaFactory.createForClass(TeamsMessage);
exports.TeamsMessageSchema.index({ timestamp: -1 });
exports.TeamsMessageSchema.index({ messageId: 1 }, { unique: true });
exports.TeamsMessageSchema.index({ source: 1, channelOrChatId: 1 });
//# sourceMappingURL=teams-message.schema.js.map