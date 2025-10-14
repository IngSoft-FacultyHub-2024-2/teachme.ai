import { Message, MessageJSON } from './Message';
import { randomUUID } from 'crypto';

/**
 * JSON representation of a Conversation
 */
export interface ConversationJSON {
  id: string;
  messages: MessageJSON[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Domain model representing a conversation with an LLM
 * Manages message history and token tracking
 */
export class Conversation {
  public readonly id: string;
  public readonly messages: Message[];
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor() {
    this.id = randomUUID();
    this.messages = [];
    this.createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Gets the last updated timestamp
   */
  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Adds a message to the conversation
   * @param message - The message to add
   */
  public addMessage(message: Message): void {
    this.messages.push(message);
    this._updatedAt = new Date();
  }

  /**
   * Gets the total token count for all messages in the conversation
   * @returns The sum of all message token counts
   */
  public getTotalTokens(): number {
    return this.messages.reduce((sum, message) => sum + message.tokenCount, 0);
  }

  /**
   * Gets the number of messages in the conversation
   * @returns The message count
   */
  public getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Clears all messages from the conversation
   */
  public clear(): void {
    this.messages.length = 0;
    this._updatedAt = new Date();
  }

  /**
   * Serializes the conversation to a JSON object
   * @returns JSON representation of the conversation
   */
  public toJSON(): ConversationJSON {
    return {
      id: this.id,
      messages: this.messages.map((msg) => msg.toJSON()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Creates a Conversation instance from a JSON object
   * @param json - The JSON representation
   * @returns A new Conversation instance
   */
  public static fromJSON(json: ConversationJSON): Conversation {
    const conversation = new Conversation();

    // Override readonly properties
    (conversation as { id: string }).id = json.id;
    (conversation as { createdAt: Date }).createdAt = new Date(json.createdAt);
    conversation._updatedAt = new Date(json.updatedAt);

    // Restore messages
    json.messages.forEach((msgJson) => {
      conversation.messages.push(Message.fromJSON(msgJson));
    });

    return conversation;
  }
}
