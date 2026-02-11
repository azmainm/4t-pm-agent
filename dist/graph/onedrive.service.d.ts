import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';
export interface DriveItem {
    id: string;
    name: string;
    lastModifiedDateTime: string;
    size: number;
}
export declare class OnedriveService {
    private readonly graphClient;
    private readonly configService;
    private readonly logger;
    constructor(graphClient: GraphClientService, configService: ConfigService, logger: PinoLogger);
    listFolder(folderId: string): Promise<DriveItem[]>;
    findLatestSprintPlan(folderId: string): Promise<DriveItem | null>;
    downloadFile(itemId: string): Promise<Buffer>;
    uploadFile(folderId: string, fileName: string, content: Buffer): Promise<DriveItem>;
    moveItem(itemId: string, targetFolderId: string): Promise<void>;
}
