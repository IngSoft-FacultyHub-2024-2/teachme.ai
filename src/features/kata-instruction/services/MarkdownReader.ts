// This file is deprecated and kept only for backward compatibility.
// Markdown support has been removed. Use FileReader for JSON files only.

/**
 * @deprecated This class is no longer supported. Use FileReader instead.
 */
export class MarkdownReader {
  constructor() {
    throw new Error('MarkdownReader is deprecated. Use FileReader for file operations instead.');
  }
}
