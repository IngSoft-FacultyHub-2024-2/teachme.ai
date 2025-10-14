import { MarkdownReader } from '../../../../src/features/kata-instruction/services/MarkdownReader';
import * as fs from 'fs';
import * as path from 'path';

describe('MarkdownReader', () => {
  const testFilePath = path.join(__dirname, 'test.md');
  const testContent = '# Test Markdown\n\nThis is a test.';

  beforeEach(() => {
    // Create a test file
    fs.writeFileSync(testFilePath, testContent, 'utf-8');
  });

  afterEach(() => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe('readFile', () => {
    it('should successfully read an existing markdown file', async () => {
      const reader = new MarkdownReader();
      const result = await reader.readFile(testFilePath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(testContent);
      }
    });

    it('should return failure when file does not exist', async () => {
      const reader = new MarkdownReader();
      const nonExistentPath = path.join(__dirname, 'nonexistent.md');
      const result = await reader.readFile(nonExistentPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('ENOENT');
      }
    });

    it('should handle empty files', async () => {
      const emptyFilePath = path.join(__dirname, 'empty.md');
      fs.writeFileSync(emptyFilePath, '', 'utf-8');

      const reader = new MarkdownReader();
      const result = await reader.readFile(emptyFilePath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('');
      }

      fs.unlinkSync(emptyFilePath);
    });
  });

  describe('listMarkdownFiles', () => {
    const testDir = path.join(__dirname, 'test-katas');

    beforeEach(() => {
      // Create test directory with some markdown files
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      fs.writeFileSync(path.join(testDir, 'kata1.md'), '# Kata 1', 'utf-8');
      fs.writeFileSync(path.join(testDir, 'kata2.md'), '# Kata 2', 'utf-8');
      fs.writeFileSync(path.join(testDir, 'readme.txt'), 'Not a markdown', 'utf-8');
    });

    afterEach(() => {
      // Clean up test directory
      if (fs.existsSync(testDir)) {
        const files = fs.readdirSync(testDir);
        files.forEach((file) => {
          fs.unlinkSync(path.join(testDir, file));
        });
        fs.rmdirSync(testDir);
      }
    });

    it('should list all markdown files in a directory', async () => {
      const reader = new MarkdownReader();
      const result = await reader.listMarkdownFiles(testDir);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toHaveLength(2);
        expect(result.value).toContain('kata1.md');
        expect(result.value).toContain('kata2.md');
        expect(result.value).not.toContain('readme.txt');
      }
    });

    it('should return failure when directory does not exist', async () => {
      const reader = new MarkdownReader();
      const nonExistentDir = path.join(__dirname, 'nonexistent-dir');
      const result = await reader.listMarkdownFiles(nonExistentDir);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toBeDefined();
      }
    });

    it('should return empty array for directory with no markdown files', async () => {
      const emptyDir = path.join(__dirname, 'empty-dir');
      fs.mkdirSync(emptyDir, { recursive: true });

      const reader = new MarkdownReader();
      const result = await reader.listMarkdownFiles(emptyDir);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toHaveLength(0);
      }

      fs.rmdirSync(emptyDir);
    });
  });
});
