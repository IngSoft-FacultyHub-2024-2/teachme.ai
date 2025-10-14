import { OpenAIService } from '../../../../src/features/kata-solver/services/OpenAIService';
import { OpenAIConfig } from '../../../../src/features/kata-solver/services/OpenAIConfig';
import { Message } from '../../../../src/features/kata-solver/domain/Message';
import OpenAI from 'openai';

// Mock the OpenAI SDK
jest.mock('openai');

describe('OpenAIService', () => {
  let mockConfig: OpenAIConfig;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    mockConfig = new OpenAIConfig();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with config', () => {
      const service = new OpenAIService(mockConfig);

      expect(service).toBeInstanceOf(OpenAIService);
    });
  });

  describe('sendMessage', () => {
    it('should send a message without conversation history', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Response from LLM',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
        model: 'gpt-4-turbo-preview',
      });

      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as unknown as OpenAI));

      const service = new OpenAIService(mockConfig);
      const result = await service.sendMessage('Hello, LLM!');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.content).toBe('Response from LLM');
        expect(result.value.usage.promptTokens).toBe(10);
        expect(result.value.usage.completionTokens).toBe(20);
        expect(result.value.usage.totalTokens).toBe(30);
        expect(result.value.model).toBe('gpt-4-turbo-preview');
        expect(result.value.finishReason).toBe('stop');
      }
    });

    it('should send a message with conversation history', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Response with context',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 30,
          total_tokens: 80,
        },
        model: 'gpt-4',
      });

      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as unknown as OpenAI));

      const service = new OpenAIService(mockConfig);
      const history = [
        new Message('user', 'Previous message', 10),
        new Message('assistant', 'Previous response', 15),
      ];

      const result = await service.sendMessage('New message', history);

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'user', content: 'Previous message' },
            { role: 'assistant', content: 'Previous response' },
            { role: 'user', content: 'New message' },
          ]),
        })
      );
    });

    it('should return failure when API call fails', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));

      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as unknown as OpenAI));

      const service = new OpenAIService(mockConfig);
      const result = await service.sendMessage('Test message');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('API Error');
      }
    });

    it('should return failure when response has no choices', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [],
        usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
        model: 'gpt-4',
      });

      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as unknown as OpenAI));

      const service = new OpenAIService(mockConfig);
      const result = await service.sendMessage('Test');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('No response');
      }
    });

    it('should use configuration settings for API call', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [
          {
            message: { content: 'Response' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
        model: 'gpt-4-turbo-preview',
      });

      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as unknown as OpenAI));

      const service = new OpenAIService(mockConfig);
      await service.sendMessage('Test');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: mockConfig.model,
          temperature: mockConfig.temperature,
          max_tokens: mockConfig.maxTokens,
        })
      );
    });
  });
});
