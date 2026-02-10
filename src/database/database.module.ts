import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DailySummary, DailySummarySchema } from './schemas/daily-summary.schema.js';
import { SprintPlan, SprintPlanSchema } from './schemas/sprint-plan.schema.js';
import { AgentRun, AgentRunSchema } from './schemas/agent-run.schema.js';
import { DailySummaryRepository } from './repositories/daily-summary.repository.js';
import { SprintPlanRepository } from './repositories/sprint-plan.repository.js';
import { AgentRunRepository } from './repositories/agent-run.repository.js';
import { StandupTicketsRepository } from './repositories/standup-tickets.repository.js';

@Global()
@Module({
  imports: [
    // Main DB (sprint_agent)
    MongooseModule.forRootAsync({
      connectionName: 'sprint_agent',
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        dbName: configService.get<string>('mongodb.dbName'),
      }),
      inject: [ConfigService],
    }),
    // Standup Tickets DB (read-only)
    MongooseModule.forRootAsync({
      connectionName: 'standuptickets',
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.standupTicketsUri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(
      [
        { name: DailySummary.name, schema: DailySummarySchema },
        { name: SprintPlan.name, schema: SprintPlanSchema },
        { name: AgentRun.name, schema: AgentRunSchema },
      ],
      'sprint_agent',
    ),
  ],
  providers: [
    DailySummaryRepository,
    SprintPlanRepository,
    AgentRunRepository,
    StandupTicketsRepository,
  ],
  exports: [
    DailySummaryRepository,
    SprintPlanRepository,
    AgentRunRepository,
    StandupTicketsRepository,
  ],
})
export class DatabaseModule {}
