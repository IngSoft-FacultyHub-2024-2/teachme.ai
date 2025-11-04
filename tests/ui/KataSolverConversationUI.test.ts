import { KataSolverConversationUI } from '../../src/ui/KataSolverConversationUI';
import { KataSolverFacade } from '../../src/features/kata-solver/KataSolverFacade';
import { CodeExtractorFeature } from '../../src/features/code-extractor/CodeExtractorFeature';
import { KataEvaluatorFeature } from '../../src/features/kata-evaluator/KataEvaluatorFeature';
import { KataEvaluationRubricService } from '../../src/features/kata-instruction/services/KataEvaluationRubricService';
import { ExtractedCode } from '../../src/features/code-extractor/domain/ExtractedCode';
import { KataEvaluation } from '../../src/features/kata-evaluator/domain/KataEvaluation';
import { success, failure } from '../../src/shared/types/Result';
import inquirer from 'inquirer';

// Mock dependencies
jest.mock('../../src/features/kata-solver/KataSolverFacade');
jest.mock('../../src/features/code-extractor/CodeExtractorFeature');
jest.mock('../../src/features/kata-evaluator/KataEvaluatorFeature');
jest.mock('../../src/features/kata-instruction/services/KataEvaluationRubricService');
jest.mock('inquirer');
jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis()
  }));
});

