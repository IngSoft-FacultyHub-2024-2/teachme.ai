  it('fails on empty JSON string', () => {
    const parser = new JsonKataParser();
    const result = parser.parse('');
    expect(result.success).toBe(false);
  });

  it('fails on syntactically incorrect JSON', () => {
    const parser = new JsonKataParser();
    const result = parser.parse('{ kata_name: "Bad" ');
    expect(result.success).toBe(false);
  });
  it('parses a kata with one stage', () => {
    const singleStageJson = JSON.stringify({
      kata_name: 'SingleStageKata',
      stage_1: {
        problem: 'Do something simple.',
        sample_output: '42',
      }
    });
    const parser = new JsonKataParser();
    const result = parser.parse(singleStageJson);
    expect(result.success).toBe(true);
    if (result.success) {
      const kata = result.value;
      expect(kata.name).toBe('SingleStageKata');
      expect(Array.isArray(kata.stages)).toBe(true);
      expect(kata.stages?.length).toBe(1);
      if (kata.stages && kata.stages.length === 1) {
        expect(kata.stages[0]?.problem).toBe('Do something simple.');
        expect(kata.stages[0]?.sampleOutput).toBe('42');
      }
    }
  });
import { JsonKataParser } from '../../../../src/features/kata-instruction/services/JsonKataParser';
import { KataInstruction } from '../../../../src/features/kata-instruction/domain/KataInstruction';
import fs from 'fs';
import path from 'path';

describe('JsonKataParser', () => {
  it('parses kata-instructions.json with multiple stages', () => {
    const jsonPath = path.join(__dirname, '../../../../src/inputData/kata-instructions.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const parser = new JsonKataParser();
    const result = parser.parse(jsonContent);
    expect(result.success).toBe(true);
    if (result.success) {
      const kata = result.value as KataInstruction;
      expect(kata.name).toBe('FizzBuzz');
      expect(Array.isArray(kata.stages)).toBe(true);
      expect(kata.stages?.length).toBeGreaterThanOrEqual(2);
      if (kata.stages && kata.stages.length >= 2) {
        expect(kata.stages[0]?.problem).toContain('Write a program');
        expect(kata.stages[1]?.problem).toContain('new requirements');
        // Check example parsing
        expect(kata.stages[1]?.problem).toContain('A number is fizz');
      }
    }
  });

  it('fails on invalid JSON', () => {
    const parser = new JsonKataParser();
    const result = parser.parse('{ invalid json }');
    expect(result.success).toBe(false);
  });

  it('fails if no stages', () => {
    const parser = new JsonKataParser();
    const result = parser.parse('{ "kata_name": "Test" }');
    expect(result.success).toBe(false);
  });
});
