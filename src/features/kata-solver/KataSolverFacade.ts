import { OpenAIConfig } from './services/OpenAIConfig';
import { OpenAIService } from './services/OpenAIService';
import { KataSolver } from './services/KataSolver';

/**
 * Facade for the KataSolver functionality
 * Manages initialization and provides access to the kata solving service
 */
export class KataSolverFacade {
  private readonly config: OpenAIConfig;
  private readonly openAIService: OpenAIService;
  public readonly kataSolver: KataSolver;

  constructor() {
    // Initialize configuration
    this.config = new OpenAIConfig();

    // Initialize OpenAI service
    this.openAIService = new OpenAIService(this.config);

    // Initialize KataSolver
    this.kataSolver = new KataSolver(this.openAIService);
  }

  /**
   * Gets the configuration used by this facade
   * @returns The OpenAI configuration
   */
  public getConfig(): OpenAIConfig {
    return this.config;
  }
}
