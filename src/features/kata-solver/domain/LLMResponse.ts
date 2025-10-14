/**
 * Token usage information from an LLM API call
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * JSON representation of an LLM response
 */
export interface LLMResponseJSON {
  content: string;
  usage: TokenUsage;
  model: string;
  finishReason: string;
  timestamp: string;
}

/**
 * Domain model representing a response from the LLM
 */
export class LLMResponse {
  public readonly content: string;
  public readonly usage: TokenUsage;
  public readonly model: string;
  public readonly finishReason: string;
  public readonly timestamp: Date;

  constructor(
    content: string,
    usage: TokenUsage,
    model: string,
    finishReason: string
  ) {
    this.validateContent(content);
    this.validateUsage(usage);

    this.content = content;
    this.usage = usage;
    this.model = model;
    this.finishReason = finishReason;
    this.timestamp = new Date();
  }

  /**
   * Validates response content
   * @param content - The response content
   * @throws Error if content is empty
   */
  private validateContent(content: string): void {
    if (!content || content.trim() === '') {
      throw new Error('Response content cannot be empty');
    }
  }

  /**
   * Validates token usage
   * @param usage - The token usage object
   * @throws Error if validation fails
   */
  private validateUsage(usage: TokenUsage): void {
    if (
      usage.promptTokens < 0 ||
      usage.completionTokens < 0 ||
      usage.totalTokens < 0
    ) {
      throw new Error('Token counts must be non-negative');
    }

    if (usage.totalTokens !== usage.promptTokens + usage.completionTokens) {
      throw new Error('Total tokens must equal promptTokens + completionTokens');
    }
  }

  /**
   * Serializes the response to a JSON object
   * @returns JSON representation of the response
   */
  public toJSON(): LLMResponseJSON {
    return {
      content: this.content,
      usage: this.usage,
      model: this.model,
      finishReason: this.finishReason,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Creates an LLMResponse instance from a JSON object
   * @param json - The JSON representation
   * @returns A new LLMResponse instance
   */
  public static fromJSON(json: LLMResponseJSON): LLMResponse {
    const response = new LLMResponse(
      json.content,
      json.usage,
      json.model,
      json.finishReason
    );
    // Override timestamp with the one from JSON
    (response as { timestamp: Date }).timestamp = new Date(json.timestamp);
    return response;
  }
}
