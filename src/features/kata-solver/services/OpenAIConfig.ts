/**
 * Configuration class for OpenAI API integration
 * Manages environment variables and validation for OpenAI client setup
 */
export class OpenAIConfig {
  public readonly apiKey: string;
  public readonly model: string;
  public readonly maxTokens: number;
  public readonly contextWindow: number;
  public readonly promptId: string;
  public readonly promptVersion: string;

  public constructor() {
    this.apiKey = this.getRequiredEnv('OPENAI_API_KEY');
    this.model = this.getEnv('OPENAI_MODEL', 'gpt-4-turbo-preview');
    this.maxTokens = this.getNumberEnv('OPENAI_MAX_TOKENS', 4096);
    this.contextWindow = this.getNumberEnv('OPENAI_CONTEXT_WINDOW', 128000);
    this.promptId = this.getEnv('OPENAI_PROMPT_ID', '');
    this.promptVersion = this.getEnv('OPENAI_PROMPT_VERSION', '');
  }

  /**
   * Gets a required environment variable
   * @param key - The environment variable key
   * @returns The environment variable value
   * @throws Error if the environment variable is not set or empty
   */
  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      throw new Error(`${key} is required`);
    }
    return value;
  }

  /**
   * Gets an optional environment variable with a default value
   * @param key - The environment variable key
   * @param defaultValue - The default value if not set
   * @returns The environment variable value or default
   */
  private getEnv(key: string, defaultValue: string): string {
    return process.env[key] ?? defaultValue;
  }

  /**
   * Gets a numeric environment variable with a default value
   * @param key - The environment variable key
   * @param defaultValue - The default numeric value if not set
   * @returns The parsed number or default
   */
  private getNumberEnv(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
}
