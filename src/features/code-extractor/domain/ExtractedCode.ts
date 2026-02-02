/**
 * Represents extracted code from a text input
 */
export class ExtractedCode {
  public constructor(
    public readonly originalText: string,
    public readonly extractedCode: string,
    public readonly language?: string
  ) {}

  /**
   * Checks if code was successfully extracted
   */
  public hasCode(): boolean {
    return this.extractedCode.trim().length > 0;
  }

  /**
   * Gets the extracted code without any surrounding whitespace
   */
  public getCleanCode(): string {
    return this.extractedCode.trim();
  }
}
