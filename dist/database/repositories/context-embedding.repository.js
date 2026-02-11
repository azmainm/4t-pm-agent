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
exports.ContextEmbeddingRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const context_embedding_schema_js_1 = require("../schemas/context-embedding.schema.js");
let ContextEmbeddingRepository = class ContextEmbeddingRepository {
    embeddingModel;
    constructor(embeddingModel) {
        this.embeddingModel = embeddingModel;
    }
    async createMany(embeddings) {
        return this.embeddingModel.insertMany(embeddings);
    }
    async vectorSearch(queryEmbedding, limit = 10) {
        return [];
    }
    async deleteBySourceId(sourceId) {
        const result = await this.embeddingModel.deleteMany({ sourceId });
        return result.deletedCount || 0;
    }
    async deleteOlderThan(date) {
        const result = await this.embeddingModel.deleteMany({
            date: { $lt: date },
        });
        return result.deletedCount || 0;
    }
};
exports.ContextEmbeddingRepository = ContextEmbeddingRepository;
exports.ContextEmbeddingRepository = ContextEmbeddingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(context_embedding_schema_js_1.ContextEmbedding.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ContextEmbeddingRepository);
//# sourceMappingURL=context-embedding.repository.js.map