import { KataSolverConversationUI } from '../../src/ui/KataSolverConversationUI';
import { KataSolverFacade } from '../../src/features/kata-solver/KataSolverFacade';
import { CodeExtractorFeature } from '../../src/features/code-extractor/CodeExtractorFeature';
import { ExtractedCode } from '../../src/features/code-extractor/domain/ExtractedCode';
import { success, failure } from '../../src/shared/types/Result';
import inquirer from 'inquirer';

// Mock dependencies
jest.mock('../../src/features/kata-solver/KataSolverFacade');
jest.mock('../../src/features/code-extractor/CodeExtractorFeature');
jest.mock('inquirer');

describe('KataSolverConversationUI', () => {
  let ui: KataSolverConversationUI;
  let mockStartConversation: jest.SpyInstance;
  let mockContinueConversation: jest.SpyInstance;
  let mockGetConversationHistory: jest.SpyInstance;
  let mockExtractCode: jest.SpyInstance;
  let mockPrompt: jest.MockedFunction<typeof inquirer.prompt>;

  beforeEach(() => {
    // Set required environment variables
    process.env.OPENAI_API_KEY = 'test-api-key';

    // Create spies for the facade methods
    mockStartConversation = jest.spyOn(KataSolverFacade.prototype, 'startConversation');
    mockContinueConversation = jest.spyOn(KataSolverFacade.prototype, 'continueConversation');
    mockGetConversationHistory = jest.spyOn(KataSolverFacade.prototype, 'getConversationHistory');
    mockExtractCode = jest.spyOn(CodeExtractorFeature.prototype, 'extractCode');
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

      // Mock evaluation response
      mockContinueConversation.mockResolvedValue(success('The code looks good!'));

      // User exits
      mockPrompt.mockResolvedValueOnce({ userInput: '/exit' });

      await ui.start();

      expect(mockGetConversationHistory).toHaveBeenCalledWith('conv-123');
      expect(mockExtractCode).toHaveBeenCalledWith(
        'Write a function\n\nfunction test() { return 42; }'
      );
      expect(mockContinueConversation).toHaveBeenCalledWith(
        'conv-123',
        expect.stringContaining('Please evaluate the following code')
      );
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
