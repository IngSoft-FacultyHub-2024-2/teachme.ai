import { Result, success, failure } from '../../../shared/types/Result';
import { KataInstruction } from '../domain/KataInstruction';
import { KataStage } from '../domain/KataStage';
import { EvaluationLevel } from '../domain/EvaluationCriteria';

export class KataParser {
  public parse(markdown: string): Result<KataInstruction> {
    try {
      if (!markdown || markdown.trim() === '') {
        return failure(new Error('Markdown content is empty'));
      }

      const name = this.extractKataName(markdown);
      if (!name) {
        return failure(new Error('Kata name not found'));
      }

      const stages = this.extractStages(markdown);
      if (stages.length === 0) {
        return failure(new Error('No stages found'));
      }

      const evaluationCriteria = this.extractEvaluationCriteria(markdown);

      const kata: KataInstruction = {
        name,
        stages,
        evaluationCriteria: evaluationCriteria.length > 0 ? evaluationCriteria : undefined,
      };

      return success(kata);
    } catch (error) {
      return failure(error as Error);
    }
  }

  private extractKataName(markdown: string): string | null {
    const match = markdown.match(/^#\s+Kata Name:\s*(.+)$/m);
    return match?.[1]?.trim() ?? null;
  }

  private extractStages(markdown: string): KataStage[] {
    const stages: KataStage[] = [];
    const stageRegex = /##\s+Stage\s+(\d+)([\s\S]*?)(?=##\s+Stage\s+\d+|##\s+Code Quality|$)/g;

    let match;
    while ((match = stageRegex.exec(markdown)) !== null) {
      const stageNumber = parseInt(match[1] ?? '0', 10);
      const stageContent = match[2] ?? '';

      const problem = this.extractProblem(stageContent);
      const sampleOutput = this.extractSampleOutput(stageContent);

      stages.push({
        stageNumber,
        title: `Stage ${stageNumber}`,
        problem: problem ?? '',
        sampleOutput,
      });
    }

    return stages;
  }

  private extractProblem(stageContent: string): string | null {
    const match = stageContent.match(/###\s+Problem:\s*([\s\S]*?)(?=Sample output:|##|$)/);
    return match?.[1]?.trim() ?? null;
  }

  private extractSampleOutput(stageContent: string): string | undefined {
    const match = stageContent.match(/Sample output:\s*([\s\S]*?)(?=##|$)/);
    const output = match?.[1]?.trim();
    return output && output.length > 0 ? output : undefined;
  }

  private extractEvaluationCriteria(markdown: string): EvaluationLevel[] {
    const criteria: EvaluationLevel[] = [];
    const criteriaMatch = markdown.match(/##\s+Code Quality Evaluation Criteria:([\s\S]*?)$/);

    if (!criteriaMatch) {
      return criteria;
    }

    const criteriaContent = criteriaMatch[1] ?? '';
    const levelRegex = /Level\s+(\d+):\s*([^\n]+)([\s\S]*?)(?=Level\s+\d+:|$)/g;

    let match;
    while ((match = levelRegex.exec(criteriaContent)) !== null) {
      const levelNumber = match[1] ?? '0';
      const levelName = match[2] ?? '';
      const levelDescription = match[3] ?? '';

      criteria.push({
        levelId: `level-${levelNumber}`,
        description: `Level ${levelNumber}: ${levelName.trim()}\n${levelDescription.trim()}`,
      });
    }

    return criteria;
  }
}
