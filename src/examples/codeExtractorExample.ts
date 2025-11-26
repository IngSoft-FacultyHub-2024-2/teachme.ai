import { CodeExtractorFeature } from '../features/code-extractor/CodeExtractorFeature';

/**
 * Example demonstrating how to use the CodeExtractor feature
 */
async function main(): Promise<void> {
  try {
    // Create an instance of the CodeExtractor feature
    const codeExtractor = new CodeExtractorFeature();

    // Example text containing code
    const textWithCode = `
      Here is a simple TypeScript function:

      function calculateSum(a: number, b: number): number {
        return a + b;
      }

      You can use it like this: const result = calculateSum(5, 10);
    `;

    console.log('Extracting code from text...\n');
    console.log('Input text:', textWithCode);
    console.log('\n' + '='.repeat(60) + '\n');

    // Extract code from the text
    const result = await codeExtractor.extractCode(textWithCode);

    if (result.success) {
      const extracted = result.value;

      console.log('✓ Code extraction successful!\n');
      console.log('Extracted Code:');
      console.log('─'.repeat(60));
      console.log(extracted.getCleanCode());
      console.log('─'.repeat(60));
      console.log(`\nDetected Language: ${extracted.language ?? 'unknown'}`);
      console.log(`Has Code: ${extracted.hasCode()}`);
    } else {
      console.error('✗ Code extraction failed:');
      console.error(result.error.message);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main();
}

export { main };
