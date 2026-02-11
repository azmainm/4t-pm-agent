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
exports.ContextEmbeddingSchema = exports.ContextEmbedding = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ContextEmbedding = class ContextEmbedding extends mongoose_2.Document {
    text;
    embedding;
    sourceType;
    sourceId;
    date;
    metadata;
};
exports.ContextEmbedding = ContextEmbedding;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ContextEmbedding.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [Number] }),
    __metadata("design:type", Array)
], ContextEmbedding.prototype, "embedding", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['transcript', 'message', 'document'] }),
    __metadata("design:type", String)
], ContextEmbedding.prototype, "sourceType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ContextEmbedding.prototype, "sourceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], ContextEmbedding.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], ContextEmbedding.prototype, "metadata", void 0);
exports.ContextEmbedding = ContextEmbedding = __decorate([
    (0, mongoose_1.Schema)({ collection: 'contextEmbeddings', timestamps: true })
], ContextEmbedding);
exports.ContextEmbeddingSchema = mongoose_1.SchemaFactory.createForClass(ContextEmbedding);
exports.ContextEmbeddingSchema.index({ sourceId: 1 });
exports.ContextEmbeddingSchema.index({ sourceType: 1, date: -1 });
//# sourceMappingURL=context-embedding.schema.js.map