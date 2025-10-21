import { KataStage } from './KataStage';
import { EvaluationLevel } from './EvaluationCriteria';

export interface KataInstruction {
  name: string;
  stages: KataStage[];
  evaluationCriteria?: EvaluationLevel[];
}
