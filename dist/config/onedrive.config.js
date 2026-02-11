"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onedriveConfig = void 0;
const config_1 = require("@nestjs/config");
exports.onedriveConfig = (0, config_1.registerAs)('onedrive', () => ({
    sprintPlansFolderId: process.env.ONEDRIVE_SPRINT_PLANS_FOLDER_ID,
    archiveFolderId: process.env.ONEDRIVE_ARCHIVE_FOLDER_ID,
}));
//# sourceMappingURL=onedrive.config.js.map