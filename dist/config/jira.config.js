"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiraConfig = void 0;
const config_1 = require("@nestjs/config");
exports.jiraConfig = (0, config_1.registerAs)('jira', () => ({
    host: process.env.JIRA_HOST,
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
    projectKey: process.env.JIRA_PROJECT_KEY,
    boardId: parseInt(process.env.JIRA_BOARD_ID || '0', 10),
}));
//# sourceMappingURL=jira.config.js.map