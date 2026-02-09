import { registerAs } from '@nestjs/config';

export const jiraConfig = registerAs('jira', () => ({
  host: process.env.JIRA_HOST!,
  email: process.env.JIRA_EMAIL!,
  apiToken: process.env.JIRA_API_TOKEN!,
  projectKey: process.env.JIRA_PROJECT_KEY!,
  boardId: parseInt(process.env.JIRA_BOARD_ID || '0', 10),
}));
