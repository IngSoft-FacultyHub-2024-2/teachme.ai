import * as path from 'path';
import { MarkdownReader } from './services/MarkdownReader';
import { KataParser } from './services/KataParser';
import { Result, failure } from '../../shared/types/Result';
import { KataInstruction } from './domain/KataInstruction';

export class KataInstructionFeature {
  private readonly inputDataPath: string;
  private readonly markdownReader: MarkdownReader;
  private readonly kataParser: KataParser;

  constructor(inputDataPath?: string) {
    this.inputDataPath = inputDataPath ?? path.join(process.cwd(), 'src', 'inputData');
    this.markdownReader = new MarkdownReader();
    this.kataParser = new KataParser();
  }

  public async listAvailableKatas(): Promise<Result<string[]>> {
    const result = await this.markdownReader.listMarkdownFiles(this.inputDataPath);

    if (!result.success) {
      return result;
    }

    // Filter only files containing "KataInstructions" in the name
    const kataFiles = result.value.filter((file) =>
      file.includes('KataInstructions')
    );

    return { success: true, value: kataFiles };
  }

  public async loadKataInstruction(
    filename: string
  ): Promise<Result<KataInstruction>> {
    const filePath = path.join(this.inputDataPath, filename);

    // Read the markdown file
    const readResult = await this.markdownReader.readFile(filePath);
    if (!readResult.success) {
      return failure(new Error(`Failed to read file: ${readResult.error.message}`));
    }

    // Parse the markdown content
    const parseResult = this.kataParser.parse(readResult.value);
    if (!parseResult.success) {
      return failure(
        new Error(`Failed to parse kata: ${parseResult.error.message}`)
      );
    }

    return parseResult;
  }
}
