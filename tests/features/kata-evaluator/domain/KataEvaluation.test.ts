import { KataEvaluation } from '../../../../src/features/kata-evaluator/domain/KataEvaluation';

describe('KataEvaluation', () => {
  const mockEvaluatedCode = 'function fizzbuzz() { return "test"; }';
  const mockResponseString = 'The code meets basic requirements. Score: 8/10';

  describe('constructor', () => {
    it('should create a KataEvaluation with valid inputs', () => {
      const evaluation = new KataEvaluation(
        1,
        mockResponseString,
        mockEvaluatedCode
      );

      expect(evaluation.ordinal).toBe(1);
      expect(evaluation.responseString).toBe(mockResponseString);
      expect(evaluation.evaluatedCode).toBe(mockEvaluatedCode);
      expect(evaluation.timestamp).toBeInstanceOf(Date);
    });

    it('should create evaluation with ordinal 0', () => {
      const evaluation = new KataEvaluation(
        0,
        mockResponseString,
        mockEvaluatedCode
      );

      expect(evaluation.ordinal).toBe(0);
    });

    it('should create evaluation with large ordinal', () => {
      const evaluation = new KataEvaluation(
        999,
        mockResponseString,
        mockEvaluatedCode
      );

      expect(evaluation.ordinal).toBe(999);
    });

    it('should handle empty response string', () => {
      const evaluation = new KataEvaluation(
        1,
        '',
        mockEvaluatedCode
      );

      expect(evaluation.responseString).toBe('');
    });

    it('should handle empty evaluated code', () => {
      const evaluation = new KataEvaluation(
        1,
        mockResponseString,
        ''
      );

      expect(evaluation.evaluatedCode).toBe('');
    });

    it('should handle long response strings', () => {
      const longResponse = 'A'.repeat(10000);
      const evaluation = new KataEvaluation(
        1,
        longResponse,
        mockEvaluatedCode
      );

      expect(evaluation.responseString).toBe(longResponse);
    });

    it('should handle multiline response strings', () => {
      const multilineResponse = `Line 1
Line 2
Line 3`;
      const evaluation = new KataEvaluation(
        1,
        multilineResponse,
        mockEvaluatedCode
      );

      expect(evaluation.responseString).toBe(multilineResponse);
    });

    it('should set timestamp at creation time', () => {
      const beforeCreation = new Date();
      const evaluation = new KataEvaluation(
        1,
        mockResponseString,
        mockEvaluatedCode
      );
      const afterCreation = new Date();

      expect(evaluation.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(evaluation.timestamp.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('multiple instances', () => {
    it('should create multiple evaluations with different ordinals', () => {
      const evaluation1 = new KataEvaluation(1, 'Response 1', 'Code 1');
      const evaluation2 = new KataEvaluation(2, 'Response 2', 'Code 2');
      const evaluation3 = new KataEvaluation(3, 'Response 3', 'Code 3');

      expect(evaluation1.ordinal).toBe(1);
      expect(evaluation2.ordinal).toBe(2);
      expect(evaluation3.ordinal).toBe(3);
    });

    it('should have different timestamps for evaluations created at different times', async () => {
      const evaluation1 = new KataEvaluation(1, mockResponseString, mockEvaluatedCode);

      await new Promise(resolve => setTimeout(resolve, 10));

      const evaluation2 = new KataEvaluation(2, mockResponseString, mockEvaluatedCode);

      expect(evaluation2.timestamp.getTime()).toBeGreaterThan(evaluation1.timestamp.getTime());
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const evaluation = new KataEvaluation(
        1,
        mockResponseString,
        mockEvaluatedCode
      );

      // TypeScript compile-time check - these should cause errors if uncommented
      // evaluation.ordinal = 2;
      // evaluation.responseString = 'new response';
      // evaluation.evaluatedCode = 'new code';
      // evaluation.timestamp = new Date();

      expect(evaluation.ordinal).toBe(1);
    });
  });
});
