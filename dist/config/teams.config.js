"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamsConfig = void 0;
const config_1 = require("@nestjs/config");
exports.teamsConfig = (0, config_1.registerAs)('teams', () => ({
    webhookUrl: process.env.TEAMS_WEBHOOK_URL || '',
    teamId: process.env.TEAMS_TEAM_ID,
    standupSubjectFilter: process.env.TEAMS_STANDUP_SUBJECT_FILTER || 'Daily Standup',
}));
//# sourceMappingURL=teams.config.js.map