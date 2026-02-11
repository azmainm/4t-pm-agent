"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingModule = void 0;
const common_1 = require("@nestjs/common");
const vtt_parser_service_js_1 = require("./vtt-parser.service.js");
const docx_parser_service_js_1 = require("./docx-parser.service.js");
const context_builder_service_js_1 = require("./context-builder.service.js");
const embedding_service_js_1 = require("./embedding.service.js");
let ProcessingModule = class ProcessingModule {
};
exports.ProcessingModule = ProcessingModule;
exports.ProcessingModule = ProcessingModule = __decorate([
    (0, common_1.Module)({
        providers: [
            vtt_parser_service_js_1.VttParserService,
            docx_parser_service_js_1.DocxParserService,
            context_builder_service_js_1.ContextBuilderService,
            embedding_service_js_1.EmbeddingService,
        ],
        exports: [
            vtt_parser_service_js_1.VttParserService,
            docx_parser_service_js_1.DocxParserService,
            context_builder_service_js_1.ContextBuilderService,
            embedding_service_js_1.EmbeddingService,
        ],
    })
], ProcessingModule);
//# sourceMappingURL=processing.module.js.map