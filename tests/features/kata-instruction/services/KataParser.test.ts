import { KataParser } from '../../../../src/features/kata-instruction/services/KataParser';

describe('KataParser', () => {
  describe('parse', () => {
    it('should extract kata name from markdown', () => {
      const markdown = `# Kata Name: FizzBuzz

## Stage 1

### Problem:
Test problem`;
      const parser = new KataParser();
      const result = parser.parse(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.name).toBe('FizzBuzz');
      }
    });

    it('should extract single stage from markdown', () => {
      const markdown = `# Kata Name: FizzBuzz

## Stage 1

### Problem:

Write a program that prints the numbers from 1 to 100.`;

      const parser = new KataParser();
      const result = parser.parse(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.stages).toHaveLength(1);
        expect(result.value.stages[0]?.stageNumber).toBe(1);
        expect(result.value.stages[0]?.title).toBe('Stage 1');
        expect(result.value.stages[0]?.problem).toContain(
          'Write a program that prints the numbers from 1 to 100'
        );
      }
    });

    it('should extract multiple stages from markdown', () => {
      const markdown = `# Kata Name: FizzBuzz

## Stage 1

### Problem:
Basic FizzBuzz

## Stage 2

### Problem:
Advanced FizzBuzz with new requirements`;

      const parser = new KataParser();
      const result = parser.parse(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.stages).toHaveLength(2);
        expect(result.value.stages[0]?.stageNumber).toBe(1);
        expect(result.value.stages[1]?.stageNumber).toBe(2);
        expect(result.value.stages[0]?.problem).toContain('Basic FizzBuzz');
        expect(result.value.stages[1]?.problem).toContain('Advanced FizzBuzz');
      }
    });

    it('should extract sample output when present', () => {
      const markdown = `# Kata Name: FizzBuzz

## Stage 1

### Problem:
Write a program

Sample output:

1
2
Fizz`;

      const parser = new KataParser();
      const result = parser.parse(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.stages[0]?.sampleOutput).toBeDefined();
        expect(result.value.stages[0]?.sampleOutput).toContain('1');
        expect(result.value.stages[0]?.sampleOutput).toContain('Fizz');
      }
    });

    it('should extract evaluation criteria when present', () => {
      const markdown = `# Kata Name: FizzBuzz

## Stage 1

### Problem:
Write a program

## Code Quality Evaluation Criteria:
Level 1: Beginner (0-3 points)

Incomplete basic functionality
Syntax errors

Level 2: Basic (4-6 points)

Stage 1 functional
Code works`;

      const parser = new KataParser();
      const result = parser.parse(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.evaluationCriteria).toBeDefined();
        expect(result.value.evaluationCriteria).toHaveLength(2);
        expect(result.value.evaluationCriteria?.[0]?.levelId).toBe('level-1');
        expect(result.value.evaluationCriteria?.[0]?.description).toContain('Beginner');
        expect(result.value.evaluationCriteria?.[1]?.levelId).toBe('level-2');
        expect(result.value.evaluationCriteria?.[1]?.description).toContain('Basic');
      }
    });

    it('should handle markdown without evaluation criteria', () => {
      const markdown = `# Kata Name: Simple Kata

## Stage 1

### Problem:
Do something simple`;

      const parser = new KataParser();
      const result = parser.parse(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.evaluationCriteria).toBeUndefined();
      }
    });

    it('should return failure for invalid markdown without kata name', () => {
      const markdown = '## Stage 1\n\n### Problem:\nNo kata name';
      const parser = new KataParser();
      const result = parser.parse(markdown);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('Kata name not found');
      }
    });

    it('should return failure for markdown without stages', () => {
      const markdown = '# Kata Name: Empty Kata\n\nNo stages here';
      const parser = new KataParser();
      const result = parser.parse(markdown);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('No stages found');
      }
    });

    it('should handle empty markdown', () => {
      const markdown = '';
      const parser = new KataParser();
      const result = parser.parse(markdown);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
