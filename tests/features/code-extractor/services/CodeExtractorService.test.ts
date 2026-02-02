import { CodeExtractorService } from '../../../../src/features/code-extractor/services/CodeExtractorService';
import { OpenAIConfig } from '../../../../src/features/kata-solver/services/OpenAIConfig';
import OpenAI from 'openai';

// Mock the OpenAI client
jest.mock('openai');

describe('CodeExtractorService', () => {
  let service: CodeExtractorService;
  let mockOpenAIClient: jest.Mocked<OpenAI>;
  let mockConfig: OpenAIConfig;

  beforeEach(() => {
    // Set required environment variables
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.CODE_EXTRACTOR_PROMPT_ID = 'pmpt_test_code_extractor';
    process.env.CODE_EXTRACTOR_PROMPT_VERSION = '1';

    mockConfig = new OpenAIConfig();

    // Create mock OpenAI client
    mockOpenAIClient = {
      responses: {
        create: jest.fn(),
      },
    } as any;

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIClient);

    service = new CodeExtractorService(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.CODE_EXTRACTOR_PROMPT_ID;
    delete process.env.CODE_EXTRACTOR_PROMPT_VERSION;
  });

  describe('extractCode', () => {
    it('should successfully extract code from text', async () => {
      const inputText = 'Here is a function: function test() { return 42; }';
      const extractedCodeText = 'function test() { return 42; }';

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: extractedCodeText,
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      const result = await service.extractCode(inputText);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.originalText).toBe(inputText);
        expect(result.value.extractedCode).toBe(extractedCodeText);
        expect(result.value.hasCode()).toBe(true);
      }
    });

    it('should use CODE_EXTRACTOR_PROMPT_ID and CODE_EXTRACTOR_PROMPT_VERSION', async () => {
      const inputText = 'Some code here';
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'extracted code',
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      await service.extractCode(inputText);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith({
        model: mockConfig.model,
        input: inputText,
        max_output_tokens: mockConfig.maxTokens,
        prompt: {
          id: 'pmpt_test_code_extractor',
          version: '1',
        },
      });
    });

    it('should validate input text is not empty', async () => {
      const result = await service.extractCode('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Input text must be a non-empty string');
      }
    });

    it('should validate input text is a string', async () => {
      const result = await service.extractCode(null as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Input text must be a non-empty string');
      }
    });

    it('should handle API errors', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockRejectedValue(
        new Error('API connection failed')
      );

      const result = await service.extractCode('test input');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('OpenAI Responses API error');
      }
    });

    it('should handle response with output array format', async () => {
      const inputText = 'Code text';
      const extractedCodeText = 'const x = 10;';

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output: [
          {
            content: [{ text: extractedCodeText }],
          },
        ],
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      const result = await service.extractCode(inputText);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.extractedCode).toBe(extractedCodeText);
      }
    });

    it('should handle empty response from API', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: '',
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      const result = await service.extractCode('test input');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('No response content from OpenAI Responses API');
      }
    });

    it('should work without prompt version', async () => {
      delete process.env.CODE_EXTRACTOR_PROMPT_VERSION;

      const inputText = 'Some code';
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'extracted',
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      await service.extractCode(inputText);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith({
        model: mockConfig.model,
        input: inputText,
        max_output_tokens: mockConfig.maxTokens,
        prompt: {
          id: 'pmpt_test_code_extractor',
        },
      });
    });

    it('should work without prompt ID (using default model behavior)', async () => {
      delete process.env.CODE_EXTRACTOR_PROMPT_ID;
      delete process.env.CODE_EXTRACTOR_PROMPT_VERSION;

      const inputText = 'Some code';
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'extracted',
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      await service.extractCode(inputText);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith({
        model: mockConfig.model,
        input: inputText,
        max_output_tokens: mockConfig.maxTokens,
      });
    });

    it('should detect TypeScript language', async () => {
      const extractedCode = 'function test(): number { return 42; }';
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: extractedCode,
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      const result = await service.extractCode('some text');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.language).toBe('typescript');
      }
    });

    it('should detect Python language', async () => {
      const extractedCode = 'def test():\n    return 42';
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: extractedCode,
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      const result = await service.extractCode('some text');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.language).toBe('python');
      }
    });

    it('should detect Java language', async () => {
      const extractedCode = 'public class Test { private int x; }';
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: extractedCode,
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      const result = await service.extractCode('some text');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.language).toBe('java');
      }
    });

    it('should return undefined language for unknown code', async () => {
      const extractedCode = 'SELECT * FROM table;';
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: extractedCode,
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      const result = await service.extractCode('some text');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.language).toBeUndefined();
      }
    });

    it('should return success with empty code when API response contains "NO CODE"', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'NO CODE',
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      const result = await service.extractCode('some text without code');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.hasCode()).toBe(false);
      }
    });

    it('should return success with empty code when API response contains "NO CODE" regardless of case', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'no code found in input',
        model: 'gpt-4-turbo-preview',
        finish_reason: 'stop',
      });

      const result = await service.extractCode('some text without code');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.hasCode()).toBe(false);
      }
    });
  });
});
