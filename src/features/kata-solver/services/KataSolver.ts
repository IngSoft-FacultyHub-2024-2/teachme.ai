import { OpenAIService } from './OpenAIService';
import { Conversation } from '../domain/Conversation';
import { Message } from '../domain/Message';
import { LLMResponse } from '../domain/LLMResponse';
import { Result, success, failure } from '../../../shared/types/Result';

/**
 * Token breakdown information for a conversation
 */
export interface TokenBreakdown {
  totalTokens: number;
  messageCount: number;
}

/**
 * Service for managing kata-solving dialogues with an LLM
 * Orchestrates conversation state and OpenAI API interactions
 */
export class KataSolver {
  private readonly openAIService: OpenAIService;
  private readonly conversations: Map<string, Conversation>;

  constructor(openAIService: OpenAIService) {
    this.openAIService = openAIService;
    this.conversations = new Map();
  }

  /**
   * Starts a new conversation with an initial prompt
   * @param initialPrompt - The initial user prompt
   * @returns Result containing the new Conversation or error
   */
  public async startConversation(
    initialPrompt: string
  ): Promise<Result<Conversation>> {
    // Validate prompt
    if (!initialPrompt || initialPrompt.trim() === '') {
      return failure(new Error('Prompt cannot be empty'));
    }

    try {
      // Create new conversation
      const conversation = new Conversation();

      // Send initial message to OpenAI
      const llmResult = await this.openAIService.sendMessage(initialPrompt);

      if (!llmResult.success) {
        return failure(llmResult.error);
      }

      // Add user message
      const userMessage = new Message(
        'user',
        initialPrompt,
        llmResult.value.usage.promptTokens
      );
      conversation.addMessage(userMessage);

      // Add assistant response
      const assistantMessage = new Message(
        'assistant',
        llmResult.value.content,
        llmResult.value.usage.completionTokens
      );
      conversation.addMessage(assistantMessage);

      // Store conversation
      this.conversations.set(conversation.id, conversation);

      return success(conversation);
    } catch (error) {
      if (error instanceof Error) {
        return failure(error);
      }
      return failure(new Error('Unknown error starting conversation'));
    }
  }

  /**
   * Continues an existing conversation with a new user message
   * @param conversationId - The ID of the conversation
   * @param userMessage - The user's message
   * @returns Result containing the LLM response or error
   */
  public async continueConversation(
    conversationId: string,
    userMessage: string
  ): Promise<Result<LLMResponse>> {
    // Validate user message
    if (!userMessage || userMessage.trim() === '') {
      return failure(new Error('User message cannot be empty'));
    }

    // Get conversation
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return failure(new Error(`Conversation not found: ${conversationId}`));
    }

    try {
      // Send message with conversation history
      const llmResult = await this.openAIService.sendMessage(
        userMessage,
        conversation.messages
      );

      if (!llmResult.success) {
        return failure(llmResult.error);
      }

      // Add user message to conversation
      const newUserMessage = new Message(
        'user',
        userMessage,
        llmResult.value.usage.promptTokens - conversation.getTotalTokens()
      );
      conversation.addMessage(newUserMessage);

      // Add assistant response to conversation
      const assistantMessage = new Message(
        'assistant',
        llmResult.value.content,
        llmResult.value.usage.completionTokens
      );
      conversation.addMessage(assistantMessage);

      return success(llmResult.value);
    } catch (error) {
      if (error instanceof Error) {
        return failure(error);
      }
      return failure(new Error('Unknown error continuing conversation'));
    }
  }

  /**
   * Retrieves a conversation by ID
   * @param conversationId - The ID of the conversation
   * @returns Result containing the Conversation or error
   */
  public getConversation(conversationId: string): Result<Conversation> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return failure(new Error(`Conversation not found: ${conversationId}`));
    }
    return success(conversation);
  }

  /**
   * Gets the message history for a conversation
   * @param conversationId - The ID of the conversation
   * @returns Result containing the message array or error
   */
  public getConversationHistory(conversationId: string): Result<Message[]> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return failure(new Error(`Conversation not found: ${conversationId}`));
    }
    return success(conversation.messages);
  }

  /**
   * Resets a conversation by clearing all messages
   * @param conversationId - The ID of the conversation
   * @returns Result indicating success or error
   */
  public resetConversation(conversationId: string): Result<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return failure(new Error(`Conversation not found: ${conversationId}`));
    }
    conversation.clear();
    return success(undefined);
  }

  /**
   * Gets the total token count for a conversation
   * @param conversationId - The ID of the conversation
   * @returns Result containing the token count or error
   */
  public getConversationTokenCount(conversationId: string): Result<number> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return failure(new Error(`Conversation not found: ${conversationId}`));
    }
    return success(conversation.getTotalTokens());
  }

  /**
   * Gets detailed token breakdown for a conversation
   * @param conversationId - The ID of the conversation
   * @returns Result containing the token breakdown or error
   */
  public getConversationTokenBreakdown(
    conversationId: string
  ): Result<TokenBreakdown> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return failure(new Error(`Conversation not found: ${conversationId}`));
    }

    const breakdown: TokenBreakdown = {
      totalTokens: conversation.getTotalTokens(),
      messageCount: conversation.getMessageCount(),
    };

    return success(breakdown);
  }
}
