/**
 * Configuration for the Kata Evaluator service
 */
export class KataEvaluatorConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly promptId?: string;
  readonly promptVersion?: string;
  readonly maxTokens: number;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.KATA_EVALUATOR_MODEL || 'gpt-4-turbo-preview';
    this.promptId = process.env.KATA_EVALUATOR_PROMPT_ID;
    this.promptVersion = process.env.KATA_EVALUATOR_PROMPT_VERSION;
    this.maxTokens = parseInt(process.env.KATA_EVALUATOR_MAX_TOKENS || '4096');

    this.validate();
  }

  private validate(): void {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    if (isNaN(this.maxTokens) || this.maxTokens <= 0) {
      throw new Error('Max tokens must be positive');
    }
  }
}
