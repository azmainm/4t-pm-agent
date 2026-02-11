"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPinoConfig = getPinoConfig;
const crypto_1 = require("crypto");
function getPinoConfig() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        pinoHttp: {
            level: isProduction ? 'info' : 'debug',
            genReqId: (req) => req.headers?.['x-request-id'] || (0, crypto_1.randomUUID)(),
            redact: {
                paths: [
                    'req.headers["x-api-key"]',
                    'req.headers.authorization',
                ],
                censor: '[REDACTED]',
            },
            serializers: {
                req: (req) => ({
                    method: req.method,
                    url: req.url,
                    requestId: req.id,
                }),
                res: (res) => ({
                    statusCode: res.statusCode,
                }),
            },
            transport: !isProduction
                ? {
                    target: 'pino-pretty',
                    options: { colorize: true, singleLine: false },
                }
                : undefined,
        },
    };
}
//# sourceMappingURL=pino.config.js.map