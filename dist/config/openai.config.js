"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiConfig = void 0;
const config_1 = require("@nestjs/config");
exports.openaiConfig = (0, config_1.registerAs)('openai', () => ({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-5-nano',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
}));
//# sourceMappingURL=openai.config.js.map