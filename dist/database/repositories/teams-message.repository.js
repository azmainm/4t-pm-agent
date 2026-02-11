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
exports.TeamsMessageRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const teams_message_schema_js_1 = require("../schemas/teams-message.schema.js");
let TeamsMessageRepository = class TeamsMessageRepository {
    messageModel;
    constructor(messageModel) {
        this.messageModel = messageModel;
    }
    async createMany(messages) {
        return this.messageModel.insertMany(messages, { ordered: false });
    }
    async findByDateRange(startDate, endDate) {
        return this.messageModel
            .find({
            timestamp: { $gte: startDate, $lte: endDate },
        })
            .sort({ timestamp: 1 })
            .exec();
    }
    async findByMessageId(messageId) {
        return this.messageModel.findOne({ messageId }).exec();
    }
    async findBySource(source, startDate, endDate) {
        return this.messageModel
            .find({
            source,
            timestamp: { $gte: startDate, $lte: endDate },
        })
            .sort({ timestamp: 1 })
            .exec();
    }
    async deleteOlderThan(date) {
        const result = await this.messageModel.deleteMany({
            timestamp: { $lt: date },
        });
        return result.deletedCount || 0;
    }
};
exports.TeamsMessageRepository = TeamsMessageRepository;
exports.TeamsMessageRepository = TeamsMessageRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(teams_message_schema_js_1.TeamsMessage.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TeamsMessageRepository);
//# sourceMappingURL=teams-message.repository.js.map