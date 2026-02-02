import { KataSolverService } from '../../../../src/features/kata-solver/services/KataSolverService';
import { OpenAIService } from '../../../../src/features/kata-solver/services/OpenAIService';
import { LLMResponse } from '../../../../src/features/kata-solver/domain/LLMResponse';
import { success, failure } from '../../../../src/shared/types/Result';

// Mock the OpenAIService
jest.mock('../../../../src/features/kata-solver/services/OpenAIService');

describe('KataSolverService', () => {
  let kataSolver: KataSolverService;
  let mockOpenAIService: jest.Mocked<OpenAIService>;

  beforeEach(() => {
    mockOpenAIService = new OpenAIService(null as never) as jest.Mocked<OpenAIService>;
    kataSolver = new KataSolverService(mockOpenAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startConversation', () => {
    it('should start a new conversation with initial prompt', async () => {
      const mockResponse = new LLMResponse(
        'Hello! I can help you solve this kata.',
        { promptTokens: 20, completionTokens: 15, totalTokens: 35 },
        'gpt-4',
        'stop'
      );
      mockOpenAIService.sendMessage = jest.fn().mockResolvedValue(success(mockResponse));

      const result = await kataSolver.startConversation('Solve fibonacci kata');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.messages).toHaveLength(2); // user + assistant
        expect(result.value.messages[0]?.role).toBe('user');
        expect(result.value.messages[0]?.content).toBe('Solve fibonacci kata');
        expect(result.value.messages[1]?.role).toBe('assistant');
        expect(result.value.getTotalTokens()).toBeGreaterThan(0);
      }
    });

    it('should return failure when OpenAI service fails', async () => {
      mockOpenAIService.sendMessage = jest
        .fn()
        .mockResolvedValue(failure(new Error('API Error')));

      const result = await kataSolver.startConversation('Test prompt');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('API Error');
      }
    });

    it('should validate that prompt is not empty', async () => {
      const result = await kataSolver.startConversation('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Prompt cannot be empty');
      }
    });
  });

  describe('continueConversation', () => {
    it('should continue an existing conversation', async () => {
      // Start conversation first
      const initialResponse = new LLMResponse(
        'Initial response',
        { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        'gpt-4',
        'stop'
      );
      mockOpenAIService.sendMessage = jest.fn().mockResolvedValue(success(initialResponse));
      const startResult = await kataSolver.startConversation('Initial prompt');
      expect(startResult.success).toBe(true);

      if (!startResult.success) return;
      const conversationId = startResult.value.id;

      // Continue conversation
      const continueResponse = new LLMResponse(
        'Continued response',
        { promptTokens: 30, completionTokens: 20, totalTokens: 50 },
        'gpt-4',
        'stop'
      );
      mockOpenAIService.sendMessage = jest.fn().mockResolvedValue(success(continueResponse));

      const result = await kataSolver.continueConversation(conversationId, 'Follow-up question');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.content).toBe('Continued response');
        expect(result.value.usage.totalTokens).toBe(50);
      }

      // Verify conversation was updated
      const convResult = kataSolver.getConversation(conversationId);
      expect(convResult.success).toBe(true);
      if (convResult.success) {
        expect(convResult.value.messages).toHaveLength(4); // 2 from start + 2 from continue
      }
    });

    it('should return failure when conversation does not exist', async () => {
      const result = await kataSolver.continueConversation(
        'non-existent-id',
        'Test message'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Conversation not found');
      }
    });

    it('should validate that user message is not empty', async () => {
      const initialResponse = new LLMResponse(
        'Response',
        { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        'gpt-4',
        'stop'
      );
      mockOpenAIService.sendMessage = jest.fn().mockResolvedValue(success(initialResponse));
      const startResult = await kataSolver.startConversation('Initial');
      expect(startResult.success).toBe(true);

      if (!startResult.success) return;

      const result = await kataSolver.continueConversation(startResult.value.id, '');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('User message cannot be empty');
      }
    });
  });

  describe('getConversation', () => {
    it('should retrieve an existing conversation', async () => {
      const mockResponse = new LLMResponse(
        'Response',
        { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        'gpt-4',
        'stop'
      );
      mockOpenAIService.sendMessage = jest.fn().mockResolvedValue(success(mockResponse));
      const startResult = await kataSolver.startConversation('Test');
      expect(startResult.success).toBe(true);

      if (!startResult.success) return;
      const conversationId = startResult.value.id;

      const result = kataSolver.getConversation(conversationId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe(conversationId);
        expect(result.value.messages.length).toBeGreaterThan(0);
      }
    });

    it('should return failure when conversation does not exist', () => {
      const result = kataSolver.getConversation('non-existent-id');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Conversation not found');
      }
    });
  });

  describe('getConversationHistory', () => {
    it('should return all messages from a conversation', async () => {
      const mockResponse = new LLMResponse(
        'Response',
        { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        'gpt-4',
        'stop'
      );
      mockOpenAIService.sendMessage = jest.fn().mockResolvedValue(success(mockResponse));
      const startResult = await kataSolver.startConversation('Test');
      expect(startResult.success).toBe(true);

      if (!startResult.success) return;
      const conversationId = startResult.value.id;

      const result = kataSolver.getConversationHistory(conversationId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.role).toBe('user');
        expect(result.value[1]?.role).toBe('assistant');
      }
    });

    it('should return failure when conversation does not exist', () => {
      const result = kataSolver.getConversationHistory('non-existent-id');

      expect(result.success).toBe(false);
    });
  });

  describe('resetConversation', () => {
    it('should clear all messages from a conversation', async () => {
      const mockResponse = new LLMResponse(
        'Response',
        { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        'gpt-4',
        'stop'
      );
      mockOpenAIService.sendMessage = jest.fn().mockResolvedValue(success(mockResponse));
      const startResult = await kataSolver.startConversation('Test');
      expect(startResult.success).toBe(true);

      if (!startResult.success) return;
      const conversationId = startResult.value.id;

      const result = kataSolver.resetConversation(conversationId);

      expect(result.success).toBe(true);

      // Verify conversation is empty
      const convResult = kataSolver.getConversation(conversationId);
      expect(convResult.success).toBe(true);
      if (convResult.success) {
        expect(convResult.value.messages).toHaveLength(0);
        expect(convResult.value.getTotalTokens()).toBe(0);
      }
    });

    it('should return failure when conversation does not exist', () => {
      const result = kataSolver.resetConversation('non-existent-id');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Conversation not found');
      }
    });
  });

  describe('getConversationTokenCount', () => {
    it('should return total token count for a conversation', async () => {
      const mockResponse = new LLMResponse(
        'Response',
        { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
        'gpt-4',
        'stop'
      );
      mockOpenAIService.sendMessage = jest.fn().mockResolvedValue(success(mockResponse));
      const startResult = await kataSolver.startConversation('Test prompt');
      expect(startResult.success).toBe(true);

      if (!startResult.success) return;

      const result = kataSolver.getConversationTokenCount(startResult.value.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeGreaterThan(0);
      }
    });

    it('should return failure when conversation does not exist', () => {
      const result = kataSolver.getConversationTokenCount('non-existent-id');

      expect(result.success).toBe(false);
    });
  });

  describe('getConversationTokenBreakdown', () => {
    it('should return detailed token breakdown', async () => {
      const mockResponse = new LLMResponse(
        'Response',
        { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
        'gpt-4',
        'stop'
      );
      mockOpenAIService.sendMessage = jest.fn().mockResolvedValue(success(mockResponse));
      const startResult = await kataSolver.startConversation('Test');
      expect(startResult.success).toBe(true);

      if (!startResult.success) return;

      const result = kataSolver.getConversationTokenBreakdown(startResult.value.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.totalTokens).toBeGreaterThan(0);
        expect(result.value.messageCount).toBe(2);
      }
    });

    it('should return failure when conversation does not exist', () => {
      const result = kataSolver.getConversationTokenBreakdown('non-existent-id');

      expect(result.success).toBe(false);
    });
  });
});
