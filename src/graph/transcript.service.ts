import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';

const RETRY_DELAY_MS = 300_000; // 5 minutes
const MAX_RETRIES = 3;

@Injectable()
export class TranscriptService {
  constructor(
    private readonly graphClient: GraphClientService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('TranscriptService');
  }

  extractMeetingId(joinUrl: string): string {
    // Teams join URLs contain an encoded meeting ID
    // Format: https://teams.microsoft.com/l/meetup-join/...
    // We need to decode and extract the meeting ID for the onlineMeetings endpoint
    const url = new URL(joinUrl);
    const pathParts = url.pathname.split('/');
    const encodedId = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
    return decodeURIComponent(encodedId);
  }

  async fetchOnlineMeetingId(joinUrl: string): Promise<string> {
    const targetUserId = this.configService.get<string>('azure.targetUserId')!;
    const encodedJoinUrl = encodeURIComponent(joinUrl);

    const response = await this.graphClient
      .getClient()
      .api(`/users/${targetUserId}/onlineMeetings`)
      .filter(`JoinWebUrl eq '${joinUrl}'`)
      .select('id')
      .get();

    if (!response.value || response.value.length === 0) {
      throw new Error(`No online meeting found for join URL: ${joinUrl}`);
    }

    return response.value[0].id;
  }

  async fetchTranscript(meetingId: string): Promise<string> {
    const targetUserId = this.configService.get<string>('azure.targetUserId')!;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.info(
          { meetingId, attempt },
          'Fetching transcript',
        );

        // List transcripts for the meeting
        const transcriptsResponse = await this.graphClient
          .getClient()
          .api(
            `/users/${targetUserId}/onlineMeetings/${meetingId}/transcripts`,
          )
          .get();

        const transcripts = transcriptsResponse.value || [];
        if (transcripts.length === 0) {
          if (attempt < MAX_RETRIES) {
            this.logger.warn(
              { meetingId, attempt, retryInMs: RETRY_DELAY_MS },
              'No transcripts available yet, retrying',
            );
            await this.delay(RETRY_DELAY_MS);
            continue;
          }
          throw new Error(
            `No transcripts available for meeting ${meetingId} after ${MAX_RETRIES} retries`,
          );
        }

        // Get the first transcript's content in VTT format
        const transcriptId = transcripts[0].id;
        const vttContent = await this.graphClient
          .getClient()
          .api(
            `/users/${targetUserId}/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content`,
          )
          .query({ $format: 'text/vtt' })
          .get();

        this.logger.info(
          { meetingId, transcriptId, contentLength: vttContent.length },
          'Transcript fetched successfully',
        );

        return vttContent;
      } catch (error) {
        if (
          attempt < MAX_RETRIES &&
          error instanceof Error &&
          (error.message.includes('404') ||
            error.message.includes('Not Found'))
        ) {
          this.logger.warn(
            { meetingId, attempt, error: error.message },
            'Transcript not yet available, retrying',
          );
          await this.delay(RETRY_DELAY_MS);
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Failed to fetch transcript for meeting ${meetingId}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
