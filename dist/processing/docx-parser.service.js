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
exports.DocxParserService = void 0;
const common_1 = require("@nestjs/common");
const mammoth_1 = __importDefault(require("mammoth"));
const nestjs_pino_1 = require("nestjs-pino");
let DocxParserService = class DocxParserService {
    logger;
    constructor(logger) {
        this.logger = logger;
        this.logger.setContext('DocxParserService');
    }
    async extractText(buffer) {
        this.logger.info({ sizeBytes: buffer.length }, 'Extracting text from .docx');
        const result = await mammoth_1.default.extractRawText({ buffer });
        if (result.messages.length > 0) {
            this.logger.warn({ messages: result.messages }, 'Warnings during .docx parsing');
        }
        this.logger.info({ textLength: result.value.length }, 'Text extracted from .docx');
        return result.value;
    }
};
exports.DocxParserService = DocxParserService;
exports.DocxParserService = DocxParserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], DocxParserService);
//# sourceMappingURL=docx-parser.service.js.map