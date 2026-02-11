import { PinoLogger } from 'nestjs-pino';
export interface ContextInput {
    dailySummaries: Array<{
        date: Date;
        overallSummary: string;
        actionItems: string[];
        decisions: string[];
        blockers: string[];
        perPersonSummary: Array<{
            person: string;
            progressItems: string[];
            blockers: string[];
            commitments: string[];
        }>;
    }>;
    teamsMessages: Array<{
        senderName: string;
        content: string;
        sentAt: Date;
        channelOrChatName: string;
        source: string;
    }>;
    previousPlanText: string;
}
export declare class ContextBuilderService {
    private readonly logger;
    constructor(logger: PinoLogger);
    buildSprintPlanContext(input: ContextInput): string;
}
