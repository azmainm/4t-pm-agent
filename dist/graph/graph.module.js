"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_js_1 = require("../auth/auth.module.js");
const graph_client_service_js_1 = require("./graph-client.service.js");
const calendar_service_js_1 = require("./calendar.service.js");
const transcript_service_js_1 = require("./transcript.service.js");
const teams_channel_service_js_1 = require("./teams-channel.service.js");
const teams_chat_service_js_1 = require("./teams-chat.service.js");
const onedrive_service_js_1 = require("./onedrive.service.js");
const onedrive_controller_js_1 = require("./onedrive.controller.js");
let GraphModule = class GraphModule {
};
exports.GraphModule = GraphModule;
exports.GraphModule = GraphModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_js_1.AuthModule],
        controllers: [onedrive_controller_js_1.OnedriveController],
        providers: [
            graph_client_service_js_1.GraphClientService,
            calendar_service_js_1.CalendarService,
            transcript_service_js_1.TranscriptService,
            teams_channel_service_js_1.TeamsChannelService,
            teams_chat_service_js_1.TeamsChatService,
            onedrive_service_js_1.OnedriveService,
        ],
        exports: [
            graph_client_service_js_1.GraphClientService,
            calendar_service_js_1.CalendarService,
            transcript_service_js_1.TranscriptService,
            teams_channel_service_js_1.TeamsChannelService,
            teams_chat_service_js_1.TeamsChatService,
            onedrive_service_js_1.OnedriveService,
        ],
    })
], GraphModule);
//# sourceMappingURL=graph.module.js.map