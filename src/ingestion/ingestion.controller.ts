import { Controller, Post } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { IngestionService } from './ingestion.service.js';
import { successResponse, errorResponse } from '../common/dto/api-response.dto.js';
import type { ApiResponse } from '../common/interfaces/index.js';

@Controller('ingestion')
export class IngestionController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('IngestionController');
  }

  @Post('run')
  async runIngestion(): Promise<ApiResponse> {
    this.logger.info('Manual ingestion triggered');
    
    const result = await this.ingestionService.runDailyIngestion();

    if (result.success) {
      return successResponse(result);
    } else {
      return errorResponse(result.error || 'Ingestion failed');
    }
  }
}
