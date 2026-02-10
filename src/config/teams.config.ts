import { registerAs } from '@nestjs/config';

export const teamsConfig = registerAs('teams', () => ({
  webhookUrl: process.env.TEAMS_WEBHOOK_URL || '',
  teamId: process.env.TEAMS_TEAM_ID!,
  standupSubjectFilter:
    process.env.TEAMS_STANDUP_SUBJECT_FILTER || 'Daily Standup',
}));
