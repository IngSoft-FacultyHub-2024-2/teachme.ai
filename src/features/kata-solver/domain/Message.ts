/**
 * Valid message roles for LLM conversations
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * JSON representation of a Message
 */
export interface MessageJSON {
  role: MessageRole;
  content: string;
  tokenCount: number;
  timestamp: string;
}

/**
 * Domain model representing a single message in an LLM conversation
 */
export class Message {
  public readonly role: MessageRole;
  public readonly content: string;
  public readonly tokenCount: number;
  public readonly timestamp: Date;

  constructor(role: MessageRole, content: string, tokenCount: number) {
    this.validateContent(content);
    this.validateTokenCount(tokenCount);

    this.role = role;
    this.content = content;
    this.tokenCount = tokenCount;
    this.timestamp = new Date();
  }

  /**
   * Validates message content
   * @param content - The message content
   * @throws Error if content is empty
   */
  private validateContent(content: string): void {
    if (!content || content.trim() === '') {
      throw new Error('Message content cannot be empty');
    }
  }

  /**
   * Validates token count
   * @param tokenCount - The token count
   * @throws Error if token count is not positive
   */
  private validateTokenCount(tokenCount: number): void {
    if (tokenCount < 0) {
      throw new Error('Token count must be non-negative');
    }
  }

  /**
   * Serializes the message to a JSON object
   * @returns JSON representation of the message
   */
  public toJSON(): MessageJSON {
    return {
      role: this.role,
      content: this.content,
      tokenCount: this.tokenCount,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Creates a Message instance from a JSON object
   * @param json - The JSON representation
   * @returns A new Message instance
   */
  public static fromJSON(json: MessageJSON): Message {
    const message = new Message(json.role, json.content, json.tokenCount);
    // Override timestamp with the one from JSON
    (message as { timestamp: Date }).timestamp = new Date(json.timestamp);
    return message;
  }
}
