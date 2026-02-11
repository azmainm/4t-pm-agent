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
exports.OnedriveController = void 0;
const common_1 = require("@nestjs/common");
const onedrive_service_js_1 = require("./onedrive.service.js");
const graph_client_service_js_1 = require("./graph-client.service.js");
const config_1 = require("@nestjs/config");
let OnedriveController = class OnedriveController {
    onedriveService;
    graphClient;
    configService;
    constructor(onedriveService, graphClient, configService) {
        this.onedriveService = onedriveService;
        this.graphClient = graphClient;
        this.configService = configService;
    }
    async listFolders() {
        const targetUserId = this.configService.get('azure.targetUserId');
        const sprintsFolderId = '01EJ3NYXGBL4SF4TGI7ZC3UF6GZIGEQQFY';
        const sprintsChildren = await this.graphClient
            .getClient()
            .api(`/users/${targetUserId}/drive/items/${sprintsFolderId}/children`)
            .select('id,name,folder')
            .get();
        const archiveFolder = sprintsChildren.value.find((item) => item.folder && item.name === 'Archive');
        return {
            success: true,
            message: 'Found your folder IDs! Add these to .env:',
            sprintPlansFolder: {
                id: sprintsFolderId,
                name: 'Sprints & Weekly Plans',
                path: '4Trades/01 Business Operations/Meetings & Planning/Sprints & Weekly Plans',
            },
            archiveFolder: archiveFolder
                ? {
                    id: archiveFolder.id,
                    name: 'Archive',
                }
                : null,
            instructions: {
                step1: 'Copy the IDs above',
                step2: 'Add to .env:',
                ONEDRIVE_SPRINT_PLANS_FOLDER_ID: sprintsFolderId,
                ONEDRIVE_ARCHIVE_FOLDER_ID: archiveFolder?.id || 'NOT_FOUND',
            },
        };
    }
};
exports.OnedriveController = OnedriveController;
__decorate([
    (0, common_1.Get)('list-folders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OnedriveController.prototype, "listFolders", null);
exports.OnedriveController = OnedriveController = __decorate([
    (0, common_1.Controller)('onedrive'),
    __metadata("design:paramtypes", [onedrive_service_js_1.OnedriveService,
        graph_client_service_js_1.GraphClientService,
        config_1.ConfigService])
], OnedriveController);
//# sourceMappingURL=onedrive.controller.js.map