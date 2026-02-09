import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type {
  ChatCompletionMessageParam,
  ChatCompletionAssistantMessageParam,
} from 'openai/resources/chat/completions';
import { OpenaiService } from '../openai.service.js';
import { AgentToolsRegistry } from './agent-tools.registry.js';
import {
  SprintPlanOutputSchema,
  type SprintPlanOutput,
} from '../dto/sprint-plan-output.dto.js';

const MAX_ITERATIONS = 15;
const MAX_VALIDATION_RETRIES = 2;

export interface AgentIteration {
  iteration: number;
  toolCalls: string[];
  inputTokens: number;
  outputTokens: number;
  finishReason: string;
}

export interface AgentRunResult {
  plan: SprintPlanOutput;
  iterations: AgentIteration[];
  totalInputTokens: number;
  totalOutputTokens: number;
}

@Injectable()
export class ReactAgentService {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly toolsRegistry: AgentToolsRegistry,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('ReactAgentService');
  }

  async runSprintPlanAgent(
    systemPrompt: string,
    userMessage: string,
  ): Promise<AgentRunResult> {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const iterations: AgentIteration[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let finalPlan: SprintPlanOutput | null = null;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      this.logger.info({ iteration: i }, 'Agent iteration starting');

      const response = await this.openaiService.chatCompletion({
        messages,
        tools: this.toolsRegistry.getToolDefinitions(),
        tool_choice: 'auto',
        temperature: 0.3,
      });

      const message = response.choices[0].message;
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      totalInputTokens += inputTokens;
      totalOutputTokens += outputTokens;

      // Add assistant message to history
      messages.push(message as ChatCompletionAssistantMessageParam);

      const toolCallNames = (message.tool_calls || []).map(
        (tc) => (tc as any).function.name,
      );

      iterations.push({
        iteration: i,
        toolCalls: toolCallNames,
        inputTokens,
        outputTokens,
        finishReason: response.choices[0].finish_reason || 'unknown',
      });

      this.logger.info(
        {
          iteration: i,
          toolCalls: toolCallNames,
          finishReason: response.choices[0].finish_reason,
        },
        'Agent iteration complete',
      );

      // No tool calls — agent is done
      if (!message.tool_calls || message.tool_calls.length === 0) {
        if (message.content) {
          finalPlan = this.parseAndValidateOutput(message.content);
        }
        break;
      }

      // Execute each tool call
      for (const toolCall of message.tool_calls) {
        const toolName = (toolCall as any).function.name;
        const toolArgs = JSON.parse((toolCall as any).function.arguments || '{}');

        try {
          const result = await this.toolsRegistry.executeTool(
            toolName,
            toolArgs,
          );

          // Check if this is the generate_sprint_plan tool (final output)
          if (toolName === 'generate_sprint_plan' && toolArgs.plan) {
            finalPlan = this.parseAndValidateOutput(
              JSON.stringify(toolArgs.plan),
            );
          }

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content:
              typeof result === 'string' ? result : JSON.stringify(result),
          });
        } catch (error) {
          this.logger.error(
            { toolName, error: (error as Error).message },
            'Tool execution failed',
          );
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: (error as Error).message,
            }),
          });
        }
      }

      // If we got a valid plan from generate_sprint_plan, we're done
      if (finalPlan) break;
    }

    if (!finalPlan) {
      throw new Error(
        `Agent failed to produce a valid sprint plan after ${MAX_ITERATIONS} iterations`,
      );
    }

    return {
      plan: finalPlan,
      iterations,
      totalInputTokens,
      totalOutputTokens,
    };
  }

  private parseAndValidateOutput(content: string): SprintPlanOutput {
    // Try to extract JSON from the content
    let jsonStr = content.trim();

    // Handle markdown code blocks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    const result = SprintPlanOutputSchema.safeParse(parsed);

    if (!result.success) {
      this.logger.warn(
        { errors: result.error.issues },
        'Sprint plan output validation failed',
      );
      throw new Error(
        `Output validation failed: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      );
    }

    return result.data;
  }
}
