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
exports.GraphClientService = void 0;
const common_1 = require("@nestjs/common");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");
const ms_graph_auth_service_js_1 = require("../auth/ms-graph-auth.service.js");
let GraphClientService = class GraphClientService {
    authService;
    client;
    constructor(authService) {
        this.authService = authService;
    }
    onModuleInit() {
        this.client = microsoft_graph_client_1.Client.initWithMiddleware({
            authProvider: {
                getAccessToken: () => this.authService.getAccessToken(),
            },
        });
    }
    getClient() {
        return this.client;
    }
};
exports.GraphClientService = GraphClientService;
exports.GraphClientService = GraphClientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ms_graph_auth_service_js_1.MsGraphAuthService])
], GraphClientService);
//# sourceMappingURL=graph-client.service.js.map