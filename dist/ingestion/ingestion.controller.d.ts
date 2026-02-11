import { PinoLogger } from 'nestjs-pino';
import { IngestionService } from './ingestion.service.js';
import type { ApiResponse } from '../common/interfaces/index.js';
export declare class IngestionController {
    private readonly ingestionService;
    private readonly logger;
    constructor(ingestionService: IngestionService, logger: PinoLogger);
    runIngestion(): Promise<ApiResponse>;
}
