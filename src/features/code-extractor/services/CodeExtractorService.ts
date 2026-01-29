import OpenAI from 'openai';
import { OpenAIConfig } from '../../kata-solver/services/OpenAIConfig';
import { ExtractedCode } from '../domain/ExtractedCode';
import { Result, success, failure } from '../../../shared/types/Result';

/**
 * Service for extracting code from text using OpenAI Responses API
 */
export class CodeExtractorService {
  private readonly client: OpenAI;
  private readonly config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  /**
   * Extracts code from the provided text using OpenAI Responses API
   * @param text - The input text containing code to extract
   * @returns Result with ExtractedCode
   */
  public async extractCode(text: string): Promise<Result<ExtractedCode>> {
    try {
      // Validate input
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return failure(new Error('Input text must be a non-empty string'));
      }

      // Call OpenAI Responses API
      const response = await this.callResponsesAPI(text);

      if (!response.success) {
        return response;
      }

      // Create ExtractedCode domain object
      const extractedCode = new ExtractedCode(
        text,
        response.value,
        this.detectLanguage(response.value)
      );

      return success(extractedCode);
    } catch (error) {
      if (error instanceof Error) {
        return failure(new Error(`Code extraction error: ${error.message}`));
      }
      return failure(new Error('Unknown error occurred during code extraction'));
    }
  }

  /**
   * Calls the OpenAI Responses API
   * @param input - The input text to send to the API
   * @returns Result with the API response content
   */
  private async callResponsesAPI(input: string): Promise<Result<string>> {
    let resp: any;

    try {
      // Read code extractor prompt id/version from environment
      const promptId = process.env.CODE_EXTRACTOR_PROMPT_ID;
      const promptVersion = process.env.CODE_EXTRACTOR_PROMPT_VERSION;

      const params: any = {
        model: this.config.model,
        input,
        max_output_tokens: this.config.maxTokens,
      };

      // If prompt ID is configured, use it
      if (promptId && typeof promptId === 'string' && promptId.trim() !== '') {
        params.prompt = {
          id: promptId.trim(),
          ...(promptVersion && typeof promptVersion === 'string' && promptVersion.trim() !== ''
            ? { version: promptVersion.trim() }
            : {}),
        };
      }

      resp = await this.client.responses.create(params);
    } catch (apiError: any) {
      return failure(new Error(`OpenAI Responses API error: ${apiError?.message ?? apiError}`));
    }

    // Extract textual content
    let content = '';4
    if (typeof resp.output_text === 'string' && resp.output_text.trim() !== '') {
      content = resp.output_text;
    } else if (Array.isArray(resp.output)) {
      for (const out of resp.output) {
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

    return success(content);
  }

  /**
   * Attempts to detect the programming language from the extracted code
   * @param code - The extracted code
   * @returns The detected language or undefined
   */
  private detectLanguage(code: string): string | undefined {
    const trimmedCode = code.trim();

    // Simple language detection based on common patterns
    if (
      trimmedCode.includes('function') ||
      trimmedCode.includes('const ') ||
      trimmedCode.includes('let ')
    ) {
      return 'typescript';
    }
    if (trimmedCode.includes('def ') || trimmedCode.includes('import ')) {
      return 'python';
    }
    if (trimmedCode.includes('public class') || trimmedCode.includes('private ')) {
      return 'java';
    }

    return undefined;
  }
}
