# CodeExtractor Feature

The CodeExtractor feature provides functionality to extract code snippets from text using OpenAI's Responses API.

## Overview

This feature analyzes text input and extracts code blocks, returning structured information about the extracted code including language detection.

## Architecture

```
code-extractor/
├── domain/
│   └── ExtractedCode.ts       # Domain model for extracted code
├── services/
│   └── CodeExtractorService.ts # Service that calls OpenAI Responses API
├── CodeExtractorFeature.ts     # Main feature entry point
└── README.md
```

## Configuration

The CodeExtractor requires the following environment variables:

### Required
- `OPENAI_API_KEY` - Your OpenAI API key (shared with kata-solver)
- `CODE_EXTRACTOR_PROMPT_ID` - The prompt resource ID from OpenAI Responses API
- `CODE_EXTRACTOR_PROMPT_VERSION` - The version of the prompt (optional)

### Optional (inherited from OpenAI config)
- `OPENAI_MODEL` - The model to use (default: gpt-4-turbo-preview)
- `OPENAI_MAX_TOKENS` - Maximum tokens for response (default: 4096)

### Example .env configuration

```env
OPENAI_API_KEY=sk-...
CODE_EXTRACTOR_PROMPT_ID=pmpt_abc123def456
CODE_EXTRACTOR_PROMPT_VERSION=1
```

## Usage

### Basic Usage

```typescript
import { CodeExtractorFeature } from './features/code-extractor/CodeExtractorFeature';

const codeExtractor = new CodeExtractorFeature();

const text = `
  Here is a function:
  function hello() {
    console.log("Hello, World!");
  }
`;

const result = await codeExtractor.extractCode(text);

if (result.success) {
  const extracted = result.value;
  console.log('Extracted code:', extracted.getCleanCode());
  console.log('Language:', extracted.language);
  console.log('Has code:', extracted.hasCode());
} else {
  console.error('Error:', result.error.message);
}
```

### Domain Model

The `ExtractedCode` class provides:

- `originalText: string` - The original input text
- `extractedCode: string` - The extracted code
- `language?: string` - Detected programming language (typescript, python, java, or undefined)
- `hasCode(): boolean` - Returns true if code was extracted
- `getCleanCode(): string` - Returns trimmed code without surrounding whitespace

## How It Works

1. **Input Validation**: Validates that the input text is a non-empty string
2. **API Call**: Sends the text to OpenAI Responses API using the configured prompt ID
3. **Response Processing**: Extracts the code from the API response
4. **Language Detection**: Attempts to detect the programming language using simple pattern matching
5. **Return Result**: Returns a Result object containing ExtractedCode or an error

## OpenAI Prompt Configuration

The feature uses OpenAI's managed prompts (Responses API). You need to:

1. Create a prompt in the OpenAI platform for code extraction
2. Get the prompt ID (format: `pmpt_...`)
3. Set it in your `.env` file as `CODE_EXTRACTOR_PROMPT_ID`

Example prompt instruction:
```
Extract all code blocks from the following text.
Return only the code without any explanations, markdown formatting, or additional text.
If multiple code blocks exist, concatenate them with a single newline between each block.
```

## Testing

Run tests for the CodeExtractor feature:

```bash
npm test -- tests/features/code-extractor
```

All tests:
- ExtractedCode domain model tests
- CodeExtractorService integration tests (with mocked OpenAI)
- CodeExtractorFeature tests

## Example

See `src/examples/codeExtractorExample.ts` for a complete working example.

Run the example:
```bash
npm run dev src/examples/codeExtractorExample.ts
```

## Error Handling

The feature uses the Result pattern for error handling:

```typescript
const result = await codeExtractor.extractCode(text);

if (result.success) {
  // Use result.value (ExtractedCode)
} else {
  // Handle result.error (Error)
}
```

Common errors:
- Input validation errors (empty or invalid input)
- OpenAI API errors (network, authentication, etc.)
- Empty response from API

## Dependencies

- `openai` - OpenAI SDK for API calls
- Shared `OpenAIConfig` from kata-solver feature
- Shared `Result` type for error handling
