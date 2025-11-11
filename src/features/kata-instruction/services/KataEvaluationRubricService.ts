import * as path from 'path';
import { FileReader } from './FileReader';
import { KataEvaluationRubric } from '../domain/KataEvaluationRubric';
import { Result, failure, success } from '../../../shared/types/Result';
import { KataFileConfig } from '../../../services/KataFileConfig';

export class KataEvaluationRubricService {
  private readonly inputDataPath: string;
  private readonly fileReader: FileReader;
  private readonly config: KataFileConfig;

  constructor(config?: KataFileConfig) {
    this.config = config ?? new KataFileConfig();
    this.inputDataPath = this.config.inputDataPath;
    this.fileReader = new FileReader();
  }

  public async loadRubric(filename: string): Promise<Result<KataEvaluationRubric>> {
    const filePath = path.join(this.inputDataPath, filename);
    const ext = path.extname(filename).toLowerCase();
    if (ext !== '.json') {
      return failure(new Error('Rubric file must be a .json file'));
    }
    const readResult = await this.fileReader.readFile(filePath);
    if (!readResult.success) {
      return failure(new Error(`Failed to read rubric file: ${readResult.error.message}`));
    }
    try {
      const parsed: KataEvaluationRubric = JSON.parse(readResult.value);
      if (!parsed.rubric || !parsed.rubric.categories || !parsed.rubric.overall_classification) {
        return failure(new Error('Invalid rubric format'));
      }
      return success(parsed);
    } catch (err) {
      return failure(new Error('Failed to parse rubric JSON: ' + (err as Error).message));
    }
  }
}
