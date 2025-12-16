export interface KataEvaluationRubric {
  rubric: {
    title: string;
    total_max_score: number;
    categories: Array<{
      name: string;
      max_score: number;
      levels: Array<{
        level: number;
        name: string;
        score_range: { min: number; max: number };
        criteria: Array<{
          score_range: { min: number; max: number };
          description: string;
        }>;
      }>;
    }>;
    overall_classification: Array<{
      name: string;
      score_range: { min: number; max: number };
    }>;
  };
}
