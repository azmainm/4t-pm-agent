import { registerAs } from '@nestjs/config';

export interface TeamMember {
  name: string;
  jiraAccountId: string;
  role: 'Lead' | 'Dev';
}

export const rosterConfig = registerAs('roster', () => {
  const raw = process.env.TEAM_ROSTER || '[]';
  const members: TeamMember[] = JSON.parse(raw);
  return { members };
});
