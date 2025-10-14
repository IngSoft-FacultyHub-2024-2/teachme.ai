import OpenAI from 'openai';
import { OpenAIConfig } from './OpenAIConfig';
import { LLMResponse } from '../domain/LLMResponse';
import { Message } from '../domain/Message';
import { Result, success, failure } from '../../../shared/types/Result';

/**
 * Service wrapper for OpenAI API interactions
 * Handles communication with the OpenAI API and token tracking
 */
export class OpenAIService {
  private readonly client: OpenAI;
  private readonly config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  /**
   * Sends a message to the OpenAI API
   * @param prompt - The user's message/prompt
   * @param conversationHistory - Optional previous messages for context
   * @returns Result containing LLMResponse or error
   */
  public async sendMessage(
    prompt: string,
    conversationHistory?: Message[]
  ): Promise<Result<LLMResponse>> {
    try {
      // Build messages array
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      // Add conversation history if provided
      if (conversationHistory) {
        for (const msg of conversationHistory) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      // Add current prompt
      messages.push({
        role: 'user',
        content: prompt,
      });

      // Make API call
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      // Validate response
      const choice = completion.choices[0];
      if (!choice || !choice.message.content) {
        return failure(new Error('No response content from OpenAI API'));
      }

      // Extract token usage
      const usage = completion.usage;
      if (!usage) {
        return failure(new Error('No usage information from OpenAI API'));
      }

      // Create LLMResponse
      const llmResponse = new LLMResponse(
        choice.message.content,
        {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        completion.model,
        choice.finish_reason ?? 'unknown'
      );

      return success(llmResponse);
    } catch (error) {
      if (error instanceof Error) {
        return failure(new Error(`OpenAI API error: ${error.message}`));
      }
      return failure(new Error('Unknown error occurred while calling OpenAI API'));
    }
  }
}
