import { KataEvaluationRubricService } from '../../../../src/features/kata-instruction/services/KataEvaluationRubricService';
import { KataEvaluationRubric } from '../../../../src/features/kata-instruction/domain/KataEvaluationRubric';
import { KataFileConfig } from '../../../../src/services/KataFileConfig';
import * as path from 'path';
import fs from 'fs';

describe('KataEvaluationRubricService', () => {
  const inputDataPath = path.join(__dirname, '../../../../src/inputData');

  // Create a mock config for testing
  const mockConfig = {
    inputDataPath,
    defaultInstructionFile: 'kata-instructions.json',
    defaultRubricFile: 'kata_evaluation_rubric.json',
    getDefaultInstructionPath: () => path.join(inputDataPath, 'kata-instructions.json'),
    getDefaultRubricPath: () => path.join(inputDataPath, 'kata_evaluation_rubric.json'),
    isValid: () => true,
  } as KataFileConfig;

  const service = new KataEvaluationRubricService(mockConfig);

  it('fails on empty JSON', async () => {
    const file = 'empty.json';
    fs.writeFileSync(path.join(inputDataPath, file), '');
    const result = await service.loadRubric(file);
    expect(result.success).toBe(false);
    fs.unlinkSync(path.join(inputDataPath, file));
  });

  it('fails on ill-formed JSON', async () => {
    const file = 'illformed.json';
    fs.writeFileSync(path.join(inputDataPath, file), '{ rubric: ');
    const result = await service.loadRubric(file);
    expect(result.success).toBe(false);
    fs.unlinkSync(path.join(inputDataPath, file));
  });

  it('succeeds on well-formed JSON and scores add up', async () => {
    const file = 'kata_evaluation_rubric.json';
    const result = await service.loadRubric(file);
    expect(result.success).toBe(true);
    if (result.success) {
      const rubric: KataEvaluationRubric = result.value;
      // Check structure
      expect(rubric.rubric).toBeDefined();
      expect(Array.isArray(rubric.rubric.categories)).toBe(true);
      expect(typeof rubric.rubric.total_max_score).toBe('number');
      // Check score sum
      const sum = rubric.rubric.categories.reduce((acc, cat) => acc + cat.max_score, 0);
      expect(sum).toBe(rubric.rubric.total_max_score);
    }
  });
});
