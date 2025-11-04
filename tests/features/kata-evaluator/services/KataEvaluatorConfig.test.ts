import { KataEvaluatorConfig } from '../../../../src/features/kata-evaluator/services/KataEvaluatorConfig';

describe('KataEvaluatorConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor with environment variables', () => {
    it('should load configuration from environment variables', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.KATA_EVALUATOR_MODEL = 'gpt-4';
      process.env.KATA_EVALUATOR_PROMPT_ID = 'pmpt_123456';
      process.env.KATA_EVALUATOR_PROMPT_VERSION = '2';
      process.env.KATA_EVALUATOR_MAX_TOKENS = '2000';

      const config = new KataEvaluatorConfig();

      expect(config.apiKey).toBe('test-api-key');
      expect(config.model).toBe('gpt-4');
      expect(config.promptId).toBe('pmpt_123456');
      expect(config.promptVersion).toBe('2');
      expect(config.maxTokens).toBe(2000);
    });

    it('should use default model when not specified', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      const config = new KataEvaluatorConfig();

      expect(config.model).toBe('gpt-4-turbo-preview');
    });

    it('should use default maxTokens when not specified', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      const config = new KataEvaluatorConfig();

      expect(config.maxTokens).toBe(4096);
    });

    it('should have undefined promptId when not specified', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      const config = new KataEvaluatorConfig();

      expect(config.promptId).toBeUndefined();
    });

    it('should have undefined promptVersion when not specified', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      const config = new KataEvaluatorConfig();

      expect(config.promptVersion).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should throw error when OPENAI_API_KEY is missing', () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => new KataEvaluatorConfig()).toThrow(
        'OPENAI_API_KEY environment variable is required'
      );
    });

    it('should throw error when OPENAI_API_KEY is empty string', () => {
      process.env.OPENAI_API_KEY = '';

      expect(() => new KataEvaluatorConfig()).toThrow(
        'OPENAI_API_KEY environment variable is required'
      );
    });

    it('should throw error when OPENAI_API_KEY is whitespace only', () => {
      process.env.OPENAI_API_KEY = '   ';

      expect(() => new KataEvaluatorConfig()).toThrow(
        'OPENAI_API_KEY environment variable is required'
      );
    });

    it('should throw error when maxTokens is zero', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.KATA_EVALUATOR_MAX_TOKENS = '0';

      expect(() => new KataEvaluatorConfig()).toThrow(
        'Max tokens must be positive'
      );
    });

    it('should throw error when maxTokens is negative', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.KATA_EVALUATOR_MAX_TOKENS = '-100';

      expect(() => new KataEvaluatorConfig()).toThrow(
        'Max tokens must be positive'
      );
    });
  });

  describe('parsing', () => {
    it('should parse maxTokens as integer', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.KATA_EVALUATOR_MAX_TOKENS = '3000';

      const config = new KataEvaluatorConfig();

      expect(config.maxTokens).toBe(3000);
      expect(Number.isInteger(config.maxTokens)).toBe(true);
    });

    it('should handle invalid maxTokens by using NaN which fails validation', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.KATA_EVALUATOR_MAX_TOKENS = 'invalid';

      expect(() => new KataEvaluatorConfig()).toThrow(
        'Max tokens must be positive'
      );
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      const config = new KataEvaluatorConfig();

      // TypeScript compile-time check - these should cause errors if uncommented
      // config.apiKey = 'new-key';
      // config.model = 'new-model';
      // config.promptId = 'new-id';
      // config.promptVersion = 'new-version';
      // config.maxTokens = 1000;

      expect(config.apiKey).toBe('test-api-key');
    });
  });

  describe('edge cases', () => {
    it('should handle very large maxTokens', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.KATA_EVALUATOR_MAX_TOKENS = '100000';

      const config = new KataEvaluatorConfig();

      expect(config.maxTokens).toBe(100000);
    });

    it('should handle empty prompt ID string', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.KATA_EVALUATOR_PROMPT_ID = '';

      const config = new KataEvaluatorConfig();

      expect(config.promptId).toBe('');
    });

    it('should preserve whitespace in prompt ID', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.KATA_EVALUATOR_PROMPT_ID = '  pmpt_123  ';

      const config = new KataEvaluatorConfig();

      expect(config.promptId).toBe('  pmpt_123  ');
    });
  });
});
