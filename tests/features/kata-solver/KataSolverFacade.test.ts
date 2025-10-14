

import { KataSolverFacade } from '../../../src/features/kata-solver/KataSolverFacade';

describe('KataSolverFacade', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let facade: KataSolverFacade;

  beforeAll(() => {
    originalEnv = process.env;
    process.env.OPENAI_API_KEY = 'test-api-key-for-facade';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    facade = new KataSolverFacade();
  });

  describe('constructor', () => {
    it('should create facade instance', () => {
      expect(facade).toBeInstanceOf(KataSolverFacade);
    });

    it('should throw error when OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => new KataSolverFacade()).toThrow('OPENAI_API_KEY is required');
      process.env.OPENAI_API_KEY = 'test-api-key-for-facade';
    });
  });

  describe('string-based API', () => {
    it('should accept a string prompt and return a string response from LLM', async () => {
      // Simula el prompt y la respuesta del LLM
      const prompt = '¿Cuál es la capital de Francia?';
      // Aquí deberías mockear la llamada real al LLM si fuera necesario
      const result = await facade.startConversation(prompt);
      expect(typeof prompt).toBe('string');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.value.conversationId).toBe('string');
        expect(typeof result.value.response).toBe('string');
      }
    });

    it('should accept a string message and return a string response from LLM', async () => {
      // Simula continuar el diálogo
      const conversationId = 'conv1';
      const userMessage = '¿Y cuál es la población?';
      const result = await facade.continueConversation(conversationId, userMessage);
      expect(typeof userMessage).toBe('string');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.value).toBe('string');
      }
    });
  });
});
