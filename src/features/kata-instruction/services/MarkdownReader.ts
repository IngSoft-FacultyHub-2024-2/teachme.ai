import * as fs from 'fs/promises';
import * as path from 'path';
import { Result, success, failure } from '../../../shared/types/Result';

export class MarkdownReader {
  public async readFile(filePath: string): Promise<Result<string>> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return success(content);
    } catch (error) {
      return failure(error as Error);
    }
  }

  public async listMarkdownFiles(
    directoryPath: string
  ): Promise<Result<string[]>> {
    try {
      const files = await fs.readdir(directoryPath);
      const markdownFiles = files.filter((file) => path.extname(file) === '.md');
      return success(markdownFiles);
    } catch (error) {
      return failure(error as Error);
    }
  }
}
