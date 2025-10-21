import { Message, MessageRole } from '../../../../src/features/kata-solver/domain/Message';

describe('Message', () => {
  describe('constructor', () => {
    it('should create a message with all required properties', () => {
      const role: MessageRole = 'user';
      const content = 'Hello, how can I solve this kata?';
      const tokenCount = 10;

      const message = new Message(role, content, tokenCount);

      expect(message.role).toBe(role);
      expect(message.content).toBe(content);
      expect(message.tokenCount).toBe(tokenCount);
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should create a system message', () => {
      const message = new Message('system', 'You are a helpful assistant', 5);

      expect(message.role).toBe('system');
    });

    it('should create a user message', () => {
      const message = new Message('user', 'Help me', 3);

      expect(message.role).toBe('user');
    });

    it('should create an assistant message', () => {
      const message = new Message('assistant', 'I can help you', 4);

      expect(message.role).toBe('assistant');
    });

    it('should set timestamp to current time', () => {
      const before = new Date();
      const message = new Message('user', 'test', 1);
      const after = new Date();

      expect(message.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(message.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('validation', () => {
    it('should throw error when content is empty', () => {
      expect(() => new Message('user', '', 5)).toThrow('Message content cannot be empty');
    });

    it('should throw error when tokenCount is negative', () => {
      expect(() => new Message('user', 'test', -5)).toThrow('Token count must be non-negative');
    });

    it('should throw error when tokenCount is zero', () => {
      expect(() => new Message('user', 'test', 0)).toThrow('Token count must be non-negative');
    });

    it('should accept tokenCount of 1', () => {
      const message = new Message('user', 'test', 1);
      expect(message.tokenCount).toBe(1);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with all properties', () => {
      const message = new Message('user', 'Hello', 5);
      const json = message.toJSON();

      expect(json.role).toBe('user');
      expect(json.content).toBe('Hello');
      expect(json.tokenCount).toBe(5);
      expect(json.timestamp).toBe(message.timestamp.toISOString());
    });
  });

  describe('fromJSON', () => {
    it('should deserialize from JSON object', () => {
      const timestamp = new Date();
      const json = {
        role: 'assistant' as MessageRole,
        content: 'Response text',
        tokenCount: 15,
        timestamp: timestamp.toISOString(),
      };

      const message = Message.fromJSON(json);

      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Response text');
      expect(message.tokenCount).toBe(15);
      expect(message.timestamp.toISOString()).toBe(timestamp.toISOString());
    });
  });
});
