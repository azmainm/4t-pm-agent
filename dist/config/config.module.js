"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const validation_schema_js_1 = require("./validation.schema.js");
const app_config_js_1 = require("./app.config.js");
const azure_config_js_1 = require("./azure.config.js");
const mongodb_config_js_1 = require("./mongodb.config.js");
const openai_config_js_1 = require("./openai.config.js");
const jira_config_js_1 = require("./jira.config.js");
const teams_config_js_1 = require("./teams.config.js");
const onedrive_config_js_1 = require("./onedrive.config.js");
const roster_config_js_1 = require("./roster.config.js");
let ConfigModule = class ConfigModule {
};
exports.ConfigModule = ConfigModule;
exports.ConfigModule = ConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [
                    app_config_js_1.appConfig,
                    azure_config_js_1.azureConfig,
                    mongodb_config_js_1.mongodbConfig,
                    openai_config_js_1.openaiConfig,
                    jira_config_js_1.jiraConfig,
                    teams_config_js_1.teamsConfig,
                    onedrive_config_js_1.onedriveConfig,
                    roster_config_js_1.rosterConfig,
                ],
                validationSchema: validation_schema_js_1.validationSchema,
                validationOptions: {
                    abortEarly: false,
                },
            }),
        ],
    })
], ConfigModule);
//# sourceMappingURL=config.module.js.map