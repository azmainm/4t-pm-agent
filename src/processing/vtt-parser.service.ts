import { Injectable } from '@nestjs/common';

export interface TranscriptSegment {
  speaker: string;
  text: string;
  startTime: string;
  endTime: string;
}

export interface ParsedTranscript {
  segments: TranscriptSegment[];
  participants: string[];
}

@Injectable()
export class VttParserService {
  parse(vttContent: string): ParsedTranscript {
    const lines = vttContent.split('\n');
    const rawSegments: TranscriptSegment[] = [];

    let currentStartTime = '';
    let currentEndTime = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match timestamp lines: 00:00:00.000 --> 00:00:05.000
      const timestampMatch = line.match(
        /(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})/,
      );

      if (timestampMatch) {
        currentStartTime = timestampMatch[1];
        currentEndTime = timestampMatch[2];
        continue;
      }

      // Skip WEBVTT header and empty lines
      if (
        !line ||
        line === 'WEBVTT' ||
        line.startsWith('NOTE') ||
        /^\d+$/.test(line)
      ) {
        continue;
      }

      // Content line — may contain "Speaker: text" format
      if (currentStartTime) {
        const speakerMatch = line.match(/^<v\s+([^>]+)>(.+)$/);
        let speaker: string;
        let text: string;

        if (speakerMatch) {
          speaker = speakerMatch[1].trim();
          text = speakerMatch[2].replace(/<\/v>/, '').trim();
        } else {
          // Try "Speaker: text" format
          const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
          if (colonMatch && colonMatch[1].length < 50) {
            speaker = colonMatch[1].trim();
            text = colonMatch[2].trim();
          } else {
            speaker = 'Unknown';
            text = line;
          }
        }

        rawSegments.push({
          speaker,
          text,
          startTime: currentStartTime,
          endTime: currentEndTime,
        });
        currentStartTime = '';
      }
    }

    // Merge consecutive segments from the same speaker
    const mergedSegments = this.mergeConsecutiveSegments(rawSegments);

    // Extract unique participants
    const participants = [
      ...new Set(
        mergedSegments
          .map((s) => s.speaker)
          .filter((s) => s !== 'Unknown'),
      ),
    ];

    return { segments: mergedSegments, participants };
  }

  private mergeConsecutiveSegments(
    segments: TranscriptSegment[],
  ): TranscriptSegment[] {
    if (segments.length === 0) return [];

    const merged: TranscriptSegment[] = [{ ...segments[0] }];

    for (let i = 1; i < segments.length; i++) {
      const current = segments[i];
      const last = merged[merged.length - 1];

      if (current.speaker === last.speaker) {
        last.text += ' ' + current.text;
        last.endTime = current.endTime;
      } else {
        merged.push({ ...current });
      }
    }

    return merged;
  }
}
