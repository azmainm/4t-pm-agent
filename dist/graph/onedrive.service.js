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
exports.OnedriveService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const graph_client_service_js_1 = require("./graph-client.service.js");
let OnedriveService = class OnedriveService {
    graphClient;
    configService;
    logger;
    constructor(graphClient, configService, logger) {
        this.graphClient = graphClient;
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('OnedriveService');
    }
    async listFolder(folderId) {
        const targetUserId = this.configService.get('azure.targetUserId');
        const response = await this.graphClient
            .getClient()
            .api(`/users/${targetUserId}/drive/items/${folderId}/children`)
            .select('id,name,lastModifiedDateTime,size')
            .get();
        return response.value || [];
    }
    async findLatestSprintPlan(folderId) {
        const items = await this.listFolder(folderId);
        const sprintPlans = items
            .filter((item) => item.name.startsWith('Sprint_') && item.name.endsWith('.docx'))
            .sort((a, b) => new Date(b.lastModifiedDateTime).getTime() -
            new Date(a.lastModifiedDateTime).getTime());
        if (sprintPlans.length === 0) {
            this.logger.warn({ folderId }, 'No sprint plan found in folder');
            return null;
        }
        this.logger.info({ fileName: sprintPlans[0].name }, 'Found latest sprint plan');
        return sprintPlans[0];
    }
    async downloadFile(itemId) {
        const targetUserId = this.configService.get('azure.targetUserId');
        this.logger.info({ itemId }, 'Downloading file from OneDrive');
        const response = await this.graphClient
            .getClient()
            .api(`/users/${targetUserId}/drive/items/${itemId}/content`)
            .getStream();
        const chunks = [];
        for await (const chunk of response) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        this.logger.info({ itemId, sizeBytes: buffer.length }, 'File downloaded');
        return buffer;
    }
    async uploadFile(folderId, fileName, content) {
        const targetUserId = this.configService.get('azure.targetUserId');
        this.logger.info({ folderId, fileName, sizeBytes: content.length }, 'Uploading file to OneDrive');
        const response = await this.graphClient
            .getClient()
            .api(`/users/${targetUserId}/drive/items/${folderId}:/${fileName}:/content`)
            .putStream(content);
        this.logger.info({ fileName, itemId: response.id }, 'File uploaded successfully');
        return response;
    }
    async moveItem(itemId, targetFolderId) {
        const targetUserId = this.configService.get('azure.targetUserId');
        this.logger.info({ itemId, targetFolderId }, 'Moving item to archive folder');
        await this.graphClient
            .getClient()
            .api(`/users/${targetUserId}/drive/items/${itemId}`)
            .patch({
            parentReference: { id: targetFolderId },
        });
        this.logger.info({ itemId }, 'Item moved to archive');
    }
};
exports.OnedriveService = OnedriveService;
exports.OnedriveService = OnedriveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graph_client_service_js_1.GraphClientService,
        config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], OnedriveService);
//# sourceMappingURL=onedrive.service.js.map