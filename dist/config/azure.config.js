"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureConfig = void 0;
const config_1 = require("@nestjs/config");
exports.azureConfig = (0, config_1.registerAs)('azure', () => ({
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    targetUserId: process.env.GRAPH_TARGET_USER_ID,
}));
//# sourceMappingURL=azure.config.js.map