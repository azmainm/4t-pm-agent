"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rosterConfig = void 0;
const config_1 = require("@nestjs/config");
exports.rosterConfig = (0, config_1.registerAs)('roster', () => {
    const raw = process.env.TEAM_ROSTER || '[]';
    const members = JSON.parse(raw);
    return { members };
});
//# sourceMappingURL=roster.config.js.map