describe('KataSolverConversationUI', () => {
  let ui: KataSolverConversationUI;
  let mockStartConversation: jest.SpyInstance;
  let mockContinueConversation: jest.SpyInstance;
  let mockGetConversationHistory: jest.SpyInstance;
  let mockExtractCode: jest.SpyInstance;
  let mockEvaluate: jest.SpyInstance;
  let mockLoadRubric: jest.SpyInstance;
  let mockPrompt: jest.MockedFunction<typeof inquirer.prompt>;

  beforeEach(() => {
    // Set required environment variables
    process.env.OPENAI_API_KEY = 'test-api-key';

    // Create spies for the facade methods
    mockStartConversation = jest.spyOn(KataSolverFacade.prototype, 'startConversation');
    mockContinueConversation = jest.spyOn(KataSolverFacade.prototype, 'continueConversation');
    mockGetConversationHistory = jest.spyOn(KataSolverFacade.prototype, 'getConversationHistory');
    mockExtractCode = jest.spyOn(CodeExtractorFeature.prototype, 'extractCode');
    mockEvaluate = jest.spyOn(KataEvaluatorFeature.prototype, 'evaluate');
    mockLoadRubric = jest.spyOn(KataEvaluationRubricService.prototype, 'loadRubric');
    mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

    // Create the UI instance
    ui = new KataSolverConversationUI();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should start a conversation and handle normal user input', async () => {
      // Mock initial prompt
      mockPrompt.mockResolvedValueOnce({ initialPrompt: 'Write a function' });

      mockStartConversation.mockResolvedValue(
        success({
          conversationId: 'conv-123',
          response: 'Sure, I can help with that.',
        })
      );

      // Mock user inputs: one message then exit
      mockPrompt
        .mockResolvedValueOnce({ userInput: 'Make it return 42' })
        .mockResolvedValueOnce({ userInput: '/exit' });

      mockContinueConversation.mockResolvedValue(success('Here is the function...'));

      await ui.start();

      expect(mockStartConversation).toHaveBeenCalledWith('Write a function');
      expect(mockContinueConversation).toHaveBeenCalledWith('conv-123', 'Make it return 42');
    });

    it('should handle errors from startConversation', async () => {
      mockPrompt.mockResolvedValueOnce({ initialPrompt: 'Test prompt' });

      mockStartConversation.mockResolvedValue(
        failure(new Error('Failed to start conversation'))
      );

      await ui.start();

      expect(mockStartConversation).toHaveBeenCalledWith('Test prompt');
      expect(mockContinueConversation).not.toHaveBeenCalled();
    });

    it('should handle errors from continueConversation', async () => {
      mockPrompt.mockResolvedValueOnce({ initialPrompt: 'Initial' });

      mockStartConversation.mockResolvedValue(
        success({ conversationId: 'conv-123', response: 'Started' })
      );

      mockPrompt.mockResolvedValueOnce({ userInput: 'Continue' });

      mockContinueConversation.mockResolvedValue(failure(new Error('Conversation error')));

      await ui.start();

      expect(mockContinueConversation).toHaveBeenCalledWith('conv-123', 'Continue');
    });
  });

  describe('/evaluate command', () => {
    beforeEach(() => {
      // Setup conversation start
      mockPrompt.mockResolvedValueOnce({ initialPrompt: 'Write code' });

      mockStartConversation.mockResolvedValue(
        success({
          conversationId: 'conv-123',
          response: 'function test() { return 42; }',
        })
      );
    });

    it('should extract code and send for evaluation when /evaluate is used', async () => {
      // User types /evaluate
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      // Mock conversation history (returns string[])
      mockGetConversationHistory.mockReturnValue(
        success(['Write a function', 'function test() { return 42; }'])
      );

      // Mock code extraction
      const extractedCode = new ExtractedCode(
        'function test() { return 42; }',
        'function test() { return 42; }',
        'typescript'
      );
      mockExtractCode.mockResolvedValue(success(extractedCode));

      // User confirms evaluation
      mockPrompt.mockResolvedValueOnce({ shouldEvaluate: true });

      // Mock rubric loading
      const mockRubric = {
        rubric: {
          title: 'Test Rubric',
          total_max_score: 100,
          categories: [],
          overall_classification: []
        }
      };
      mockLoadRubric.mockResolvedValue(success(mockRubric));

      // Mock evaluation
      const mockEvaluation = new KataEvaluation(
        1,
        'The code looks good! Score: 8/10',
        'function test() { return 42; }'
      );
      mockEvaluate.mockResolvedValue(success(mockEvaluation));

      // User exits
      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockGetConversationHistory).toHaveBeenCalledWith('conv-123');
      expect(mockExtractCode).toHaveBeenCalledWith(
        'Write a function\n\nfunction test() { return 42; }'
      );
      expect(mockLoadRubric).toHaveBeenCalledWith('kata_evaluation_rubric.json');
      expect(mockEvaluate).toHaveBeenCalledWith(extractedCode, mockRubric, 1);
      expect(mockContinueConversation).not.toHaveBeenCalled();
    });

    it('should handle when user cancels evaluation', async () => {
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      mockGetConversationHistory.mockReturnValue(success(['const x = 10;']));

      const extractedCode = new ExtractedCode('const x = 10;', 'const x = 10;', 'typescript');
      mockExtractCode.mockResolvedValue(success(extractedCode));

      // User declines evaluation
      mockPrompt.mockResolvedValueOnce({ shouldEvaluate: false });

      // User exits
      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockExtractCode).toHaveBeenCalled();
      // continueConversation should not be called for evaluation
      expect(mockContinueConversation).not.toHaveBeenCalled();
    });

    it('should handle when no code is found in conversation', async () => {
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      mockGetConversationHistory.mockReturnValue(success(['Just some text without code']));

      const extractedCode = new ExtractedCode('Just some text without code', '', undefined);
      mockExtractCode.mockResolvedValue(success(extractedCode));

      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockExtractCode).toHaveBeenCalled();
      expect(mockContinueConversation).not.toHaveBeenCalled();
    });

    it('should handle code extraction errors', async () => {
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      mockGetConversationHistory.mockReturnValue(success(['Some content']));

      mockExtractCode.mockResolvedValue(failure(new Error('Extraction failed')));

      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockExtractCode).toHaveBeenCalled();
      expect(mockContinueConversation).not.toHaveBeenCalled();
    });

    it('should handle when conversation history cannot be retrieved', async () => {
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      mockGetConversationHistory.mockReturnValue(failure(new Error('History not found')));

      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockGetConversationHistory).toHaveBeenCalledWith('conv-123');
      expect(mockExtractCode).not.toHaveBeenCalled();
    });

    it('should handle empty conversation history', async () => {
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      mockGetConversationHistory.mockReturnValue(success([]));

      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockExtractCode).not.toHaveBeenCalled();
    });

    it('should handle rubric loading errors', async () => {
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      mockGetConversationHistory.mockReturnValue(
        success(['Write code', 'function test() {}'])
      );

      const extractedCode = new ExtractedCode('function test() {}', 'function test() {}', 'typescript');
      mockExtractCode.mockResolvedValue(success(extractedCode));

      mockPrompt.mockResolvedValueOnce({ shouldEvaluate: true });

      mockLoadRubric.mockResolvedValue(failure(new Error('Rubric file not found')));

      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockLoadRubric).toHaveBeenCalledWith('kata_evaluation_rubric.json');
      expect(mockEvaluate).not.toHaveBeenCalled();
    });

    it('should handle evaluation errors from KataEvaluatorFeature', async () => {
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      mockGetConversationHistory.mockReturnValue(success(['function test() {}']));

      const extractedCode = new ExtractedCode('function test() {}', 'function test() {}', 'typescript');
      mockExtractCode.mockResolvedValue(success(extractedCode));

      mockPrompt.mockResolvedValueOnce({ shouldEvaluate: true });

      const mockRubric = {
        rubric: {
          title: 'Test',
          total_max_score: 100,
          categories: [],
          overall_classification: []
        }
      };
      mockLoadRubric.mockResolvedValue(success(mockRubric));

      mockEvaluate.mockResolvedValue(failure(new Error('OpenAI API error')));

      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockEvaluate).toHaveBeenCalled();
    });

    it('should increment ordinal for multiple evaluations', async () => {
      const mockRubric = {
        rubric: {
          title: 'Test',
          total_max_score: 100,
          categories: [],
          overall_classification: []
        }
      };

      // First evaluation
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      mockGetConversationHistory.mockReturnValue(success(['function test1() {}']));

      const extractedCode1 = new ExtractedCode('function test1() {}', 'function test1() {}', 'typescript');
      mockExtractCode.mockResolvedValueOnce(success(extractedCode1));

      mockPrompt.mockResolvedValueOnce({ shouldEvaluate: true });

      mockLoadRubric.mockResolvedValueOnce(success(mockRubric));

      const mockEvaluation1 = new KataEvaluation(1, 'First evaluation', 'function test1() {}');
      mockEvaluate.mockResolvedValueOnce(success(mockEvaluation1));

      // Second evaluation
      mockPrompt.mockResolvedValueOnce({ userInput: '/evaluate' });

      mockGetConversationHistory.mockReturnValue(success(['function test2() {}']));

      const extractedCode2 = new ExtractedCode('function test2() {}', 'function test2() {}', 'typescript');
      mockExtractCode.mockResolvedValueOnce(success(extractedCode2));

      mockPrompt.mockResolvedValueOnce({ shouldEvaluate: true });

      mockLoadRubric.mockResolvedValueOnce(success(mockRubric));

      const mockEvaluation2 = new KataEvaluation(2, 'Second evaluation', 'function test2() {}');
      mockEvaluate.mockResolvedValueOnce(success(mockEvaluation2));

      // Exit
      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockEvaluate).toHaveBeenCalledTimes(2);
      // Check that ordinals are 1 and 2
      expect(mockEvaluate.mock.calls[0][2]).toBe(1);
      expect(mockEvaluate.mock.calls[1][2]).toBe(2);
    });
  });

  describe('/help command', () => {
    it('should display help and continue conversation', async () => {
      mockPrompt.mockResolvedValueOnce({ initialPrompt: 'Start' });

      mockStartConversation.mockResolvedValue(
        success({ conversationId: 'conv-123', response: 'Started' })
      );

      // User types /help then exits
      mockPrompt
        .mockResolvedValueOnce({ userInput: '/help' })
        .mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      // Should not call continueConversation for /help
      expect(mockContinueConversation).not.toHaveBeenCalled();
    });
  });
});
