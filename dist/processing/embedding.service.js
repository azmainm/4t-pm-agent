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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const openai_1 = __importDefault(require("openai"));
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
let EmbeddingService = class EmbeddingService {
    configService;
    logger;
    openai;
    embeddingModel;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('EmbeddingService');
        this.openai = new openai_1.default({
            apiKey: this.configService.get('openai.apiKey'),
        });
        this.embeddingModel = this.configService.get('openai.embeddingModel', 'text-embedding-3-small');
    }
    async generateEmbeddings(texts, sourceType, date, metadata = {}) {
        if (texts.length === 0)
            return [];
        const chunks = texts.flatMap((text) => this.chunkText(text));
        this.logger.info({ sourceType, textCount: texts.length, chunkCount: chunks.length }, 'Generating embeddings');
        const results = [];
        const batchSize = 100;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const response = await this.openai.embeddings.create({
                model: this.embeddingModel,
                input: batch,
            });
            for (let j = 0; j < response.data.length; j++) {
                results.push({
                    text: batch[j],
                    embedding: response.data[j].embedding,
                    sourceType,
                    date,
                    metadata: { ...metadata, chunkIndex: i + j },
                });
            }
        }
        this.logger.info({ sourceType, embeddingCount: results.length }, 'Embeddings generated');
        return results;
    }
    chunkText(text) {
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            const end = Math.min(start + CHUNK_SIZE, text.length);
            chunks.push(text.slice(start, end));
            start = end - CHUNK_OVERLAP;
            if (start >= text.length)
                break;
        }
        return chunks.filter((c) => c.trim().length > 0);
    }
    async generateSingleEmbedding(text) {
        const response = await this.openai.embeddings.create({
            model: this.embeddingModel,
            input: text,
        });
        return response.data[0].embedding;
    }
};
exports.EmbeddingService = EmbeddingService;
exports.EmbeddingService = EmbeddingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], EmbeddingService);
//# sourceMappingURL=embedding.service.js.map