import { PinoLogger } from 'nestjs-pino';
import type { SprintPlanOutput } from '../llm/dto/sprint-plan-output.dto.js';
export declare class DocxGeneratorService {
    private readonly logger;
    constructor(logger: PinoLogger);
    generate(plan: SprintPlanOutput): Promise<Buffer>;
    private formatDate;
}
