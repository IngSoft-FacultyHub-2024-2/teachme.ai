# /evaluate Command Documentation

## Overview

The `/evaluate` command is a special feature in the KataSolverService Conversation UI that automatically extracts code from the conversation history and sends it for evaluation.

## How It Works

1. **User Types `/evaluate`**: During a conversation with the KataSolverService, type `/evaluate` as your input
2. **Code Extraction**: The system:
   - Retrieves the entire conversation history
   - Uses the CodeExtractor feature to extract code snippets from all messages
   - Detects the programming language automatically
3. **Preview**: The extracted code is displayed with:
   - The complete code
   - Detected language (typescript, python, java, or unknown)
   - Clean formatting
4. **Confirmation**: User is asked to confirm if they want to evaluate the code
5. **Evaluation**: If confirmed, the code is sent to the assistant with the prompt "Please evaluate the following code"
6. **Response**: The assistant's evaluation is displayed

## Usage Example

```
You: Write a FizzBuzz function in TypeScript
Assistant: Here's a FizzBuzz implementation...
[Shows code implementation]

You: /evaluate
--- Code Extraction & Evaluation ---
Extracting code from conversation...

✓ Code extracted successfully!

Extracted Code:
────────────────────────────────────────────────────────────
function fizzBuzz(n: number): string[] {
  const result: string[] = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push('FizzBuzz');
    else if (i % 3 === 0) result.push('Fizz');
    else if (i % 5 === 0) result.push('Buzz');
    else result.push(i.toString());
  }
  return result;
}
────────────────────────────────────────────────────────────
Detected Language: typescript

? Would you like to send this code for evaluation? (Y/n)
```

## Available Commands

During a KataSolverService conversation, you can use:

- `/evaluate` - Extract code from conversation and send for evaluation
- `/help` - Show available commands
- `/exit` - End the conversation

## Implementation Details

### File Location
- **UI Class**: `src/ui/KataSolverConversationUI.ts`
- **Handler Method**: `handleEvaluateCommand()` (line 74-155)

### Dependencies
- **KataSolverFacade**: For managing conversations
- **CodeExtractorFeature**: For extracting code from text using OpenAI

### Error Handling

The `/evaluate` command handles various error scenarios:

1. **No conversation history**: Displays "Could not retrieve conversation history"
2. **Empty conversation**: Displays "No conversation content to extract code from"
3. **Code extraction fails**: Displays "Error extracting code: [error message]"
4. **No code found**: Displays "No code found in the conversation"
5. **User cancels**: Displays "Evaluation cancelled"

### Code Flow

```
User types /evaluate
       ↓
Get conversation history
       ↓
Concatenate all messages
       ↓
Extract code using CodeExtractor
       ↓
Display extracted code
       ↓
Ask user for confirmation
       ↓
[Yes] → Send to assistant for evaluation
[No]  → Cancel and return to conversation
```

## Testing

Comprehensive tests are available in `tests/ui/KataSolverConversationUI.test.ts`:

- ✅ Successful code extraction and evaluation
- ✅ User cancellation handling
- ✅ No code found scenario
- ✅ Code extraction errors
- ✅ Conversation history retrieval errors
- ✅ Empty conversation history

Run tests:
```bash
npm test -- tests/ui/KataSolverConversationUI.test.ts
```

## Configuration

The `/evaluate` command requires:

- `OPENAI_API_KEY` - For both KataSolverService and CodeExtractor
- `CODE_EXTRACTOR_PROMPT_ID` - The OpenAI prompt ID for code extraction
- `CODE_EXTRACTOR_PROMPT_VERSION` - (Optional) Version of the extraction prompt

## Tips for Best Results

1. **Let the conversation develop**: The more code in the conversation, the better the extraction
2. **Use clear prompts**: Ask the assistant to show code implementations
3. **Review extracted code**: Always check the preview before confirming evaluation
4. **Iterative improvements**: After evaluation, continue the conversation to refine the code

## Limitations

- Extracts from **all** messages in conversation history (not just assistant messages)
- Language detection uses simple heuristics (may not detect all languages)
- Requires proper configuration of CodeExtractor prompt in OpenAI
