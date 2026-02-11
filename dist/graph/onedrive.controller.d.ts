import { OnedriveService } from './onedrive.service.js';
import { GraphClientService } from './graph-client.service.js';
import { ConfigService } from '@nestjs/config';
export declare class OnedriveController {
    private readonly onedriveService;
    private readonly graphClient;
    private readonly configService;
    constructor(onedriveService: OnedriveService, graphClient: GraphClientService, configService: ConfigService);
    listFolders(): Promise<{
        success: boolean;
        message: string;
        sprintPlansFolder: {
            id: string;
            name: string;
            path: string;
        };
        archiveFolder: {
            id: any;
            name: string;
        } | null;
        instructions: {
            step1: string;
            step2: string;
            ONEDRIVE_SPRINT_PLANS_FOLDER_ID: string;
            ONEDRIVE_ARCHIVE_FOLDER_ID: any;
        };
    }>;
}
