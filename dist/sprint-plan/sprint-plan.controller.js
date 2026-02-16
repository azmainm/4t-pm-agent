"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SprintPlanController = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const sprint_plan_service_js_1 = require("./sprint-plan.service.js");
const api_response_dto_js_1 = require("../common/dto/api-response.dto.js");
let SprintPlanController = class SprintPlanController {
    sprintPlanService;
    logger;
    constructor(sprintPlanService, logger) {
        this.sprintPlanService = sprintPlanService;
        this.logger = logger;
        this.logger.setContext('SprintPlanController');
    }
    async listSprintPlans() {
        this.logger.info('Listing sprint plans');
        try {
            const plans = await this.sprintPlanService.listSprintPlans();
            return (0, api_response_dto_js_1.successResponse)(plans);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to list sprint plans';
            return (0, api_response_dto_js_1.errorResponse)(message);
        }
    }
    async generateSprintPlan() {
        this.logger.info('Sprint plan generation triggered');
        const result = await this.sprintPlanService.generateSprintPlan();
        if (result.success) {
            return (0, api_response_dto_js_1.successResponse)(result);
        }
        else {
            return (0, api_response_dto_js_1.errorResponse)(result.error || 'Sprint plan generation failed');
        }
    }
    async refreshSprintPlan(sprintPlanId) {
        if (!sprintPlanId) {
            return (0, api_response_dto_js_1.errorResponse)('sprintPlanId is required');
        }
        this.logger.info({ sprintPlanId }, 'Sprint plan refresh from OneDrive triggered');
        const result = await this.sprintPlanService.refreshFromOneDrive(sprintPlanId);
        if (result.success) {
            return (0, api_response_dto_js_1.successResponse)(result);
        }
        else {
            return (0, api_response_dto_js_1.errorResponse)(result.error || 'Sprint plan refresh failed');
        }
    }
    async approveSprintPlan(sprintPlanId) {
        if (!sprintPlanId) {
            return (0, api_response_dto_js_1.errorResponse)('sprintPlanId is required');
        }
        this.logger.info({ sprintPlanId }, 'Sprint plan approval triggered');
        const result = await this.sprintPlanService.approveAndCreateJiraTasks(sprintPlanId);
        if (result.success) {
            return (0, api_response_dto_js_1.successResponse)(result);
        }
        else {
            return (0, api_response_dto_js_1.errorResponse)(result.error || 'Sprint plan approval failed');
        }
    }
};
exports.SprintPlanController = SprintPlanController;
__decorate([
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SprintPlanController.prototype, "listSprintPlans", null);
__decorate([
    (0, common_1.Post)('generate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SprintPlanController.prototype, "generateSprintPlan", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)('sprintPlanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SprintPlanController.prototype, "refreshSprintPlan", null);
__decorate([
    (0, common_1.Post)('approve'),
    __param(0, (0, common_1.Body)('sprintPlanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SprintPlanController.prototype, "approveSprintPlan", null);
exports.SprintPlanController = SprintPlanController = __decorate([
    (0, common_1.Controller)('sprint-plan'),
    __metadata("design:paramtypes", [sprint_plan_service_js_1.SprintPlanService,
        nestjs_pino_1.PinoLogger])
], SprintPlanController);
//# sourceMappingURL=sprint-plan.controller.js.map