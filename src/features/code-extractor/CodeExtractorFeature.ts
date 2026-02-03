import { OpenAIConfig } from '../kata-solver/services/OpenAIConfig';
import { CodeExtractorService } from './services/CodeExtractorService';
import { ExtractedCode } from './domain/ExtractedCode';
import { Result } from '../../shared/types/Result';

/**
 * Feature for extracting code from text using OpenAI
 */
export class CodeExtractorFeature {
  private readonly service: CodeExtractorService;

  public constructor() {
    const config = new OpenAIConfig();
    this.service = new CodeExtractorService(config);
  }

  /**
   * Extracts code from the provided text
   * @param text - The input text containing code to extract
   * @returns Result with ExtractedCode
   */
  public async extractCode(text: string): Promise<Result<ExtractedCode>> {
    return this.service.extractCode(text);
  }
}
