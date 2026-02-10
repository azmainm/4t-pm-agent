import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { GraphClientService } from './graph-client.service.js';
import { CalendarService } from './calendar.service.js';
import { TranscriptService } from './transcript.service.js';
import { TeamsChannelService } from './teams-channel.service.js';
import { TeamsChatService } from './teams-chat.service.js';
import { OnedriveService } from './onedrive.service.js';
import { OnedriveController } from './onedrive.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [OnedriveController],
  providers: [
    GraphClientService,
    CalendarService,
    TranscriptService,
    TeamsChannelService,
    TeamsChatService,
    OnedriveService,
  ],
  exports: [
    GraphClientService,
    CalendarService,
    TranscriptService,
    TeamsChannelService,
    TeamsChatService,
    OnedriveService,
  ],
})
export class GraphModule {}
