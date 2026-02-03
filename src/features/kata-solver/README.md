# KataSolverService Feature

A dialog-based system for interacting with OpenAI's LLM to solve programming katas. This feature provides stateful conversation management with comprehensive token tracking.

## Overview

The KataSolverService feature enables multi-turn conversations with an LLM, maintaining full conversation history and tracking token usage across all interactions.

## Architecture

### Domain Models

- **Message**: Represents a single message in a conversation
  - Role (system, user, assistant)
  - Content
  - Token count
  - Timestamp

- **Conversation**: Manages conversation state
  - Unique conversation ID
  - Message history
  - Token tracking (total tokens across all messages)
  - Created/Updated timestamps

- **LLMResponse**: Represents an LLM API response
  - Response content
  - Token usage breakdown (prompt, completion, total)
  - Model used
  - Finish reason
  - Timestamp

### Services

- **OpenAIConfig**: Configuration management
  - Reads from environment variables
  - Validates configuration values
  - Provides defaults

- **OpenAIService**: OpenAI API wrapper
  - Sends messages to OpenAI API
  - Handles conversation history
  - Returns structured responses with token tracking

- **KataSolverService**: Dialog orchestration
  - Manages multiple conversations
  - Provides dialog interface methods
  - Tracks tokens per conversation

### Facade

- **KataSolverFacade**: Main entry point
  - Initializes all dependencies
  - Provides access to KataSolverService instance

## Configuration

Add these environment variables to your `.env` file:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (defaults shown)
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4096
OPENAI_CONTEXT_WINDOW=128000
OPENAI_WARNING_THRESHOLD=0.8
```

## Usage

### Basic Example

```typescript
import { KataSolverFacade } from './features/kata-solver/KataSolverFacade';

// Initialize facade
const facade = new KataSolverFacade();
const solver = facade.kataSolver;

// Start a conversation
const result = await solver.startConversation(
  'Help me solve the Fibonacci kata'
);

if (result.success) {
  const conversation = result.value;
  console.log(`Started conversation: ${conversation.id}`);

  // Get the first response
  const messages = conversation.messages;
  console.log(`Assistant: ${messages[1]?.content}`);

  // Continue the conversation
  const continueResult = await solver.continueConversation(
    conversation.id,
    'Can you explain the algorithm in more detail?'
  );

  if (continueResult.success) {
    console.log(`Assistant: ${continueResult.value.content}`);
    console.log(`Tokens used: ${continueResult.value.usage.totalTokens}`);
  }
}
```

### Dialog Methods

#### Start Conversation
```typescript
const result = await kataSolver.startConversation(prompt: string);
// Returns: Result<Conversation>
```

#### Continue Conversation
```typescript
const result = await kataSolver.continueConversation(
  conversationId: string,
  userMessage: string
);
// Returns: Result<LLMResponse>
```

#### Get Conversation
```typescript
const result = kataSolver.getConversation(conversationId: string);
// Returns: Result<Conversation>
```

#### Get Conversation History
```typescript
const result = kataSolver.getConversationHistory(conversationId: string);
// Returns: Result<Message[]>
```

#### Reset Conversation
```typescript
const result = kataSolver.resetConversation(conversationId: string);
// Returns: Result<void>
```

### Token Tracking

#### Get Total Token Count
```typescript
const result = kataSolver.getConversationTokenCount(conversationId: string);
// Returns: Result<number>
```

#### Get Token Breakdown
```typescript
const result = kataSolver.getConversationTokenBreakdown(conversationId: string);
// Returns: Result<{ totalTokens: number, messageCount: number }>
```

## Key Features

1. **Stateful Conversations**: Each conversation maintains full history with unique IDs
2. **Token Tracking**: Comprehensive token counting at message and conversation levels
3. **Flexible Prompts**: Accept any string as input (no built-in prompt building)
4. **Multi-turn Dialog**: Support for extended back-and-forth conversations
5. **Error Handling**: Consistent Result pattern for error handling
6. **Type Safety**: Full TypeScript type coverage with strict mode
7. **Tested**: 100% test coverage using TDD approach

## File Structure

```
src/features/kata-solver/
├── domain/
│   ├── Message.ts              # Message domain model
│   ├── Conversation.ts         # Conversation with token tracking
│   └── LLMResponse.ts          # LLM response model
├── services/
│   ├── OpenAIConfig.ts         # Configuration management
│   ├── OpenAIService.ts        # OpenAI API wrapper
│   └── KataSolverService.ts           # Dialog orchestration
├── KataSolverFacade.ts         # Facade
└── README.md                   # This file

tests/features/kata-solver/
├── domain/
│   ├── Message.test.ts
│   ├── Conversation.test.ts
│   └── LLMResponse.test.ts
├── services/
│   ├── OpenAIConfig.test.ts
│   ├── OpenAIService.test.ts
│   └── KataSolverService.test.ts
└── KataSolverFacade.test.ts
```

## Testing

Run all kata-solver tests:
```bash
npm test -- kata-solver
```

Run specific test file:
```bash
npm test -- KataSolverService.test.ts
```

## Future Enhancements

Possible extensions:
- Conversation persistence (save/load from disk)
- Streaming responses
- Cost estimation based on token usage
- Context window management with automatic truncation
- Multiple model support
- Conversation templates
