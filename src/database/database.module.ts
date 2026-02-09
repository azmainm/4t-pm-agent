import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Transcript, TranscriptSchema } from './schemas/transcript.schema.js';
import { TeamsMessage, TeamsMessageSchema } from './schemas/teams-message.schema.js';
import { SprintPlan, SprintPlanSchema } from './schemas/sprint-plan.schema.js';
import { AgentRun, AgentRunSchema } from './schemas/agent-run.schema.js';
import { ContextEmbedding, ContextEmbeddingSchema } from './schemas/context-embedding.schema.js';
import { TranscriptRepository } from './repositories/transcript.repository.js';
import { TeamsMessageRepository } from './repositories/teams-message.repository.js';
import { SprintPlanRepository } from './repositories/sprint-plan.repository.js';
import { AgentRunRepository } from './repositories/agent-run.repository.js';
import { ContextEmbeddingRepository } from './repositories/context-embedding.repository.js';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        dbName: configService.get<string>('mongodb.dbName'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Transcript.name, schema: TranscriptSchema },
      { name: TeamsMessage.name, schema: TeamsMessageSchema },
      { name: SprintPlan.name, schema: SprintPlanSchema },
      { name: AgentRun.name, schema: AgentRunSchema },
      { name: ContextEmbedding.name, schema: ContextEmbeddingSchema },
    ]),
  ],
  providers: [
    TranscriptRepository,
    TeamsMessageRepository,
    SprintPlanRepository,
    AgentRunRepository,
    ContextEmbeddingRepository,
  ],
  exports: [
    TranscriptRepository,
    TeamsMessageRepository,
    SprintPlanRepository,
    AgentRunRepository,
    ContextEmbeddingRepository,
  ],
})
export class DatabaseModule {}
