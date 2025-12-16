import { Conversation } from '../../../../src/features/kata-solver/domain/Conversation';
import { Message } from '../../../../src/features/kata-solver/domain/Message';

describe('Conversation', () => {
  describe('constructor', () => {
    it('should create a conversation with a unique ID', () => {
      const conversation = new Conversation();

      expect(conversation.id).toBeDefined();
      expect(typeof conversation.id).toBe('string');
      expect(conversation.id.length).toBeGreaterThan(0);
    });

    it('should create conversations with different IDs', () => {
      const conv1 = new Conversation();
      const conv2 = new Conversation();

      expect(conv1.id).not.toBe(conv2.id);
    });

    it('should initialize with empty messages array', () => {
      const conversation = new Conversation();

      expect(conversation.messages).toEqual([]);
      expect(conversation.messages.length).toBe(0);
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const before = new Date();
      const conversation = new Conversation();
      const after = new Date();

      expect(conversation.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(conversation.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(conversation.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(conversation.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('addMessage', () => {
    it('should add a message to the conversation', () => {
      const conversation = new Conversation();
      const message = new Message('user', 'Hello', 5);

      conversation.addMessage(message);

      expect(conversation.messages).toHaveLength(1);
      expect(conversation.messages[0]).toBe(message);
    });

    it('should add multiple messages', () => {
      const conversation = new Conversation();
      const msg1 = new Message('user', 'Hello', 5);
      const msg2 = new Message('assistant', 'Hi there!', 7);
      const msg3 = new Message('user', 'How are you?', 10);

      conversation.addMessage(msg1);
      conversation.addMessage(msg2);
      conversation.addMessage(msg3);

      expect(conversation.messages).toHaveLength(3);
      expect(conversation.messages[0]).toBe(msg1);
      expect(conversation.messages[1]).toBe(msg2);
      expect(conversation.messages[2]).toBe(msg3);
    });

    it('should update updatedAt timestamp when adding message', (done) => {
      const conversation = new Conversation();
      const originalUpdatedAt = conversation.updatedAt.getTime();

      setTimeout(() => {
        conversation.addMessage(new Message('user', 'test', 1));
        expect(conversation.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
        done();
      }, 10);
    });
  });

  describe('getTotalTokens', () => {
    it('should return 0 for empty conversation', () => {
      const conversation = new Conversation();

      expect(conversation.getTotalTokens()).toBe(0);
    });

    it('should return sum of all message tokens', () => {
      const conversation = new Conversation();
      conversation.addMessage(new Message('user', 'Hello', 5));
      conversation.addMessage(new Message('assistant', 'Hi', 3));
      conversation.addMessage(new Message('user', 'How are you?', 10));

      expect(conversation.getTotalTokens()).toBe(18);
    });
  });

  describe('getMessageCount', () => {
    it('should return 0 for empty conversation', () => {
      const conversation = new Conversation();

      expect(conversation.getMessageCount()).toBe(0);
    });

    it('should return correct message count', () => {
      const conversation = new Conversation();
      conversation.addMessage(new Message('user', 'Hello', 5));
      conversation.addMessage(new Message('assistant', 'Hi', 3));

      expect(conversation.getMessageCount()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should remove all messages', () => {
      const conversation = new Conversation();
      conversation.addMessage(new Message('user', 'Hello', 5));
      conversation.addMessage(new Message('assistant', 'Hi', 3));

      conversation.clear();

      expect(conversation.messages).toHaveLength(0);
      expect(conversation.getTotalTokens()).toBe(0);
    });

    it('should update updatedAt timestamp', (done) => {
      const conversation = new Conversation();
      conversation.addMessage(new Message('user', 'Hello', 5));
      const originalUpdatedAt = conversation.updatedAt.getTime();

      setTimeout(() => {
        conversation.clear();
        expect(conversation.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
        done();
      }, 10);
    });
  });

  describe('toJSON', () => {
    it('should serialize empty conversation to JSON', () => {
      const conversation = new Conversation();
      const json = conversation.toJSON();

      expect(json.id).toBe(conversation.id);
      expect(json.messages).toEqual([]);
      expect(json.createdAt).toBe(conversation.createdAt.toISOString());
      expect(json.updatedAt).toBe(conversation.updatedAt.toISOString());
    });

    it('should serialize conversation with messages to JSON', () => {
      const conversation = new Conversation();
      const message = new Message('user', 'Hello', 5);
      conversation.addMessage(message);

      const json = conversation.toJSON();

      expect(json.id).toBe(conversation.id);
      expect(json.messages).toHaveLength(1);
      expect(json.messages[0]?.role).toBe('user');
      expect(json.messages[0]?.content).toBe('Hello');
    });
  });

  describe('fromJSON', () => {
    it('should deserialize conversation from JSON', () => {
      const originalConv = new Conversation();
      originalConv.addMessage(new Message('user', 'Hello', 5));
      originalConv.addMessage(new Message('assistant', 'Hi', 3));

      const json = originalConv.toJSON();
      const deserializedConv = Conversation.fromJSON(json);

      expect(deserializedConv.id).toBe(originalConv.id);
      expect(deserializedConv.messages).toHaveLength(2);
      expect(deserializedConv.getTotalTokens()).toBe(8);
      expect(deserializedConv.createdAt.toISOString()).toBe(
        originalConv.createdAt.toISOString()
      );
    });
  });
});
