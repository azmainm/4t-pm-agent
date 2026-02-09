import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service.js';
import { IngestionController } from './ingestion.controller.js';
import { GraphModule } from '../graph/graph.module.js';
import { ProcessingModule } from '../processing/processing.module.js';
import { LlmModule } from '../llm/llm.module.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [GraphModule, ProcessingModule, LlmModule, NotificationModule],
  controllers: [IngestionController],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
