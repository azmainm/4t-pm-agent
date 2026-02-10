import { Controller, Get } from '@nestjs/common';
import { OnedriveService } from './onedrive.service.js';
import { GraphClientService } from './graph-client.service.js';
import { ConfigService } from '@nestjs/config';

@Controller('onedrive')
export class OnedriveController {
  constructor(
    private readonly onedriveService: OnedriveService,
    private readonly graphClient: GraphClientService,
    private readonly configService: ConfigService,
  ) {}

  @Get('list-folders')
  async listFolders() {
    const targetUserId = this.configService.get<string>('azure.targetUserId')!;

    // Known Sprints & Weekly Plans folder ID
    const sprintsFolderId = '01EJ3NYXGBL4SF4TGI7ZC3UF6GZIGEQQFY';

    // Get children of Sprints folder (including Archive)
    const sprintsChildren = await this.graphClient
      .getClient()
      .api(`/users/${targetUserId}/drive/items/${sprintsFolderId}/children`)
      .select('id,name,folder')
      .get();

    const archiveFolder = sprintsChildren.value.find(
      (item: any) => item.folder && item.name === 'Archive',
    );

    return {
      success: true,
      message: 'Found your folder IDs! Add these to .env:',
      sprintPlansFolder: {
        id: sprintsFolderId,
        name: 'Sprints & Weekly Plans',
        path: '4Trades/01 Business Operations/Meetings & Planning/Sprints & Weekly Plans',
      },
      archiveFolder: archiveFolder
        ? {
            id: archiveFolder.id,
            name: 'Archive',
          }
        : null,
      instructions: {
        step1: 'Copy the IDs above',
        step2: 'Add to .env:',
        ONEDRIVE_SPRINT_PLANS_FOLDER_ID: sprintsFolderId,
        ONEDRIVE_ARCHIVE_FOLDER_ID: archiveFolder?.id || 'NOT_FOUND',
      },
    };
  }
}
