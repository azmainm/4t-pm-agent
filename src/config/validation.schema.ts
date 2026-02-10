import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_KEY: Joi.string().required(),

  // Azure AD
  AZURE_TENANT_ID: Joi.string().required(),
  AZURE_CLIENT_ID: Joi.string().required(),
  AZURE_CLIENT_SECRET: Joi.string().required(),
  GRAPH_TARGET_USER_ID: Joi.string().required(),

  // MongoDB
  MONGODB_URI: Joi.string().required(),
  MONGODB_DB_NAME: Joi.string().default('sprint_agent'),
  STANDUPTICKETS_MONGODB_URI: Joi.string().required(),

  // OpenAI
  OPENAI_API_KEY: Joi.string().required(),
  OPENAI_MODEL: Joi.string().default('gpt-5-nano'),
  OPENAI_EMBEDDING_MODEL: Joi.string().default('text-embedding-3-small'),

  // Jira
  JIRA_HOST: Joi.string().uri().required(),
  JIRA_EMAIL: Joi.string().email().required(),
  JIRA_API_TOKEN: Joi.string().required(),
  JIRA_PROJECT_KEY: Joi.string().required(),
  JIRA_BOARD_ID: Joi.number().required(),

  // Teams
  TEAMS_WEBHOOK_URL: Joi.string().uri().allow('').optional(),
  TEAMS_TEAM_ID: Joi.string().required(),
  TEAMS_STANDUP_SUBJECT_FILTER: Joi.string().default('Daily Standup'),

  // OneDrive
  ONEDRIVE_SPRINT_PLANS_FOLDER_ID: Joi.string().allow('').optional(),
  ONEDRIVE_ARCHIVE_FOLDER_ID: Joi.string().allow('').optional(),

  // Team Roster
  TEAM_ROSTER: Joi.string().required(),
});
