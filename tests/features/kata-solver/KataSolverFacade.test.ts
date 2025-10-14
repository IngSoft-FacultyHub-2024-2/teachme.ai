import { KataSolverFacade } from '../../../src/features/kata-solver/KataSolverFacade';

describe('KataSolverFacade', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
    process.env.OPENAI_API_KEY = 'test-api-key-for-facade';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create facade instance', () => {
      const facade = new KataSolverFacade();

      expect(facade).toBeInstanceOf(KataSolverFacade);
    });

    it('should throw error when OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => new KataSolverFacade()).toThrow('OPENAI_API_KEY is required');

      process.env.OPENAI_API_KEY = 'test-api-key-for-facade';
    });
  });

  describe('integration', () => {
    it('should provide access to kataSolver', () => {
      const facade = new KataSolverFacade();

      expect(facade.kataSolver).toBeDefined();
    });
  });
});
