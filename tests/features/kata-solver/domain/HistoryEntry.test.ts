import {
  HistoryEntry,
  HistoryEvaluation,
  HistoryEntryJSON,
  HistoryEvaluationJSON,
} from '../../../../src/features/kata-solver/domain/HistoryEntry';
import { KataEvaluation } from '../../../../src/features/kata-evaluator/domain/KataEvaluation';

describe('HistoryEvaluation', () => {
  describe('constructor', () => {
    it('should create a history evaluation with all required properties', () => {
      const ordinal = 1;
      const responseString = 'Good implementation';
      const timestamp = new Date();

      const evaluation = new HistoryEvaluation(ordinal, responseString, timestamp);

      expect(evaluation.ordinal).toBe(ordinal);
      expect(evaluation.responseString).toBe(responseString);
      expect(evaluation.timestamp).toBe(timestamp);
    });

    it('should throw error when ordinal is less than 1', () => {
      expect(() => new HistoryEvaluation(0, 'response', new Date())).toThrow(
        'Ordinal must be at least 1'
      );
    });

    it('should throw error when responseString is empty', () => {
      expect(() => new HistoryEvaluation(1, '', new Date())).toThrow(
        'Response string cannot be empty'
      );
    });
  });

  describe('fromKataEvaluation', () => {
    it('should create HistoryEvaluation from KataEvaluation', () => {
      const kataEval = new KataEvaluation(2, 'Evaluation response', 'const x = 1;');

      const historyEval = HistoryEvaluation.fromKataEvaluation(kataEval);

      expect(historyEval.ordinal).toBe(2);
      expect(historyEval.responseString).toBe('Evaluation response');
      expect(historyEval.timestamp).toEqual(kataEval.timestamp);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with all properties', () => {
      const timestamp = new Date();
      const evaluation = new HistoryEvaluation(1, 'Good job', timestamp);

      const json = evaluation.toJSON();

      expect(json.ordinal).toBe(1);
      expect(json.responseString).toBe('Good job');
      expect(json.timestamp).toBe(timestamp.toISOString());
    });
  });

  describe('fromJSON', () => {
    it('should deserialize from JSON object', () => {
      const timestamp = new Date();
      const json: HistoryEvaluationJSON = {
        ordinal: 3,
        responseString: 'Needs improvement',
        timestamp: timestamp.toISOString(),
      };

      const evaluation = HistoryEvaluation.fromJSON(json);

      expect(evaluation.ordinal).toBe(3);
      expect(evaluation.responseString).toBe('Needs improvement');
      expect(evaluation.timestamp.toISOString()).toBe(timestamp.toISOString());
    });
  });
});

