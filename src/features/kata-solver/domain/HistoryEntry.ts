import { KataEvaluation } from '../../kata-evaluator/domain/KataEvaluation';

/**
 * JSON representation of HistoryEvaluation
 */
export interface HistoryEvaluationJSON {
  ordinal: number;
  responseString: string;
  timestamp: string;
}

/**
 * Represents evaluation data stored in conversation history
 */
export class HistoryEvaluation {
  readonly ordinal: number;
  readonly responseString: string;
  readonly timestamp: Date;

  constructor(ordinal: number, responseString: string, timestamp: Date) {
    this.validateOrdinal(ordinal);
    this.validateResponseString(responseString);

    this.ordinal = ordinal;
    this.responseString = responseString;
    this.timestamp = timestamp;
  }

  private validateOrdinal(ordinal: number): void {
    if (ordinal < 1) {
      throw new Error('Ordinal must be at least 1');
    }
  }

  private validateResponseString(responseString: string): void {
    if (!responseString || responseString.trim() === '') {
      throw new Error('Response string cannot be empty');
    }
  }

  /**
   * Creates a HistoryEvaluation from a KataEvaluation
   */
  static fromKataEvaluation(kataEval: KataEvaluation): HistoryEvaluation {
    return new HistoryEvaluation(kataEval.ordinal, kataEval.responseString, kataEval.timestamp);
  }

  /**
   * Serializes to JSON
   */
  toJSON(): HistoryEvaluationJSON {
    return {
      ordinal: this.ordinal,
      responseString: this.responseString,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Creates a HistoryEvaluation from JSON
   */
  static fromJSON(json: HistoryEvaluationJSON): HistoryEvaluation {
    return new HistoryEvaluation(json.ordinal, json.responseString, new Date(json.timestamp));
  }
}

/**
 * JSON representation of HistoryEntry
 */
export interface HistoryEntryJSON {
  userPrompt: string;
  assistantResponse: string;
  extractedCode: string | null;
  evaluation: HistoryEvaluationJSON | null;
  timestamp: string;
}

/**
 * Represents a single interaction in the conversation history
 */
export class HistoryEntry {
  readonly userPrompt: string;
  readonly assistantResponse: string;
  readonly extractedCode: string | null;
  readonly evaluation: HistoryEvaluation | null;
  readonly timestamp: Date;

  constructor(
    userPrompt: string,
    assistantResponse: string,
    extractedCode: string | null = null,
    evaluation: HistoryEvaluation | null = null,
    timestamp?: Date
  ) {
    this.validateUserPrompt(userPrompt);
    this.validateAssistantResponse(assistantResponse);

    this.userPrompt = userPrompt;
    this.assistantResponse = assistantResponse;
    this.extractedCode = extractedCode;
    this.evaluation = evaluation;
    this.timestamp = timestamp ?? new Date();
  }

  private validateUserPrompt(userPrompt: string): void {
    if (!userPrompt || userPrompt.trim() === '') {
      throw new Error('User prompt cannot be empty');
    }
  }

  private validateAssistantResponse(assistantResponse: string): void {
    if (!assistantResponse || assistantResponse.trim() === '') {
      throw new Error('Assistant response cannot be empty');
    }
  }

  /**
   * Returns a new HistoryEntry with the extracted code set
   */
  withExtractedCode(code: string): HistoryEntry {
    return new HistoryEntry(
      this.userPrompt,
      this.assistantResponse,
      code,
      this.evaluation,
      this.timestamp
    );
  }

  /**
   * Returns a new HistoryEntry with the evaluation set
   */
  withEvaluation(evaluation: HistoryEvaluation): HistoryEntry {
    return new HistoryEntry(
      this.userPrompt,
      this.assistantResponse,
      this.extractedCode,
      evaluation,
      this.timestamp
    );
  }

  /**
   * Returns true if this entry has extracted code
   */
  hasExtractedCode(): boolean {
    return this.extractedCode !== null;
  }

  /**
   * Returns true if this entry has been evaluated
   */
  hasEvaluation(): boolean {
    return this.evaluation !== null;
  }

  /**
   * Serializes to JSON
   */
  toJSON(): HistoryEntryJSON {
    return {
      userPrompt: this.userPrompt,
      assistantResponse: this.assistantResponse,
      extractedCode: this.extractedCode,
      evaluation: this.evaluation ? this.evaluation.toJSON() : null,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Creates a HistoryEntry from JSON
   */
  static fromJSON(json: HistoryEntryJSON): HistoryEntry {
    const evaluation = json.evaluation ? HistoryEvaluation.fromJSON(json.evaluation) : null;
    return new HistoryEntry(
      json.userPrompt,
      json.assistantResponse,
      json.extractedCode,
      evaluation,
      new Date(json.timestamp)
    );
  }
}
