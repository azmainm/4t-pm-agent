import { randomUUID } from 'crypto';
import type { Params } from 'nestjs-pino';

export function getPinoConfig(): Params {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    pinoHttp: {
      level: isProduction ? 'info' : 'debug',
      genReqId: (req: { headers?: Record<string, string | string[] | undefined> }) =>
        (req.headers?.['x-request-id'] as string) || randomUUID(),
      redact: {
        paths: [
          'req.headers["x-api-key"]',
          'req.headers.authorization',
        ],
        censor: '[REDACTED]',
      },
      serializers: {
        req: (req: { method: string; url: string; id: string }) => ({
          method: req.method,
          url: req.url,
          requestId: req.id,
        }),
        res: (res: { statusCode: number }) => ({
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
