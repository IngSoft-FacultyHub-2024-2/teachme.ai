import { CodeExtractorFeature } from '../../../src/features/code-extractor/CodeExtractorFeature';
import { CodeExtractorService } from '../../../src/features/code-extractor/services/CodeExtractorService';
import { ExtractedCode } from '../../../src/features/code-extractor/domain/ExtractedCode';
import { success, failure } from '../../../src/shared/types/Result';

// Mock the CodeExtractorService
jest.mock('../../../src/features/code-extractor/services/CodeExtractorService');

describe('CodeExtractorFeature', () => {
  let feature: CodeExtractorFeature;
  let mockExtractCode: jest.SpyInstance;

  beforeEach(() => {
    // Set required environment variables
    process.env.OPENAI_API_KEY = 'test-api-key';

    // Create mock for extractCode method
    mockExtractCode = jest.spyOn(CodeExtractorService.prototype, 'extractCode');

    // Create the feature
    feature = new CodeExtractorFeature();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractCode', () => {
    it('should successfully extract code using the service', async () => {
      const inputText = 'Here is some code: const x = 42;';
      const extractedCode = new ExtractedCode(inputText, 'const x = 42;', 'typescript');

      mockExtractCode.mockResolvedValue(success(extractedCode));

      const result = await feature.extractCode(inputText);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.originalText).toBe(inputText);
        expect(result.value.extractedCode).toBe('const x = 42;');
        expect(result.value.language).toBe('typescript');
      }

      expect(mockExtractCode).toHaveBeenCalledWith(inputText);
      expect(mockExtractCode).toHaveBeenCalledTimes(1);
    });

    it('should return failure when service fails', async () => {
      const inputText = 'test input';
      const error = new Error('Service error');

      mockExtractCode.mockResolvedValue(failure(error));

      const result = await feature.extractCode(inputText);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Service error');
      }
    });

    it('should handle empty input', async () => {
      mockExtractCode.mockResolvedValue(
        failure(new Error('Input text must be a non-empty string'))
      );

      const result = await feature.extractCode('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Input text must be a non-empty string');
      }
    });
  });
});
