import { KataEvaluatorService } from '../../../../src/features/kata-evaluator/services/KataEvaluatorService';
import { KataEvaluatorConfig } from '../../../../src/features/kata-evaluator/services/KataEvaluatorConfig';
import { ExtractedCode } from '../../../../src/features/code-extractor/domain/ExtractedCode';
import { KataEvaluationRubric } from '../../../../src/features/kata-instruction/domain/KataEvaluationRubric';
import OpenAI from 'openai';

jest.mock('openai');

describe('KataEvaluatorService', () => {
  let service: KataEvaluatorService;
  let mockConfig: KataEvaluatorConfig;
  let mockOpenAIClient: jest.Mocked<OpenAI>;
  let mockExtractedCode: ExtractedCode;
  let mockRubric: KataEvaluationRubric;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.KATA_EVALUATOR_MODEL = 'gpt-4';
    process.env.KATA_EVALUATOR_MAX_TOKENS = '4096';

    mockConfig = new KataEvaluatorConfig();

    mockOpenAIClient = {
      responses: {
        create: jest.fn()
      }
    } as any;

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIClient);

    service = new KataEvaluatorService(mockConfig);

    mockExtractedCode = new ExtractedCode(
      'User: write fizzbuzz\n\n```typescript\nfunction fizzbuzz() {}\n```',
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

  describe('evaluateCode', () => {
    it('should successfully evaluate code and return KataEvaluation', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'The code is correct. Score: 8/10'
      });

      const result = await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.ordinal).toBe(1);
        expect(result.value.responseString).toBe('The code is correct. Score: 8/10');
        expect(result.value.evaluatedCode).toBe('function fizzbuzz() {}');
        expect(result.value.timestamp).toBeInstanceOf(Date);
      }
    });

    it('should call OpenAI with correct parameters', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Evaluation response'
      });

      await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          max_output_tokens: 4096
        })
      );
    });

    it('should include prompt ID when configured', async () => {
      process.env.KATA_EVALUATOR_PROMPT_ID = 'pmpt_123456';
      process.env.KATA_EVALUATOR_PROMPT_VERSION = '2';
      mockConfig = new KataEvaluatorConfig();
      service = new KataEvaluatorService(mockConfig);

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Evaluation response'
      });

      await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: {
            id: 'pmpt_123456',
            version: '2'
          }
        })
      );
    });

    it('should not include prompt when prompt ID is not configured', async () => {
      delete process.env.KATA_EVALUATOR_PROMPT_ID;
      mockConfig = new KataEvaluatorConfig();
      service = new KataEvaluatorService(mockConfig);

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Evaluation response'
      });

      await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      const callArgs = (mockOpenAIClient.responses.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.prompt).toBeUndefined();
    });

    it('should include prompt ID without version when version not configured', async () => {
      process.env.KATA_EVALUATOR_PROMPT_ID = 'pmpt_123456';
      delete process.env.KATA_EVALUATOR_PROMPT_VERSION;
      mockConfig = new KataEvaluatorConfig();
      service = new KataEvaluatorService(mockConfig);

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Evaluation response'
      });

      await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: {
            id: 'pmpt_123456'
          }
        })
      );
    });

    it('should build prompt with code and rubric', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Evaluation response'
      });

      await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      const callArgs = (mockOpenAIClient.responses.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.input).toContain('function fizzbuzz() {}');
      expect(callArgs.input).toContain('FizzBuzz Evaluation');
    });

    it('should handle response with output array format', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output: [
          { content: 'Line 1' },
          { content: 'Line 2' }
        ]
      });

      const result = await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.responseString).toBe('Line 1\nLine 2');
      }
    });

    it('should return failure when OpenAI returns empty response', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: ''
      });

      const result = await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Empty response from OpenAI');
      }
    });

    it('should return failure when OpenAI API call fails', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockRejectedValue(
        new Error('API Error')
      );

      const result = await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('API Error');
      }
    });

    it('should handle unknown error types', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockRejectedValue('String error');

      const result = await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('OpenAI API call failed');
      }
    });

    it('should handle different ordinal values', async () => {
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Response'
      });

      const result1 = await service.evaluateCode(mockExtractedCode, mockRubric, 0);
      const result2 = await service.evaluateCode(mockExtractedCode, mockRubric, 5);
      const result3 = await service.evaluateCode(mockExtractedCode, mockRubric, 999);

      expect(result1.success && result1.value.ordinal).toBe(0);
      expect(result2.success && result2.value.ordinal).toBe(5);
      expect(result3.success && result3.value.ordinal).toBe(999);
    });

    it('should preserve multiline responses', async () => {
      const multilineResponse = `Line 1
Line 2
Line 3`;
      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: multilineResponse
      });

      const result = await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.responseString).toBe(multilineResponse);
      }
    });

    it('should trim whitespace from prompt ID', async () => {
      process.env.KATA_EVALUATOR_PROMPT_ID = '  pmpt_123  ';
      mockConfig = new KataEvaluatorConfig();
      service = new KataEvaluatorService(mockConfig);

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Response'
      });

      await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: {
            id: 'pmpt_123'
          }
        })
      );
    });

    it('should not include prompt when ID is empty after trim', async () => {
      process.env.KATA_EVALUATOR_PROMPT_ID = '   ';
      mockConfig = new KataEvaluatorConfig();
      service = new KataEvaluatorService(mockConfig);

      mockOpenAIClient.responses.create = jest.fn().mockResolvedValue({
        output_text: 'Response'
      });

      await service.evaluateCode(mockExtractedCode, mockRubric, 1);

      const callArgs = (mockOpenAIClient.responses.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.prompt).toBeUndefined();
    });
  });
});
