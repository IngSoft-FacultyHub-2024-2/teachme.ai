import path from 'path';

/**
 * Configuration class for Kata file paths and settings
 * Manages environment variables for kata instruction and rubric files
 */
export class KataFileConfig {
  public readonly inputDataPath: string;
  public readonly defaultInstructionFile: string;
  public readonly defaultRubricFile: string;

  constructor() {
    const rawInputDataPath = this.getEnv('KATA_INPUT_DATA_PATH', 'src/inputData');
    this.defaultInstructionFile = this.getEnv(
      'KATA_DEFAULT_INSTRUCTION_FILE',
      'kata-instructions.json'
    );
    this.defaultRubricFile = this.getEnv('KATA_DEFAULT_RUBRIC_FILE', 'kata_evaluation_rubric.json');

    this.validateRawInputDataPath(rawInputDataPath);
    this.inputDataPath = path.resolve(rawInputDataPath);
    this.validate();
  }

  private validateRawInputDataPath(rawPath: string): void {
    if (!rawPath || rawPath.trim() === '') {
      throw new Error('KATA_INPUT_DATA_PATH cannot be empty');
    }
  }

  /**
   * Validates the configuration values
   * @throws Error if any validation fails
   */
  private validate(): void {
    if (!this.inputDataPath || this.inputDataPath.trim() === '') {
      throw new Error('KATA_INPUT_DATA_PATH cannot be empty');
    }

    if (!this.defaultInstructionFile || this.defaultInstructionFile.trim() === '') {
      throw new Error('KATA_DEFAULT_INSTRUCTION_FILE cannot be empty');
    }

    if (!this.defaultRubricFile || this.defaultRubricFile.trim() === '') {
      throw new Error('KATA_DEFAULT_RUBRIC_FILE cannot be empty');
    }
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
   * Gets the full path to the default instruction file
   * @returns Absolute path to the instruction file
   */
  public getDefaultInstructionPath(): string {
    return path.join(this.inputDataPath, this.defaultInstructionFile);
  }

  /**
   * Gets the full path to the default rubric file
   * @returns Absolute path to the rubric file
   */
  public getDefaultRubricPath(): string {
    return path.join(this.inputDataPath, this.defaultRubricFile);
  }

  /**
   * Checks if the configuration is valid
   * @returns true if valid
   */
  public isValid(): boolean {
    return (
      this.inputDataPath.trim().length > 0 &&
      this.defaultInstructionFile.trim().length > 0 &&
      this.defaultRubricFile.trim().length > 0
    );
  }
}
