import { registerAs } from '@nestjs/config';

export const teamsConfig = registerAs('teams', () => ({
  webhookUrl: process.env.TEAMS_WEBHOOK_URL!,
  teamId: process.env.TEAMS_TEAM_ID!,
  channelIds: (process.env.TEAMS_CHANNEL_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  chatIds: (process.env.TEAMS_CHAT_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  standupSubjectFilter:
    process.env.TEAMS_STANDUP_SUBJECT_FILTER || 'Daily Standup',
}));
