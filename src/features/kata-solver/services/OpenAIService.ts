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
      // Build a single input string that includes conversation history (preserve roles)
      let input = '';
      if (conversationHistory && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          input += `${msg.role.toUpperCase()}: ${msg.content}\n`;
        }
      }
      input += `USER: ${prompt}`;
      return await this.callResponses(input);
    } catch (error) {
      if (error instanceof Error) {
        return failure(new Error(`OpenAI API error: ${error.message}`));
      }
      return failure(new Error('Unknown error occurred while calling OpenAI API'));
    }
  }

  /**
   * Send a prompt that includes developer instructions at the top.
   * Developer instructions are prefixed as a reusable block so callers can pass a template.
   */
  public async sendWithDeveloperInstructions(
    developerInstructions: string,
    prompt: string,
    conversationHistory?: Message[]
  ): Promise<Result<LLMResponse>> {
    // If developerInstructions is not provided, fall back to environment variable
    const devInstrFromEnv = process.env.DEVELOPER_INSTRUCTIONS;
    const finalDeveloperInstructions = (developerInstructions && typeof developerInstructions === 'string' && developerInstructions.trim() !== '')
      ? developerInstructions
      : (typeof devInstrFromEnv === 'string' && devInstrFromEnv.trim() !== '' ? devInstrFromEnv : '');

    // Validate final developer instructions and prompt
    if (!finalDeveloperInstructions || typeof finalDeveloperInstructions !== 'string' || finalDeveloperInstructions.trim() === '') {
      return failure(new Error('Developer instructions must be provided either as an argument or via DEVELOPER_INSTRUCTIONS environment variable'));
    }
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return failure(new Error('Prompt must be a non-empty string'));
    }

    // Build input that places developer instructions first so the model sees them as system-level guidance
  let input = `DEVELOPER_INSTRUCTIONS:\n${finalDeveloperInstructions.trim()}\n\n`;
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        input += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      }
    }
    input += `USER: ${prompt}`;

    return await this.callResponses(input);
  }

  /**
   * Internal helper that runs the Responses API call and parses the result into LLMResponse.
   */
  private async callResponses(input: string): Promise<Result<LLMResponse>> {
    let resp: any;
    try {
      // Read optional prompt id/version from environment so callers can configure
      // a reusable prompt template via env vars without changing code.
      const promptId = process.env.OPENAI_PROMPT_ID;
      const promptVersion = process.env.OPENAI_PROMPT_VERSION;

      const params: any = {
        model: this.config.model,
        input,
        max_output_tokens: this.config.maxTokens,
      };

      if (promptId && typeof promptId === 'string' && promptId.trim() !== '') {
        params.prompt = {
          id: promptId.trim(),
          ...(promptVersion && typeof promptVersion === 'string' && promptVersion.trim() !== '' ? { version: promptVersion.trim() } : {}),
        };
      }

      resp = await this.client.responses.create(params);
    } catch (apiError: any) {
      return failure(new Error(`OpenAI Responses API error: ${apiError?.message ?? apiError}`));
    }

    // Extract textual content robustly (sdk can return output_text or structured output array)
    let content = '';
    if (typeof resp.output_text === 'string' && resp.output_text.trim() !== '') {
      content = resp.output_text;
    } else if (Array.isArray(resp.output)) {
      for (const out of resp.output) {
        // out may be a string, or an object with a content array
        if (typeof out === 'string') {
          content += out;
          continue;
        }
        if (Array.isArray(out.content)) {
          for (const chunk of out.content) {
            if (typeof chunk === 'string') {
              content += chunk;
            } else if (typeof chunk?.text === 'string') {
              content += chunk.text;
            }
          }
        } else if (typeof out.content === 'string') {
          content += out.content;
        }
      }
    }

    if (!content || content.trim() === '') {
      return failure(new Error('No response content from OpenAI Responses API'));
    }

    // Token counts are not used by the application; return zeros to avoid
    // propagation of token-count related errors or model-specific usage fields.
    const promptTokens = 0;
    const completionTokens = 0;
    const totalTokens = 0;

    // Build LLMResponse with zeroed usage; domain model accepts zero values.
    const llmResponse = new LLMResponse(
      content,
      {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      resp.model ?? this.config.model,
      resp.finish_reason ?? resp.status?.type ?? 'unknown'
    );

    return success(llmResponse);
  }
}
