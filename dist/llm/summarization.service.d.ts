import { PinoLogger } from 'nestjs-pino';
import { OpenaiService } from './openai.service.js';
import type { ParsedTranscript } from '../processing/vtt-parser.service.js';
export interface DailySummaryResult {
    overallSummary: string;
    perPersonSummary: Array<{
        person: string;
        progressItems: string[];
        blockers: string[];
        commitments: string[];
    }>;
    actionItems: string[];
    decisions: string[];
    blockers: string[];
    keyTopics: string[];
    upcomingWork: Array<{
        task: string;
        owner: string;
        status: string;
        targetSprint: string;
        priority: string;
    }>;
    llmModel: string;
    inputTokens: number;
    outputTokens: number;
}
export declare class SummarizationService {
    private readonly openaiService;
    private readonly logger;
    constructor(openaiService: OpenaiService, logger: PinoLogger);
    summarizeTranscript(transcript: ParsedTranscript): Promise<DailySummaryResult>;
}
