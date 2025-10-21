import { OpenAIConfig } from '../../../../src/features/kata-solver/services/OpenAIConfig';

describe('OpenAIConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create config with all environment variables provided', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.OPENAI_MODEL = 'gpt-4';
      process.env.OPENAI_MAX_TOKENS = '2000';
      process.env.OPENAI_TEMPERATURE = '0.5';
      process.env.OPENAI_CONTEXT_WINDOW = '8000';
      process.env.OPENAI_WARNING_THRESHOLD = '0.9';

      const config = new OpenAIConfig();

      expect(config.apiKey).toBe('test-api-key');
      expect(config.model).toBe('gpt-4');
      expect(config.maxTokens).toBe(2000);
      expect(config.temperature).toBe(0.5);
      expect(config.contextWindow).toBe(8000);
      expect(config.warningThreshold).toBe(0.9);
    });

    it('should use default values when optional environment variables are not provided', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      const config = new OpenAIConfig();

      expect(config.apiKey).toBe('test-api-key');
      expect(config.model).toBe('gpt-4-turbo-preview');
      expect(config.maxTokens).toBe(4096);
      expect(config.temperature).toBe(0.7);
      expect(config.contextWindow).toBe(128000);
      expect(config.warningThreshold).toBe(0.8);
    });

    it('should throw error when OPENAI_API_KEY is missing', () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => new OpenAIConfig()).toThrow('OPENAI_API_KEY is required');
    });

    it('should throw error when OPENAI_API_KEY is empty string', () => {
      process.env.OPENAI_API_KEY = '';

      expect(() => new OpenAIConfig()).toThrow('OPENAI_API_KEY is required');
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
    });

    it('should throw error when temperature is negative', () => {
      process.env.OPENAI_TEMPERATURE = '-0.5';

      expect(() => new OpenAIConfig()).toThrow('Temperature must be between 0 and 2');
    });

    it('should throw error when temperature is greater than 2', () => {
      process.env.OPENAI_TEMPERATURE = '2.5';

      expect(() => new OpenAIConfig()).toThrow('Temperature must be between 0 and 2');
    });

    it('should throw error when maxTokens is not positive', () => {
      process.env.OPENAI_MAX_TOKENS = '0';

      expect(() => new OpenAIConfig()).toThrow('Max tokens must be positive');
    });

    it('should throw error when maxTokens is negative', () => {
      process.env.OPENAI_MAX_TOKENS = '-100';

      expect(() => new OpenAIConfig()).toThrow('Max tokens must be positive');
    });

    it('should throw error when warningThreshold is less than 0', () => {
      process.env.OPENAI_WARNING_THRESHOLD = '-0.1';

      expect(() => new OpenAIConfig()).toThrow('Warning threshold must be between 0 and 1');
    });

    it('should throw error when warningThreshold is greater than 1', () => {
      process.env.OPENAI_WARNING_THRESHOLD = '1.5';

      expect(() => new OpenAIConfig()).toThrow('Warning threshold must be between 0 and 1');
    });

    it('should accept valid boundary values', () => {
      process.env.OPENAI_TEMPERATURE = '0';
      process.env.OPENAI_MAX_TOKENS = '1';
      process.env.OPENAI_WARNING_THRESHOLD = '1';

      const config = new OpenAIConfig();

      expect(config.temperature).toBe(0);
      expect(config.maxTokens).toBe(1);
      expect(config.warningThreshold).toBe(1);
    });
  });

  describe('isValid', () => {
    it('should return true when configuration is valid', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      const config = new OpenAIConfig();

      expect(config.isValid()).toBe(true);
    });
  });
});
