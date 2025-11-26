import path from 'path';
import { KataFileConfig } from '../../src/services/KataFileConfig';

describe('KataFileConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create config with all environment variables provided', () => {
      process.env.KATA_INPUT_DATA_PATH = './custom/path';
      process.env.KATA_DEFAULT_INSTRUCTION_FILE = 'custom-kata.json';
      process.env.KATA_DEFAULT_RUBRIC_FILE = 'custom-rubric.json';

      const config = new KataFileConfig();

      expect(config.inputDataPath).toBe('./custom/path');
      expect(config.defaultInstructionFile).toBe('custom-kata.json');
      expect(config.defaultRubricFile).toBe('custom-rubric.json');
    });

    it('should use default values when environment variables are not provided', () => {
      delete process.env.KATA_INPUT_DATA_PATH;
      delete process.env.KATA_DEFAULT_INSTRUCTION_FILE;
      delete process.env.KATA_DEFAULT_RUBRIC_FILE;

      const config = new KataFileConfig();

      expect(config.inputDataPath).toBe(path.join(process.cwd(), 'src', 'inputData'));
      expect(config.defaultInstructionFile).toBe('kata-instructions.json');
      expect(config.defaultRubricFile).toBe('kata_evaluation_rubric.json');
    });

    it('should accept partial environment variable configuration', () => {
      process.env.KATA_INPUT_DATA_PATH = './custom/path';
      delete process.env.KATA_DEFAULT_INSTRUCTION_FILE;
      delete process.env.KATA_DEFAULT_RUBRIC_FILE;

      const config = new KataFileConfig();

      expect(config.inputDataPath).toBe('./custom/path');
      expect(config.defaultInstructionFile).toBe('kata-instructions.json');
      expect(config.defaultRubricFile).toBe('kata_evaluation_rubric.json');
    });
  });

  describe('validation', () => {
    it('should throw error when KATA_INPUT_DATA_PATH is empty string', () => {
      process.env.KATA_INPUT_DATA_PATH = '';

      expect(() => new KataFileConfig()).toThrow('KATA_INPUT_DATA_PATH cannot be empty');
    });

    it('should throw error when KATA_INPUT_DATA_PATH is only whitespace', () => {
      process.env.KATA_INPUT_DATA_PATH = '   ';

      expect(() => new KataFileConfig()).toThrow('KATA_INPUT_DATA_PATH cannot be empty');
    });

    it('should throw error when KATA_DEFAULT_INSTRUCTION_FILE is empty string', () => {
      process.env.KATA_DEFAULT_INSTRUCTION_FILE = '';

      expect(() => new KataFileConfig()).toThrow(
        'KATA_DEFAULT_INSTRUCTION_FILE cannot be empty'
      );
    });

    it('should throw error when KATA_DEFAULT_INSTRUCTION_FILE is only whitespace', () => {
      process.env.KATA_DEFAULT_INSTRUCTION_FILE = '   ';

      expect(() => new KataFileConfig()).toThrow(
        'KATA_DEFAULT_INSTRUCTION_FILE cannot be empty'
      );
    });

    it('should throw error when KATA_DEFAULT_RUBRIC_FILE is empty string', () => {
      process.env.KATA_DEFAULT_RUBRIC_FILE = '';

      expect(() => new KataFileConfig()).toThrow('KATA_DEFAULT_RUBRIC_FILE cannot be empty');
    });

    it('should throw error when KATA_DEFAULT_RUBRIC_FILE is only whitespace', () => {
      process.env.KATA_DEFAULT_RUBRIC_FILE = '   ';

      expect(() => new KataFileConfig()).toThrow('KATA_DEFAULT_RUBRIC_FILE cannot be empty');
    });
  });

  describe('getDefaultInstructionPath', () => {
    it('should return full path to instruction file', () => {
      process.env.KATA_INPUT_DATA_PATH = './custom/path';
      process.env.KATA_DEFAULT_INSTRUCTION_FILE = 'my-kata.json';

      const config = new KataFileConfig();
      const fullPath = config.getDefaultInstructionPath();

      expect(fullPath).toBe(path.join('./custom/path', 'my-kata.json'));
    });

    it('should return full path using defaults', () => {
      delete process.env.KATA_INPUT_DATA_PATH;
      delete process.env.KATA_DEFAULT_INSTRUCTION_FILE;

      const config = new KataFileConfig();
      const fullPath = config.getDefaultInstructionPath();

      expect(fullPath).toBe(
        path.join(process.cwd(), 'src', 'inputData', 'kata-instructions.json')
      );
    });
  });

  describe('getDefaultRubricPath', () => {
    it('should return full path to rubric file', () => {
      process.env.KATA_INPUT_DATA_PATH = './custom/path';
      process.env.KATA_DEFAULT_RUBRIC_FILE = 'my-rubric.json';

      const config = new KataFileConfig();
      const fullPath = config.getDefaultRubricPath();

      expect(fullPath).toBe(path.join('./custom/path', 'my-rubric.json'));
    });

    it('should return full path using defaults', () => {
      delete process.env.KATA_INPUT_DATA_PATH;
      delete process.env.KATA_DEFAULT_RUBRIC_FILE;

      const config = new KataFileConfig();
      const fullPath = config.getDefaultRubricPath();

      expect(fullPath).toBe(
        path.join(process.cwd(), 'src', 'inputData', 'kata_evaluation_rubric.json')
      );
    });
  });

  describe('isValid', () => {
    it('should return true when configuration is valid', () => {
      const config = new KataFileConfig();

      expect(config.isValid()).toBe(true);
    });

    it('should return true with custom valid configuration', () => {
      process.env.KATA_INPUT_DATA_PATH = './custom/path';
      process.env.KATA_DEFAULT_INSTRUCTION_FILE = 'custom-kata.json';
      process.env.KATA_DEFAULT_RUBRIC_FILE = 'custom-rubric.json';

      const config = new KataFileConfig();

      expect(config.isValid()).toBe(true);
    });
  });
});
