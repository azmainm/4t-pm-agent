import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from './config/config.module.js';
import { ObservabilityModule } from './observability/observability.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { GraphModule } from './graph/graph.module.js';
import { ProcessingModule } from './processing/processing.module.js';
import { LlmModule } from './llm/llm.module.js';
import { DocxModule } from './docx/docx.module.js';
import { JiraModule } from './jira/jira.module.js';
import { NotificationModule } from './notification/notification.module.js';
import { IngestionModule } from './ingestion/ingestion.module.js';
import { SprintPlanModule } from './sprint-plan/sprint-plan.module.js';
import { ApiKeyGuard } from './common/guards/api-key.guard.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

@Module({
  imports: [
    ConfigModule,
    ObservabilityModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    GraphModule,
    ProcessingModule,
    LlmModule,
    DocxModule,
    JiraModule,
    NotificationModule,
    IngestionModule,
    SprintPlanModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
