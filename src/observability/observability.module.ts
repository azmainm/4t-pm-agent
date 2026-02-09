import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { getPinoConfig } from './pino.config.js';

@Module({
  imports: [LoggerModule.forRoot(getPinoConfig())],
})
export class ObservabilityModule {}
