import { registerAs } from '@nestjs/config';

export const onedriveConfig = registerAs('onedrive', () => ({
  sprintPlansFolderId: process.env.ONEDRIVE_SPRINT_PLANS_FOLDER_ID!,
  archiveFolderId: process.env.ONEDRIVE_ARCHIVE_FOLDER_ID!,
}));
