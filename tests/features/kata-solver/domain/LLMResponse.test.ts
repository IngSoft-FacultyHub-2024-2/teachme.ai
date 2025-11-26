import { LLMResponse, TokenUsage } from '../../../../src/features/kata-solver/domain/LLMResponse';

describe('LLMResponse', () => {
  describe('constructor', () => {
    it('should create a response with all required properties', () => {
      const content = 'This is the LLM response';
      const usage: TokenUsage = {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
      };
      const model = 'gpt-4-turbo-preview';
      const finishReason = 'stop';

      const response = new LLMResponse(content, usage, model, finishReason);

      expect(response.content).toBe(content);
      expect(response.usage).toEqual(usage);
      expect(response.model).toBe(model);
      expect(response.finishReason).toBe(finishReason);
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('should set timestamp to current time', () => {
      const before = new Date();
      const response = new LLMResponse(
        'test',
        { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        'gpt-4',
        'stop'
      );
      const after = new Date();

      expect(response.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(response.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('validation', () => {
    it('should throw error when content is empty', () => {
      expect(
        () =>
          new LLMResponse(
            '',
            { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
            'gpt-4',
            'stop'
          )
      ).toThrow('Response content cannot be empty');
    });

    it('should throw error when promptTokens is negative', () => {
      expect(
        () =>
          new LLMResponse(
            'test',
            { promptTokens: -1, completionTokens: 1, totalTokens: 0 },
            'gpt-4',
            'stop'
          )
      ).toThrow('Token counts must be non-negative');
    });

    it('should throw error when completionTokens is negative', () => {
      expect(
        () =>
          new LLMResponse(
            'test',
            { promptTokens: 1, completionTokens: -1, totalTokens: 0 },
            'gpt-4',
            'stop'
          )
      ).toThrow('Token counts must be non-negative');
    });

    it('should throw error when totalTokens is negative', () => {
      expect(
        () =>
          new LLMResponse(
            'test',
            { promptTokens: 1, completionTokens: 1, totalTokens: -1 },
            'gpt-4',
            'stop'
          )
      ).toThrow('Token counts must be non-negative');
    });

    it('should throw error when totalTokens does not match sum', () => {
      expect(
        () =>
          new LLMResponse(
            'test',
            { promptTokens: 10, completionTokens: 20, totalTokens: 50 },
            'gpt-4',
            'stop'
          )
      ).toThrow('Total tokens must equal promptTokens + completionTokens');
    });

    it('should accept valid token usage with all zeros', () => {
      const response = new LLMResponse(
        'test',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'gpt-4',
        'stop'
      );

      expect(response.usage.totalTokens).toBe(0);
    });

    it('should accept valid token usage', () => {
      const response = new LLMResponse(
        'test',
        { promptTokens: 25, completionTokens: 75, totalTokens: 100 },
        'gpt-4',
        'stop'
      );

      expect(response.usage.totalTokens).toBe(100);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with all properties', () => {
      const usage: TokenUsage = {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
      };
      const response = new LLMResponse('Test response', usage, 'gpt-4', 'stop');
      const json = response.toJSON();

      expect(json.content).toBe('Test response');
      expect(json.usage).toEqual(usage);
      expect(json.model).toBe('gpt-4');
      expect(json.finishReason).toBe('stop');
      expect(json.timestamp).toBe(response.timestamp.toISOString());
    });
  });

  describe('fromJSON', () => {
    it('should deserialize from JSON object', () => {
      const timestamp = new Date();
      const json = {
        content: 'Response text',
        usage: {
          promptTokens: 30,
          completionTokens: 70,
          totalTokens: 100,
        },
        model: 'gpt-4-turbo',
        finishReason: 'stop',
        timestamp: timestamp.toISOString(),
      };

      const response = LLMResponse.fromJSON(json);

      expect(response.content).toBe('Response text');
      expect(response.usage).toEqual(json.usage);
      expect(response.model).toBe('gpt-4-turbo');
      expect(response.finishReason).toBe('stop');
      expect(response.timestamp.toISOString()).toBe(timestamp.toISOString());
    });
  });
});
