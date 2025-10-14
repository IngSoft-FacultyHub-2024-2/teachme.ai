import { KataInstruction } from '../../../../src/features/kata-instruction/domain/KataInstruction';
import { KataStage } from '../../../../src/features/kata-instruction/domain/KataStage';

describe('KataInstruction', () => {
  it('should create a valid KataInstruction with required fields', () => {
    const stage: KataStage = {
      stageNumber: 1,
      title: 'Stage 1',
      problem: 'Solve FizzBuzz',
    };

    const kata: KataInstruction = {
      name: 'FizzBuzz',
      stages: [stage],
    };

    expect(kata.name).toBe('FizzBuzz');
    expect(kata.stages).toHaveLength(1);
    expect(kata.stages[0]?.stageNumber).toBe(1);
  });

  it('should allow optional evaluation criteria', () => {
    const kata: KataInstruction = {
      name: 'FizzBuzz',
      stages: [],
      evaluationCriteria: [
        {
          levelId: 'beginner',
          description: 'Basic implementation',
        },
        {
          levelId: 'advanced',
          description: 'Optimized solution',
        },
      ],
    };

    expect(kata.evaluationCriteria).toBeDefined();
    expect(kata.evaluationCriteria).toHaveLength(2);
    expect(kata.evaluationCriteria?.[0]?.levelId).toBe('beginner');
  });

  it('should support multiple stages', () => {
    const stages: KataStage[] = [
      {
        stageNumber: 1,
        title: 'Stage 1',
        problem: 'Basic FizzBuzz',
      },
      {
        stageNumber: 2,
        title: 'Stage 2',
        problem: 'Advanced FizzBuzz',
        requirements: ['Contains digit 3', 'Contains digit 5'],
      },
    ];

    const kata: KataInstruction = {
      name: 'FizzBuzz',
      stages,
    };

    expect(kata.stages).toHaveLength(2);
    expect(kata.stages[1]?.requirements).toHaveLength(2);
  });
});
