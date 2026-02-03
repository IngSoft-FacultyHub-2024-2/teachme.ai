# Plan: Add Function Calling to CodeExtractorService

## Overview
Add OpenAI function calling to `CodeExtractorService.callResponsesAPI()` to detect when no code is generated. When the LLM determines there's no code to extract, it will call the `no_code_generated` function, which sets a boolean flag in the `ExtractedCode` domain class.

## Files to Modify

### 1. `src/features/code-extractor/domain/ExtractedCode.ts`
Add a new boolean attribute to track when no code was generated.

**Changes:**
- Add `noCodeGenerated: boolean` parameter to constructor (default: `false`)
- Store as readonly property

```typescript
export class ExtractedCode {
  public constructor(
    public readonly originalText: string,
    public readonly extractedCode: string,
    public readonly language?: string,
    public readonly noCodeGenerated: boolean = false
  ) {}
  // ... existing methods
}
```

### 2. `src/features/code-extractor/services/CodeExtractorService.ts`
Add function calling to the OpenAI Responses API call.

**Changes:**

a) Define the `no_code_generated` function tool:
```typescript
private readonly NO_CODE_GENERATED_TOOL = {
  type: 'function',
  name: 'no_code_generated',
  description: 'Call this function when the input text does not contain any code to extract.',
  parameters: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        description: 'Brief explanation of why no code was found'
      }
    },
    required: ['reason'],
    additionalProperties: false
  },
  strict: true
};
```

b) Add `tools` parameter to the API call in `callResponsesAPI()`:
```typescript
const params: any = {
  model: this.config.model,
  input,
  max_output_tokens: this.config.maxTokens,
  tools: [this.NO_CODE_GENERATED_TOOL],
};
```

c) Update response handling to detect function calls:
- Check if response contains a function call (`type: 'function_call'` in output)
- If `no_code_generated` was called, return a result indicating this
- Modify return type to include the `noCodeGenerated` flag

d) Update `extractCode()` to pass the flag to `ExtractedCode`:
```typescript
const extractedCode = new ExtractedCode(
  text,
  response.value.content,
  this.detectLanguage(response.value.content),
  response.value.noCodeGenerated
);
```

### 3. `tests/features/code-extractor/domain/ExtractedCode.test.ts`
Add tests for the new `noCodeGenerated` property.

**New tests:**
- Should default `noCodeGenerated` to `false`
- Should accept `noCodeGenerated` as `true`
- Should work with all existing tests (backward compatible)

### 4. `tests/features/code-extractor/services/CodeExtractorService.test.ts`
Add tests for function calling behavior.

**New tests:**
- Should include `tools` parameter in API call
- Should set `noCodeGenerated` to `true` when function is called
- Should set `noCodeGenerated` to `false` when code is extracted normally
- Should handle function call response format correctly

## Implementation Order (TDD)

1. **ExtractedCode domain class** (Red → Green → Refactor)
   - Write failing test for `noCodeGenerated` property
   - Add the property with default value
   - Verify all existing tests pass

2. **CodeExtractorService** (Red → Green → Refactor)
   - Write failing test for `tools` in API params
   - Add the tool definition and include in params
   - Write failing test for function call detection
   - Implement function call response handling
   - Write failing test for `noCodeGenerated` flag passing
   - Update `extractCode()` to pass the flag

## Verification

1. Run all tests: `npm test`
2. Verify no regressions in existing functionality
3. Manual test with `npm run dev`:
   - Test with text containing code → should extract normally
   - Test with text without code → should trigger function call and set `noCodeGenerated: true`
