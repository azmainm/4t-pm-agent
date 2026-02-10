import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { OpenaiService } from './openai.service.js';
import type { ParsedTranscript } from '../processing/vtt-parser.service.js';
import { SUMMARIZATION_PROMPT } from './agent/prompts/summarization-prompt.js';

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
  llmModel: string;
  inputTokens: number;
  outputTokens: number;
}

@Injectable()
export class SummarizationService {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('SummarizationService');
  }

  async summarizeTranscript(
    transcript: ParsedTranscript,
  ): Promise<DailySummaryResult> {
    const transcriptText = transcript.segments
      .map((s) => `${s.speaker}: ${s.text}`)
      .join('\n');

    this.logger.info(
      {
        participants: transcript.participants,
        segmentCount: transcript.segments.length,
        textLength: transcriptText.length,
      },
      'Summarizing transcript',
    );

    const response = await this.openaiService.chatCompletion({
      messages: [
        { role: 'system', content: SUMMARIZATION_PROMPT },
        { role: 'user', content: transcriptText },
      ],
      response_format: { type: 'json_object' },
      // temperature: 0.2, // gpt-5-nano only supports default temperature (1)
    });

    const content = response.choices[0].message.content || '{}';
    // Handle both string (JSON) and already-parsed object responses
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;

    this.logger.info(
      {
        actionItems: parsed.actionItems?.length || 0,
        decisions: parsed.decisions?.length || 0,
        blockers: parsed.blockers?.length || 0,
      },
      'Transcript summarized',
    );

    return {
      overallSummary: parsed.overallSummary || '',
      perPersonSummary: parsed.perPersonSummary || [],
      actionItems: parsed.actionItems || [],
      decisions: parsed.decisions || [],
      blockers: parsed.blockers || [],
      keyTopics: parsed.keyTopics || [],
      llmModel: this.openaiService.getDefaultModel(),
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
    };
  }
}
