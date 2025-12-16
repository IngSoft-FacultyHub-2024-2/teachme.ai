import { ExtractedCode } from '../../../../src/features/code-extractor/domain/ExtractedCode';

describe('ExtractedCode', () => {
  describe('constructor', () => {
    it('should create an ExtractedCode instance with all properties', () => {
      const originalText = 'Here is some code: function test() { return 42; }';
      const extractedCode = 'function test() { return 42; }';
      const language = 'typescript';

      const result = new ExtractedCode(originalText, extractedCode, language);

      expect(result.originalText).toBe(originalText);
      expect(result.extractedCode).toBe(extractedCode);
      expect(result.language).toBe(language);
    });

    it('should create an ExtractedCode instance without language', () => {
      const originalText = 'Some text';
      const extractedCode = 'code here';

      const result = new ExtractedCode(originalText, extractedCode);

      expect(result.originalText).toBe(originalText);
      expect(result.extractedCode).toBe(extractedCode);
      expect(result.language).toBeUndefined();
    });
  });

  describe('hasCode', () => {
    it('should return true when extracted code is not empty', () => {
      const code = new ExtractedCode('text', 'function test() {}', 'typescript');

      expect(code.hasCode()).toBe(true);
    });

    it('should return false when extracted code is empty', () => {
      const code = new ExtractedCode('text', '', 'typescript');

      expect(code.hasCode()).toBe(false);
    });

    it('should return false when extracted code is only whitespace', () => {
      const code = new ExtractedCode('text', '   \n\t  ', 'typescript');

      expect(code.hasCode()).toBe(false);
    });
  });

  describe('getCleanCode', () => {
    it('should return trimmed code', () => {
      const code = new ExtractedCode('text', '  function test() {}  \n', 'typescript');

      expect(code.getCleanCode()).toBe('function test() {}');
    });

    it('should return empty string when no code', () => {
      const code = new ExtractedCode('text', '   ', 'typescript');

      expect(code.getCleanCode()).toBe('');
    });

    it('should preserve internal whitespace', () => {
      const extractedCode = 'function test() {\n  return 42;\n}';
      const code = new ExtractedCode('text', `  ${extractedCode}  `, 'typescript');

      expect(code.getCleanCode()).toBe(extractedCode);
    });
  });
});
