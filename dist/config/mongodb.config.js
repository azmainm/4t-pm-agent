"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongodbConfig = void 0;
const config_1 = require("@nestjs/config");
exports.mongodbConfig = (0, config_1.registerAs)('mongodb', () => ({
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || 'sprint_agent',
    standupTicketsUri: process.env.STANDUPTICKETS_MONGODB_URI,
}));
//# sourceMappingURL=mongodb.config.js.map