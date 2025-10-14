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

  public async sendMessage(
    prompt: string,
    conversationHistory?: Message[]
  ): Promise<Result<LLMResponse>> {
    try {
      // Validate prompt
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return failure(new Error('Prompt must be a non-empty string'));
      }

      // Build messages array
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      if (conversationHistory) {
        for (const msg of conversationHistory) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
      messages.push({ role: 'user', content: prompt });

      // Prepare API call parameters (typed)
      const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
        model: this.config.model,
        messages,
        max_completion_tokens: this.config.maxTokens,
        // Only set temperature if model supports it and value is valid
        ...(typeof this.config.temperature === 'number' && this.config.temperature === 1 ? { temperature: 1 } : {}),
      };

      // Make API call
      let completion;
      try {
        completion = await this.client.chat.completions.create(params);
      } catch (apiError: any) {
        return failure(new Error(`OpenAI API error: ${apiError.message}`));
      }

      // Validate response
      const choice = completion.choices?.[0];
      if (!choice || !choice.message?.content) {
        return failure(new Error('No response content from OpenAI API'));
      }

      // Extract and validate token usage
      const usage = completion.usage;
      if (!usage ||
        typeof usage.prompt_tokens !== 'number' || usage.prompt_tokens < 0 ||
        typeof usage.completion_tokens !== 'number' || usage.completion_tokens < 0 ||
        typeof usage.total_tokens !== 'number' || usage.total_tokens < 0 ||
        usage.total_tokens !== usage.prompt_tokens + usage.completion_tokens
      ) {
        return failure(new Error('Invalid or missing usage information from OpenAI API'));
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
