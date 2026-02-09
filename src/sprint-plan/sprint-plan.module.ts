import { Module } from '@nestjs/common';
import { SprintPlanService } from './sprint-plan.service.js';
import { SprintPlanController } from './sprint-plan.controller.js';
import { ProcessingModule } from '../processing/processing.module.js';
import { LlmModule } from '../llm/llm.module.js';
import { DocxModule } from '../docx/docx.module.js';
import { GraphModule } from '../graph/graph.module.js';
import { JiraModule } from '../jira/jira.module.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [
    ProcessingModule,
    LlmModule,
    DocxModule,
    GraphModule,
    JiraModule,
    NotificationModule,
  ],
  controllers: [SprintPlanController],
  providers: [SprintPlanService],
  exports: [SprintPlanService],
})
export class SprintPlanModule {}
