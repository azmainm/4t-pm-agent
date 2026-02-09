import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';

export interface DriveItem {
  id: string;
  name: string;
  lastModifiedDateTime: string;
  size: number;
}

@Injectable()
export class OnedriveService {
  constructor(
    private readonly graphClient: GraphClientService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('OnedriveService');
  }

  async listFolder(folderId: string): Promise<DriveItem[]> {
    const targetUserId = this.configService.get<string>('azure.targetUserId')!;

    const response = await this.graphClient
      .getClient()
      .api(`/users/${targetUserId}/drive/items/${folderId}/children`)
      .select('id,name,lastModifiedDateTime,size')
      .get();

    return response.value || [];
  }

  async findLatestSprintPlan(folderId: string): Promise<DriveItem | null> {
    const items = await this.listFolder(folderId);

    const sprintPlans = items
      .filter(
        (item) =>
          item.name.startsWith('Sprint_') && item.name.endsWith('.docx'),
      )
      .sort(
        (a, b) =>
          new Date(b.lastModifiedDateTime).getTime() -
          new Date(a.lastModifiedDateTime).getTime(),
      );

    if (sprintPlans.length === 0) {
      this.logger.warn({ folderId }, 'No sprint plan found in folder');
      return null;
    }

    this.logger.info(
      { fileName: sprintPlans[0].name },
      'Found latest sprint plan',
    );
    return sprintPlans[0];
  }

  async downloadFile(itemId: string): Promise<Buffer> {
    const targetUserId = this.configService.get<string>('azure.targetUserId')!;

    this.logger.info({ itemId }, 'Downloading file from OneDrive');

    const response = await this.graphClient
      .getClient()
      .api(`/users/${targetUserId}/drive/items/${itemId}/content`)
      .getStream();

    const chunks: Buffer[] = [];
    for await (const chunk of response as AsyncIterable<Buffer>) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    this.logger.info({ itemId, sizeBytes: buffer.length }, 'File downloaded');
    return buffer;
  }

  async uploadFile(
    folderId: string,
    fileName: string,
    content: Buffer,
  ): Promise<DriveItem> {
    const targetUserId = this.configService.get<string>('azure.targetUserId')!;

    this.logger.info(
      { folderId, fileName, sizeBytes: content.length },
      'Uploading file to OneDrive',
    );

    const response = await this.graphClient
      .getClient()
      .api(
        `/users/${targetUserId}/drive/items/${folderId}:/${fileName}:/content`,
      )
      .putStream(content);

    this.logger.info(
      { fileName, itemId: response.id },
      'File uploaded successfully',
    );
    return response;
  }

  async moveItem(itemId: string, targetFolderId: string): Promise<void> {
    const targetUserId = this.configService.get<string>('azure.targetUserId')!;

    this.logger.info(
      { itemId, targetFolderId },
      'Moving item to archive folder',
    );

    await this.graphClient
      .getClient()
      .api(`/users/${targetUserId}/drive/items/${itemId}`)
      .patch({
        parentReference: { id: targetFolderId },
      });

    this.logger.info({ itemId }, 'Item moved to archive');
  }
}
