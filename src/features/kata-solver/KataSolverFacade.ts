import { OpenAIConfig } from './services/OpenAIConfig';
import { OpenAIService } from './services/OpenAIService';
import { KataSolverService } from './services/KataSolverService';
import { Result } from '../../shared/types/Result';

/**
 * Facade for the KataSolverService functionality
 * All interaction is via strings and conversation IDs only
 */
export class KataSolverFacade {
  private readonly config: OpenAIConfig;
  private readonly openAIService: OpenAIService;
  private readonly kataSolver: KataSolverService;

  public constructor() {
    this.config = new OpenAIConfig();
    this.openAIService = new OpenAIService(this.config);
    this.kataSolver = new KataSolverService(this.openAIService);
  }

  /**
   * Starts a new conversation with an initial prompt
   * @param initialPrompt - The initial user prompt
   * @returns Result with conversationId and assistant response (both strings)
   */
  public async startConversation(initialPrompt: string): Promise<Result<{ conversationId: string; response: string }>> {
    const result = await this.kataSolver.startConversation(initialPrompt);
    if (!result.success) return result;
    const conversation = result.value;
    const messages = conversation.messages;
    const assistantMsg = messages.find(m => m.role === 'assistant');
    return {
      success: true,
      value: {
        conversationId: conversation.id,
        response: assistantMsg ? assistantMsg.content : ''
      }
    };
  }

  /**
   * Continues an existing conversation with a new user message
   * @param conversationId - The ID of the conversation
   * @param userMessage - The user's message
   * @returns Result with assistant response (string)
   */
  public async continueConversation(conversationId: string, userMessage: string): Promise<Result<string>> {
    const result = await this.kataSolver.continueConversation(conversationId, userMessage);
    if (!result.success) return result;
    return {
      success: true,
      value: result.value.content
    };
  }

  /**
   * Gets the message history for a conversation as an array of strings
   * @param conversationId - The ID of the conversation
   * @returns Result with array of message contents (strings)
   */
  public getConversationHistory(conversationId: string): Result<string[]> {
    const result = this.kataSolver.getConversationHistory(conversationId);
    if (!result.success) return result;
    return {
      success: true,
      value: result.value.map(m => m.content)
    };
  }

  /**
   * Resets a conversation by clearing all messages
   * @param conversationId - The ID of the conversation
   * @returns Result indicating success or error
   */
  public resetConversation(conversationId: string): Result<void> {
    return this.kataSolver.resetConversation(conversationId);
  }

  /**
   * Gets the total token count for a conversation
   * @param conversationId - The ID of the conversation
   * @returns Result with token count (number)
   */
  public getConversationTokenCount(conversationId: string): Result<number> {
    return this.kataSolver.getConversationTokenCount(conversationId);
  }

  /**
   * Gets detailed token breakdown for a conversation
   * @param conversationId - The ID of the conversation
   * @returns Result with token breakdown (numbers)
   */
  public getConversationTokenBreakdown(conversationId: string): Result<{ totalTokens: number; messageCount: number }> {
    return this.kataSolver.getConversationTokenBreakdown(conversationId);
  }
}
