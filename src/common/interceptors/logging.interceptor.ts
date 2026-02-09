import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId =
      (request.headers['x-request-id'] as string) || 'no-request-id';
    const startTime = Date.now();

    this.logger.info({ requestId, method, url }, 'Incoming request');

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const durationMs = Date.now() - startTime;
          this.logger.info(
            { requestId, method, url, statusCode: response.statusCode, durationMs },
            'Request completed',
          );
        },
        error: (error: Error) => {
          const durationMs = Date.now() - startTime;
          this.logger.error(
            { requestId, method, url, error: error.message, durationMs },
            'Request failed',
          );
        },
      }),
    );
  }
}
