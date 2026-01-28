# Plan: Validate Code Extraction Using OpenAI Function Calling

## Problem
When `callResponsesAPI` returns an error message (e.g., "I couldn't find any code") instead of actual code, `hasCode()` still returns `true` because the string is non-empty. This causes error messages to be displayed as if they were extracted code.

## Solution
Use OpenAI Responses API with **function calling (tools)** to have the LLM return structured output with a boolean indicating whether code was found.

## Approach: OpenAI Function Calling

Define a tool/function that the LLM must call with:
- `codeFound: boolean` - whether code was detected in the input
- `code: string` - the extracted code (empty if not found)
- `language: string` - detected programming language (optional)

This forces the LLM to explicitly indicate if code exists, rather than relying on parsing text responses.

### Tool Definition
```typescript
const extractCodeTool = {
  type: "function",
  name: "report_extracted_code",
  description: "Report the results of code extraction from the provided text",
  parameters: {
    type: "object",
    properties: {
      codeFound: {
        type: "boolean",
        description: "True if code was found in the input text, false otherwise"
      },
      code: {
        type: "string",
        description: "The extracted code if found, empty string if not found"
      },
      language: {
        type: "string",
        description: "The detected programming language (typescript, python, java, etc.)"
      }
    },
    required: ["codeFound", "code"]
  }
};
```

### Changes Required

**File: `src/features/code-extractor/services/CodeExtractorService.ts`**

1. Define the function/tool schema for `report_extracted_code`
2. Update `callResponsesAPI` to:
   - Include the tool definition in the API call
   - Parse the function call response
   - Extract `codeFound`, `code`, and `language` from the tool call arguments
3. Update return logic:
   - If `codeFound === false` → return failure with appropriate message
   - If `codeFound === true` → return success with extracted code
4. Remove or simplify `detectLanguage()` method (language comes from LLM)

### Implementation Steps

1. Define `ExtractionResult` interface for the function call response
2. Create the tool definition constant
3. Update `callResponsesAPI` to include tools in the API request
4. Parse the tool call from the response
5. Update `extractCode` to use the `codeFound` boolean
6. Update tests to mock function call responses

### Files to Modify
- `src/features/code-extractor/services/CodeExtractorService.ts`
- `tests/features/code-extractor/services/CodeExtractorService.test.ts`

### Verification
1. Run `npm test` to check for regressions
2. Run `npm run dev` and test `/evaluate` command:
   - With conversation containing code → should extract successfully
   - With conversation containing no code → should show "No code found" message
3. Verify the function call is properly parsed from API response
