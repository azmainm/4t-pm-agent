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
export declare class VttParserService {
    parse(vttContent: string): ParsedTranscript;
    private mergeConsecutiveSegments;
}