describe('HistoryEntry', () => {
  describe('constructor', () => {
    it('should create a history entry with required properties', () => {
      const userPrompt = 'How do I solve this?';
      const assistantResponse = 'Here is the solution...';

      const entry = new HistoryEntry(userPrompt, assistantResponse);

      expect(entry.userPrompt).toBe(userPrompt);
      expect(entry.assistantResponse).toBe(assistantResponse);
      expect(entry.extractedCode).toBeNull();
      expect(entry.evaluation).toBeNull();
      expect(entry.timestamp).toBeInstanceOf(Date);
    });

    it('should set timestamp to current time', () => {
      const before = new Date();
      const entry = new HistoryEntry('prompt', 'response');
      const after = new Date();

      expect(entry.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entry.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw error when userPrompt is empty', () => {
      expect(() => new HistoryEntry('', 'response')).toThrow('User prompt cannot be empty');
    });

    it('should throw error when assistantResponse is empty', () => {
      expect(() => new HistoryEntry('prompt', '')).toThrow('Assistant response cannot be empty');
    });
  });

  describe('withExtractedCode', () => {
    it('should return a new HistoryEntry with extracted code', () => {
      const entry = new HistoryEntry('prompt', 'response');
      const code = 'function solve() { return 42; }';

      const newEntry = entry.withExtractedCode(code);

      expect(newEntry.extractedCode).toBe(code);
      expect(newEntry.userPrompt).toBe(entry.userPrompt);
      expect(newEntry.assistantResponse).toBe(entry.assistantResponse);
      expect(newEntry.timestamp).toBe(entry.timestamp);
    });

    it('should preserve evaluation when adding extracted code', () => {
      const evaluation = new HistoryEvaluation(1, 'Good', new Date());
      const entry = new HistoryEntry('prompt', 'response', null, evaluation);

      const newEntry = entry.withExtractedCode('code');

      expect(newEntry.evaluation).toBe(evaluation);
    });

    it('should be immutable - original entry unchanged', () => {
      const entry = new HistoryEntry('prompt', 'response');

      entry.withExtractedCode('code');

      expect(entry.extractedCode).toBeNull();
    });
  });

  describe('withEvaluation', () => {
    it('should return a new HistoryEntry with evaluation', () => {
      const entry = new HistoryEntry('prompt', 'response');
      const evaluation = new HistoryEvaluation(1, 'Excellent work', new Date());

      const newEntry = entry.withEvaluation(evaluation);

      expect(newEntry.evaluation).toBe(evaluation);
      expect(newEntry.userPrompt).toBe(entry.userPrompt);
      expect(newEntry.assistantResponse).toBe(entry.assistantResponse);
      expect(newEntry.timestamp).toBe(entry.timestamp);
    });

    it('should preserve extractedCode when adding evaluation', () => {
      const entry = new HistoryEntry('prompt', 'response', 'code', null);

      const evaluation = new HistoryEvaluation(1, 'Good', new Date());
      const newEntry = entry.withEvaluation(evaluation);

      expect(newEntry.extractedCode).toBe('code');
    });

    it('should be immutable - original entry unchanged', () => {
      const entry = new HistoryEntry('prompt', 'response');
      const evaluation = new HistoryEvaluation(1, 'Good', new Date());

      entry.withEvaluation(evaluation);

      expect(entry.evaluation).toBeNull();
    });
  });

  describe('hasExtractedCode', () => {
    it('should return false when no extracted code', () => {
      const entry = new HistoryEntry('prompt', 'response');

      expect(entry.hasExtractedCode()).toBe(false);
    });

    it('should return true when extracted code exists', () => {
      const entry = new HistoryEntry('prompt', 'response', 'code', null);

      expect(entry.hasExtractedCode()).toBe(true);
    });
  });

  describe('hasEvaluation', () => {
    it('should return false when no evaluation', () => {
      const entry = new HistoryEntry('prompt', 'response');

      expect(entry.hasEvaluation()).toBe(false);
    });

    it('should return true when evaluation exists', () => {
      const evaluation = new HistoryEvaluation(1, 'Good', new Date());
      const entry = new HistoryEntry('prompt', 'response', null, evaluation);

      expect(entry.hasEvaluation()).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should serialize entry without optional fields', () => {
      const entry = new HistoryEntry('prompt', 'response');

      const json = entry.toJSON();

      expect(json.userPrompt).toBe('prompt');
      expect(json.assistantResponse).toBe('response');
      expect(json.extractedCode).toBeNull();
      expect(json.evaluation).toBeNull();
      expect(json.timestamp).toBe(entry.timestamp.toISOString());
    });

    it('should serialize entry with all fields', () => {
      const evaluation = new HistoryEvaluation(1, 'Good', new Date());
      const entry = new HistoryEntry('prompt', 'response', 'code', evaluation);

      const json = entry.toJSON();

      expect(json.userPrompt).toBe('prompt');
      expect(json.assistantResponse).toBe('response');
      expect(json.extractedCode).toBe('code');
      expect(json.evaluation).toEqual(evaluation.toJSON());
    });
  });

  describe('fromJSON', () => {
    it('should deserialize entry without optional fields', () => {
      const timestamp = new Date();
      const json: HistoryEntryJSON = {
        userPrompt: 'prompt',
        assistantResponse: 'response',
        extractedCode: null,
        evaluation: null,
        timestamp: timestamp.toISOString(),
      };

      const entry = HistoryEntry.fromJSON(json);

      expect(entry.userPrompt).toBe('prompt');
      expect(entry.assistantResponse).toBe('response');
      expect(entry.extractedCode).toBeNull();
      expect(entry.evaluation).toBeNull();
      expect(entry.timestamp.toISOString()).toBe(timestamp.toISOString());
    });

    it('should deserialize entry with all fields', () => {
      const timestamp = new Date();
      const evalTimestamp = new Date();
      const json: HistoryEntryJSON = {
        userPrompt: 'prompt',
        assistantResponse: 'response',
        extractedCode: 'code',
        evaluation: {
          ordinal: 2,
          responseString: 'Good work',
          timestamp: evalTimestamp.toISOString(),
        },
        timestamp: timestamp.toISOString(),
      };

      const entry = HistoryEntry.fromJSON(json);

      expect(entry.userPrompt).toBe('prompt');
      expect(entry.assistantResponse).toBe('response');
      expect(entry.extractedCode).toBe('code');
      expect(entry.evaluation).not.toBeNull();
      expect(entry.evaluation!.ordinal).toBe(2);
      expect(entry.evaluation!.responseString).toBe('Good work');
    });
  });
});
