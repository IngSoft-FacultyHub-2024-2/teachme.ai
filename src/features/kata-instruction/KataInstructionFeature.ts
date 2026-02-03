import * as path from 'path';
import { FileReader } from './services/FileReader';
import { JsonKataParser } from './services/JsonKataParser';
import { Result, failure, success } from '../../shared/types/Result';
import { KataInstruction } from './domain/KataInstruction';
import { KataEvaluationRubric } from './domain/KataEvaluationRubric';
import { KataEvaluationRubricService } from './services/KataEvaluationRubricService';
import { KataFileConfig } from '../../services/KataFileConfig';

export class KataInstructionFeature {
  private readonly inputDataPath: string;
  private readonly fileReader: FileReader;
  private readonly jsonParser: JsonKataParser;
  private readonly rubricService: KataEvaluationRubricService;
  private readonly config: KataFileConfig;

  constructor(config?: KataFileConfig) {
    this.config = config ?? new KataFileConfig();
    this.inputDataPath = this.config.inputDataPath;
    this.fileReader = new FileReader();
    this.jsonParser = new JsonKataParser();
    this.rubricService = new KataEvaluationRubricService(this.config);
  }

  /**
   * Reads a KataEvaluationRubric from a JSON file (format: src/inputData/kata_evaluation_rubric.json)
   * @param filename The rubric JSON filename (e.g., 'kata_evaluation_rubric.json')
   */
  public async loadKataEvaluationRubric(filename: string): Promise<Result<KataEvaluationRubric>> {
    return this.rubricService.loadRubric(filename);
  }

  /**
   * Lists all available kata instruction files in the inputData directory
   * @returns Result with array of kata filenames (.json files only)
   */
  public async listAvailableKatas(): Promise<Result<string[]>> {
    const jsonFilesResult = await this.fileReader.listFilesWithExtension(
      this.inputDataPath,
      '.json'
    );
    if (!jsonFilesResult.success) return jsonFilesResult;

    return success(jsonFilesResult.value);
  }

  /**
   * Loads a kata instruction from a JSON file
   * @param filename The kata filename (e.g., 'kata-instructions.json')
   * @returns Result with parsed KataInstruction
   */
  public async loadKataInstruction(filename: string): Promise<Result<KataInstruction>> {
    const filePath = path.join(this.inputDataPath, filename);
    const ext = path.extname(filename).toLowerCase();

    if (ext !== '.json') {
      return failure(new Error('Only JSON files are supported'));
    }

    const readResult = await this.fileReader.readFile(filePath);
    if (!readResult.success) {
      return failure(new Error(`Failed to read file: ${readResult.error.message}`));
    }

    const parseResult = this.jsonParser.parse(readResult.value);
    if (!parseResult.success) {
      return failure(new Error(`Failed to parse JSON kata: ${parseResult.error.message}`));
    }

    return parseResult;
  }
}
