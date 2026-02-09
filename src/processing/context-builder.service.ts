import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ContextBuilderService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('ContextBuilderService');
  }

  buildSprintPlanContext(input: ContextInput): string {
    const sections: string[] = [];

    // Section 1: Daily Standup Summaries
    sections.push('=== DAILY STANDUP SUMMARIES (Last 2 Weeks) ===\n');
    for (const summary of input.dailySummaries) {
      const dateStr = summary.date.toISOString().split('T')[0];
      sections.push(`--- ${dateStr} ---`);
      sections.push(summary.overallSummary);

      if (summary.actionItems.length > 0) {
        sections.push('\nAction Items:');
        summary.actionItems.forEach((item) => sections.push(`  - ${item}`));
      }
      if (summary.decisions.length > 0) {
        sections.push('\nDecisions:');
        summary.decisions.forEach((d) => sections.push(`  - ${d}`));
      }
      if (summary.blockers.length > 0) {
        sections.push('\nBlockers:');
        summary.blockers.forEach((b) => sections.push(`  - ${b}`));
      }

      sections.push('\nPer Person:');
      for (const person of summary.perPersonSummary) {
        sections.push(`  ${person.person}:`);
        person.progressItems.forEach((p) =>
          sections.push(`    Progress: ${p}`),
        );
        person.blockers.forEach((b) => sections.push(`    Blocker: ${b}`));
        person.commitments.forEach((c) =>
          sections.push(`    Commitment: ${c}`),
        );
      }
      sections.push('');
    }

    // Section 2: Teams Messages
    sections.push('\n=== TEAMS MESSAGES (Last 2 Weeks) ===\n');
    const sortedMessages = [...input.teamsMessages].sort(
      (a, b) => a.sentAt.getTime() - b.sentAt.getTime(),
    );
    for (const msg of sortedMessages) {
      const dateStr = msg.sentAt.toISOString().split('T')[0];
      sections.push(
        `[${dateStr}] [${msg.source}:${msg.channelOrChatName}] ${msg.senderName}: ${msg.content}`,
      );
    }

    // Section 3: Previous Sprint Plan
    if (input.previousPlanText) {
      sections.push('\n=== PREVIOUS SPRINT PLAN ===\n');
      sections.push(input.previousPlanText);
    }

    const context = sections.join('\n');
    const estimatedTokens = Math.ceil(context.length / 4);

    this.logger.info(
      {
        summaryCount: input.dailySummaries.length,
        messageCount: input.teamsMessages.length,
        previousPlanFound: !!input.previousPlanText,
        contextLength: context.length,
        estimatedTokens,
      },
      'Sprint plan context built',
    );

    return context;
  }
}
