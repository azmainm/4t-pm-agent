import { Controller, Post, Body } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { SprintPlanService } from './sprint-plan.service.js';
import { successResponse, errorResponse } from '../common/dto/api-response.dto.js';
import type { ApiResponse } from '../common/interfaces/index.js';

@Controller('sprint-plan')
export class SprintPlanController {
  constructor(
    private readonly sprintPlanService: SprintPlanService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('SprintPlanController');
  }

  @Post('generate')
  async generateSprintPlan(): Promise<ApiResponse> {
    this.logger.info('Sprint plan generation triggered');
    
    const result = await this.sprintPlanService.generateSprintPlan();

    if (result.success) {
      return successResponse(result);
    } else {
      return errorResponse(result.error || 'Sprint plan generation failed');
    }
  }

  @Post('approve')
  async approveSprintPlan(
    @Body('sprintPlanId') sprintPlanId: string,
  ): Promise<ApiResponse> {
    if (!sprintPlanId) {
      return errorResponse('sprintPlanId is required');
    }

    this.logger.info({ sprintPlanId }, 'Sprint plan approval triggered');
    
    const result = await this.sprintPlanService.approveAndCreateJiraTasks(sprintPlanId);

    if (result.success) {
      return successResponse(result);
    } else {
      return errorResponse(result.error || 'Sprint plan approval failed');
    }
  }
}
