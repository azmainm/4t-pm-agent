import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validationSchema } from './validation.schema.js';
import { appConfig } from './app.config.js';
import { azureConfig } from './azure.config.js';
import { mongodbConfig } from './mongodb.config.js';
import { openaiConfig } from './openai.config.js';
import { jiraConfig } from './jira.config.js';
import { teamsConfig } from './teams.config.js';
import { onedriveConfig } from './onedrive.config.js';
import { rosterConfig } from './roster.config.js';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        azureConfig,
        mongodbConfig,
        openaiConfig,
        jiraConfig,
        teamsConfig,
        onedriveConfig,
        rosterConfig,
      ],
      validationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class ConfigModule {}
