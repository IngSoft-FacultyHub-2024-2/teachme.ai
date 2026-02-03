/**
 * Represents the evaluation result of a kata submission
 * Stores the raw response from OpenAI along with metadata
 */
export class KataEvaluation {
  readonly ordinal: number;
  readonly responseString: string;
  readonly evaluatedCode: string;
  readonly timestamp: Date;

  constructor(ordinal: number, responseString: string, evaluatedCode: string) {
    this.ordinal = ordinal;
    this.responseString = responseString;
    this.evaluatedCode = evaluatedCode;
    this.timestamp = new Date();
  }
}
