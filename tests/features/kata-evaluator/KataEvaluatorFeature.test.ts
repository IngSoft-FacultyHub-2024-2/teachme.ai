import { KataEvaluatorFeature } from '../../../src/features/kata-evaluator/KataEvaluatorFeature';
import { ExtractedCode } from '../../../src/features/code-extractor/domain/ExtractedCode';
import { KataEvaluationRubric } from '../../../src/features/kata-instruction/domain/KataEvaluationRubric';
import OpenAI from 'openai';

jest.mock('openai');

describe('KataEvaluatorFeature', () => {
  let feature: KataEvaluatorFeature;
  let mockOpenAIClient: jest.Mocked<OpenAI>;
  let mockExtractedCode: ExtractedCode;
  let mockRubric: KataEvaluationRubric;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.KATA_EVALUATOR_MODEL = 'gpt-4';

    mockOpenAIClient = {
      responses: {
        create: jest.fn()
      }
    } as any;

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIClient);

    feature = new KataEvaluatorFeature();

    mockExtractedCode = new ExtractedCode(
      'Original text with code',
      'function fizzbuzz() {}',
      'typescript'
    );

    mockRubric = {
      rubric: {
        title: 'FizzBuzz Evaluation',
        total_max_score: 100,
        categories: [
          {
            name: 'Correctness',
            max_score: 50,
            levels: []
          }
        ],
        overall_classification: []
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluate', () => {
    it('should successfully evaluate code', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Evaluation: Good implementation'
      });

      const result = await feature.evaluate(mockExtractedCode, mockRubric, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.ordinal).toBe(1);
        expect(result.value.responseString).toBe('Evaluation: Good implementation');
        expect(result.value.evaluatedCode).toBe('function fizzbuzz() {}');
      }
    });

    it('should propagate errors from service', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockRejectedValue(
        new Error('API Error')
      );

      const result = await feature.evaluate(mockExtractedCode, mockRubric, 1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('API Error');
      }
    });

    it('should handle multiple evaluations with different ordinals', async () => {
      mockOpenAIClient.responses.create = jest.fn()
        .mockResolvedValueOnce({ output_text: 'First evaluation' })
        .mockResolvedValueOnce({ output_text: 'Second evaluation' })
        .mockResolvedValueOnce({ output_text: 'Third evaluation' });

      const result1 = await feature.evaluate(mockExtractedCode, mockRubric, 1);
      const result2 = await feature.evaluate(mockExtractedCode, mockRubric, 2);
      const result3 = await feature.evaluate(mockExtractedCode, mockRubric, 3);

      expect(result1.success && result1.value.ordinal).toBe(1);
      expect(result2.success && result2.value.ordinal).toBe(2);
      expect(result3.success && result3.value.ordinal).toBe(3);

      expect(result1.success && result1.value.responseString).toBe('First evaluation');
      expect(result2.success && result2.value.responseString).toBe('Second evaluation');
      expect(result3.success && result3.value.responseString).toBe('Third evaluation');
    });

    it('should work with different programming languages', async () => {
      const pythonCode = new ExtractedCode(
        'def fizzbuzz(): pass',
        'def fizzbuzz(): pass',
        'python'
      );

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Python code evaluated'
      });

      const result = await feature.evaluate(pythonCode, mockRubric, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.evaluatedCode).toBe('def fizzbuzz(): pass');
      }
    });

    it('should work with code without detected language', async () => {
      const unknownCode = new ExtractedCode(
        'some code',
        'some code',
        undefined
      );

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Code evaluated'
      });

      const result = await feature.evaluate(unknownCode, mockRubric, 1);

      expect(result.success).toBe(true);
    });

    it('should work with different rubrics', async () => {
      const differentRubric: KataEvaluationRubric = {
        rubric: {
          title: 'Different Kata',
          total_max_score: 50,
          categories: [
            {
              name: 'Style',
              max_score: 25,
              levels: []
            }
          ],
          overall_classification: []
        }
      };

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Different evaluation'
      });

      const result = await feature.evaluate(mockExtractedCode, differentRubric, 1);

      expect(result.success).toBe(true);
    });

    it('should create timestamps for each evaluation', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Evaluation'
      });

      const result1 = await feature.evaluate(mockExtractedCode, mockRubric, 1);

      await new Promise(resolve => setTimeout(resolve, 10));

      const result2 = await feature.evaluate(mockExtractedCode, mockRubric, 2);

      expect(result1.success && result1.value.timestamp).toBeInstanceOf(Date);
      expect(result2.success && result2.value.timestamp).toBeInstanceOf(Date);

      if (result1.success && result2.success) {
        expect(result2.value.timestamp.getTime()).toBeGreaterThan(
          result1.value.timestamp.getTime()
        );
      }
    });

    it('should handle empty response from OpenAI', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: ''
      });

      const result = await feature.evaluate(mockExtractedCode, mockRubric, 1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Empty response from OpenAI');
      }
    });
  });

  describe('constructor', () => {
    it('should throw error if OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => new KataEvaluatorFeature()).toThrow(
        'OPENAI_API_KEY environment variable is required'
      );
    });

    it('should create feature with valid configuration', () => {
      process.env.OPENAI_API_KEY = 'valid-key';

      expect(() => new KataEvaluatorFeature()).not.toThrow();
    });
  });
});
