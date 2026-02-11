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
exports.MsGraphAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const msal_node_1 = require("@azure/msal-node");
const nestjs_pino_1 = require("nestjs-pino");
let MsGraphAuthService = class MsGraphAuthService {
    configService;
    logger;
    msalClient;
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.logger.setContext('MsGraphAuth');
    }
    onModuleInit() {
        const msalConfig = {
            auth: {
                clientId: this.configService.get('azure.clientId'),
                authority: `https://login.microsoftonline.com/${this.configService.get('azure.tenantId')}`,
                clientSecret: this.configService.get('azure.clientSecret'),
            },
        };
        this.msalClient = new msal_node_1.ConfidentialClientApplication(msalConfig);
        this.logger.info('MSAL client initialized');
    }
    async getAccessToken() {
        const result = await this.msalClient.acquireTokenByClientCredential({
            scopes: ['https://graph.microsoft.com/.default'],
        });
        if (!result?.accessToken) {
            throw new Error('Failed to acquire access token from Azure AD');
        }
        return result.accessToken;
    }
};
exports.MsGraphAuthService = MsGraphAuthService;
exports.MsGraphAuthService = MsGraphAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], MsGraphAuthService);
//# sourceMappingURL=ms-graph-auth.service.js.map