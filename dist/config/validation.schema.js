"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.validationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    API_KEY: Joi.string().required(),
    AZURE_TENANT_ID: Joi.string().required(),
    AZURE_CLIENT_ID: Joi.string().required(),
    AZURE_CLIENT_SECRET: Joi.string().required(),
    GRAPH_TARGET_USER_ID: Joi.string().required(),
    MONGODB_URI: Joi.string().required(),
    MONGODB_DB_NAME: Joi.string().default('sprint_agent'),
    STANDUPTICKETS_MONGODB_URI: Joi.string().required(),
    OPENAI_API_KEY: Joi.string().required(),
    OPENAI_MODEL: Joi.string().default('gpt-5-nano'),
    OPENAI_EMBEDDING_MODEL: Joi.string().default('text-embedding-3-small'),
    JIRA_HOST: Joi.string().uri().required(),
    JIRA_EMAIL: Joi.string().email().required(),
    JIRA_API_TOKEN: Joi.string().required(),
    JIRA_PROJECT_KEY: Joi.string().required(),
    JIRA_BOARD_ID: Joi.number().required(),
    TEAMS_WEBHOOK_URL: Joi.string().uri().allow('').optional(),
    TEAMS_TEAM_ID: Joi.string().required(),
    TEAMS_STANDUP_SUBJECT_FILTER: Joi.string().default('Daily Standup'),
    ONEDRIVE_SPRINT_PLANS_FOLDER_ID: Joi.string().allow('').optional(),
    ONEDRIVE_ARCHIVE_FOLDER_ID: Joi.string().allow('').optional(),
    TEAM_ROSTER: Joi.string().required(),
});
//# sourceMappingURL=validation.schema.js.map