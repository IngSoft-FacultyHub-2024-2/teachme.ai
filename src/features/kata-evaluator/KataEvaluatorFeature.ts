import { KataEvaluatorConfig } from './services/KataEvaluatorConfig';
import { KataEvaluatorService } from './services/KataEvaluatorService';
import { KataEvaluation } from './domain/KataEvaluation';
import { ExtractedCode } from '../code-extractor/domain/ExtractedCode';
import { KataEvaluationRubric } from '../kata-instruction/domain/KataEvaluationRubric';
import { KataInstruction } from '../kata-instruction/domain/KataInstruction';
import { Result } from '../../shared/types/Result';

/**
 * Feature facade for evaluating kata code submissions
 */
export class KataEvaluatorFeature {
  private readonly service: KataEvaluatorService;

  constructor() {
    const config = new KataEvaluatorConfig();
    this.service = new KataEvaluatorService(config);
  }

  /**
   * Evaluates extracted code against a kata rubric
   *
   * @param extractedCode The code extracted by code-extractor
   * @param rubric The evaluation rubric from kata-instruction
   * @param ordinal The evaluation sequence number
   * @param kataInstruction Optional kata instruction for context-aware evaluation
   * @returns Result containing KataEvaluation or error
   */
  async evaluate(
    extractedCode: ExtractedCode,
    rubric: KataEvaluationRubric,
    ordinal: number,
    kataInstruction?: KataInstruction
  ): Promise<Result<KataEvaluation>> {
    return await this.service.evaluateCode(extractedCode, rubric, ordinal, kataInstruction);
  }
}
