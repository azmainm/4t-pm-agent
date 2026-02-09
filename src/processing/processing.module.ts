import { Module } from '@nestjs/common';
import { VttParserService } from './vtt-parser.service.js';
import { DocxParserService } from './docx-parser.service.js';
import { ContextBuilderService } from './context-builder.service.js';
import { EmbeddingService } from './embedding.service.js';

@Module({
  providers: [
    VttParserService,
    DocxParserService,
    ContextBuilderService,
    EmbeddingService,
  ],
  exports: [
    VttParserService,
    DocxParserService,
    ContextBuilderService,
    EmbeddingService,
  ],
})
export class ProcessingModule {}
