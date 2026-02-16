import { Controller, Post, Body, Get } from '@nestjs/common';
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

  @Get('list')
  async listSprintPlans(): Promise<ApiResponse> {
    this.logger.info('Listing sprint plans');
    
    try {
      const plans = await this.sprintPlanService.listSprintPlans();
      return successResponse(plans);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list sprint plans';
      return errorResponse(message);
    }
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

  @Post('refresh')
  async refreshSprintPlan(
    @Body('sprintPlanId') sprintPlanId: string,
  ): Promise<ApiResponse> {
    if (!sprintPlanId) {
      return errorResponse('sprintPlanId is required');
    }

    this.logger.info({ sprintPlanId }, 'Sprint plan refresh from OneDrive triggered');

    const result = await this.sprintPlanService.refreshFromOneDrive(sprintPlanId);

    if (result.success) {
      return successResponse(result);
    } else {
      return errorResponse(result.error || 'Sprint plan refresh failed');
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
