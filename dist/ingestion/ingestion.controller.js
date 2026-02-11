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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionController = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const ingestion_service_js_1 = require("./ingestion.service.js");
const api_response_dto_js_1 = require("../common/dto/api-response.dto.js");
let IngestionController = class IngestionController {
    ingestionService;
    logger;
    constructor(ingestionService, logger) {
        this.ingestionService = ingestionService;
        this.logger = logger;
        this.logger.setContext('IngestionController');
    }
    async runIngestion() {
        this.logger.info('Manual ingestion triggered');
        const result = await this.ingestionService.runDailyIngestion();
        if (result.success) {
            return (0, api_response_dto_js_1.successResponse)(result);
        }
        else {
            return (0, api_response_dto_js_1.errorResponse)(result.error || 'Ingestion failed');
        }
    }
};
exports.IngestionController = IngestionController;
__decorate([
    (0, common_1.Post)('run'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "runIngestion", null);
exports.IngestionController = IngestionController = __decorate([
    (0, common_1.Controller)('ingestion'),
    __metadata("design:paramtypes", [ingestion_service_js_1.IngestionService,
        nestjs_pino_1.PinoLogger])
], IngestionController);
//# sourceMappingURL=ingestion.controller.js.map