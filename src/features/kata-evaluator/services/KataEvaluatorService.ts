import OpenAI from 'openai';
import { KataEvaluatorConfig } from './KataEvaluatorConfig';
import { KataEvaluation } from '../domain/KataEvaluation';
import { ExtractedCode } from '../../code-extractor/domain/ExtractedCode';
import { KataEvaluationRubric } from '../../kata-instruction/domain/KataEvaluationRubric';
import { KataInstruction } from '../../kata-instruction/domain/KataInstruction';
import { Result, success, failure } from '../../../shared/types/Result';

/**
 * Service for evaluating kata code submissions using OpenAI
 */
export class KataEvaluatorService {
  private readonly client: OpenAI;

  constructor(private readonly config: KataEvaluatorConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  /**
   * Evaluates extracted code against a kata rubric
   * @param extractedCode The code extracted from student submission
   * @param rubric The evaluation rubric
   * @param ordinal The evaluation sequence number
   * @param kataInstruction Optional kata instruction for context-aware evaluation
   * @returns Result containing KataEvaluation or error
   */
  async evaluateCode(
    extractedCode: ExtractedCode,
    rubric: KataEvaluationRubric,
    ordinal: number,
    kataInstruction?: KataInstruction
  ): Promise<Result<KataEvaluation>> {
    try {
      const prompt = this.buildEvaluationPrompt(extractedCode, rubric, kataInstruction);
      const apiResponse = await this.callOpenAI(prompt);

      if (!apiResponse.success) {
        return apiResponse;
      }

      const evaluation = new KataEvaluation(
        ordinal,
        apiResponse.value,
        extractedCode.getCleanCode()
      );

      return success(evaluation);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Unknown error during evaluation'));
    }
  }

  private buildEvaluationPrompt(
    extractedCode: ExtractedCode,
    rubric: KataEvaluationRubric,
    kataInstruction?: KataInstruction
  ): string {
    const rubricText = JSON.stringify(rubric, null, 2);
    const code = extractedCode.getCleanCode();
    const language = extractedCode.language || 'text';

    let prompt = `You are a code evaluator. Evaluate the following code against the provided rubric.`;

    if (kataInstruction) {
      const instructionText = JSON.stringify(kataInstruction, null, 2);
      prompt += `

KATA INSTRUCTIONS:
${instructionText}`;
    }

    prompt += `

RUBRIC:
${rubricText}

CODE TO EVALUATE:
\`\`\`${language}
${code}
\`\`\`

Provide your evaluation based on the rubric criteria`;

    if (kataInstruction) {
      prompt += ` and verify that the code solves the kata problem described in the instructions`;
    }

    prompt += `.`;

    return prompt;
  }

  private async callOpenAI(prompt: string): Promise<Result<string>> {
    try {
      const params: any = {
        model: this.config.model,
        input: prompt,
        max_output_tokens: this.config.maxTokens,
      };

      if (this.config.promptId && this.config.promptId.trim() !== '') {
        params.prompt = {
          id: this.config.promptId.trim(),
          ...(this.config.promptVersion ? { version: this.config.promptVersion.trim() } : {}),
        };
      }

      const response = await this.client.responses.create(params);

      const content =
        response.output_text ||
        (Array.isArray(response.output)
          ? response.output.map((o: any) => o.content).join('\n')
          : '');

      if (!content) {
        return failure(new Error('Empty response from OpenAI'));
      }

      return success(content);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('OpenAI API call failed'));
    }
  }
}
