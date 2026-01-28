import { Result, success, failure } from '../../../shared/types/Result';
import { KataInstruction } from '../domain/KataInstruction';
import { KataStage } from '../domain/KataStage';

type RawKata = Record<string, any>;

export class JsonKataParser {
  public parse(jsonContent: string): Result<KataInstruction> {
    try {
      const raw: RawKata = JSON.parse(jsonContent);

      const name = raw.kata_name ?? raw.name ?? null;
      if (!name) return failure(new Error('Kata name not found in JSON'));

      // Extract stage keys like stage_1, stage_2, or an array 'stages'
      const stages: KataStage[] = [];

      if (Array.isArray(raw.stages)) {
        raw.stages.forEach((s: any, idx: number) => {
          stages.push(this.normalizeStage(s, idx + 1));
        });
      } else {
        // Look for keys matching stage_\d+
        const stageKeys = Object.keys(raw).filter((k) => /^stage_\d+$/i.test(k));
        if (stageKeys.length > 0) {
          // Sort keys by number
          stageKeys
            .sort((a, b) => {
              const na = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
              const nb = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
              return na - nb;
            })
            .forEach((key, idx) => {
              stages.push(this.normalizeStage(raw[key], idx + 1));
            });
        }
      }

      if (stages.length === 0) {
        return failure(new Error('No stages found in JSON'));
      }

      const kata: KataInstruction = {
        name,
        stages,
      };

      return success(kata);
    } catch (error) {
      return failure(error as Error);
    }
  }

  private normalizeStage(rawStage: any, stageNumber: number): KataStage {
    if (typeof rawStage === 'string') {
      return {
        stageNumber,
        title: `Stage ${stageNumber}`,
        problem: rawStage,
      };
    }

    const problem = rawStage.problem ?? rawStage.problema ?? '';
    const sampleOutput = rawStage.sample_output ?? rawStage.sampleOutput ?? rawStage.sample_output;
    const title = rawStage.title ?? `Stage ${stageNumber}`;

    const requirements = Array.isArray(rawStage.requirements) ? rawStage.requirements : undefined;

    return {
      stageNumber,
      title,
      problem: problem ?? '',
      sampleOutput,
      requirements,
    };
  }
}
