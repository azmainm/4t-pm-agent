import { PinoLogger } from 'nestjs-pino';
import { SprintPlanService } from './sprint-plan.service.js';
import type { ApiResponse } from '../common/interfaces/index.js';
export declare class SprintPlanController {
    private readonly sprintPlanService;
    private readonly logger;
    constructor(sprintPlanService: SprintPlanService, logger: PinoLogger);
    listSprintPlans(): Promise<ApiResponse>;
    generateSprintPlan(): Promise<ApiResponse>;
    refreshSprintPlan(sprintPlanId: string): Promise<ApiResponse>;
    approveSprintPlan(sprintPlanId: string): Promise<ApiResponse>;
}
