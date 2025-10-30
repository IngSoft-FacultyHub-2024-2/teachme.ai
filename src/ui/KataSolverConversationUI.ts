import inquirer from 'inquirer';
import chalk from 'chalk';
import { KataSolverFacade } from '../features/kata-solver/KataSolverFacade';
import { CodeExtractorFeature } from '../features/code-extractor/CodeExtractorFeature';

export class KataSolverConversationUI {
  private readonly facade: KataSolverFacade;
  private readonly codeExtractor: CodeExtractorFeature;

  constructor() {
    this.facade = new KataSolverFacade();
    this.codeExtractor = new CodeExtractorFeature();
  }

  /**
   * Starts a conversation loop with KataSolverFacade
   */
  public async start(): Promise<void> {
    console.log(chalk.blue.bold('\n=== KataSolver Conversation ==='));
    console.log(chalk.gray('Commands: /evaluate - Extract and evaluate code | /help - Show help | /exit - End conversation\n'));
    const { initialPrompt } = await inquirer.prompt([
      {
        type: 'input',
        name: 'initialPrompt',
        message: 'Enter your initial prompt:',
      },
    ]);
    const startResult = await this.facade.startConversation(initialPrompt);
    if (!startResult.success) {
      console.log(chalk.red('Error: ' + startResult.error?.message));
      return;
    }
    let conversationId = startResult.value.conversationId;
    let lastResponse = startResult.value.response;
    console.log(chalk.green('Assistant: ' + lastResponse));
    while (true) {
      const { userInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userInput',
          message: chalk.yellow('You:'),
        },
      ]);

      // Handle special commands
      if (userInput.trim() === '/exit') {
        console.log(chalk.blue('Conversation ended.'));
        break;
      }

      if (userInput.trim() === '/evaluate') {
        await this.handleEvaluateCommand(conversationId);
        continue;
      }

      if (userInput.trim() === '/help') {
        this.showHelp();
        continue;
      }

      // Continue normal conversation
      const responseResult = await this.facade.continueConversation(conversationId, userInput);
      if (!responseResult.success) {
        console.log(chalk.red('Error: ' + responseResult.error?.message));
        break;
      }
      console.log(chalk.green('Assistant: ' + responseResult.value));
    }
  }

  /**
   * Handles the /evaluate command - extracts code from conversation and sends for evaluation
   */
  private async handleEvaluateCommand(conversationId: string): Promise<void> {
    console.log(chalk.cyan('\n--- Code Extraction & Evaluation ---'));

    // Get conversation history
    const historyResult = this.facade.getConversationHistory(conversationId);
    if (!historyResult.success) {
      console.log(chalk.red('Error: Could not retrieve conversation history'));
      return;
    }

    // Concatenate all messages from the conversation
    const conversationText = historyResult.value.join('\n\n');

    if (!conversationText.trim()) {
      console.log(chalk.yellow('No conversation content to extract code from.'));
      return;
    }

    console.log(chalk.gray('Extracting code from conversation...'));

    // Extract code using CodeExtractor
    const extractionResult = await this.codeExtractor.extractCode(conversationText);

    if (!extractionResult.success) {
      console.log(chalk.red('Error extracting code: ' + extractionResult.error.message));
      return;
    }

    const extracted = extractionResult.value;

    if (!extracted.hasCode()) {
      console.log(chalk.yellow('No code found in the conversation.'));
      return;
    }

    // Display extracted code
    console.log(chalk.green('\n✓ Code extracted successfully!\n'));
    console.log(chalk.white('Extracted Code:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.cyan(extracted.getCleanCode()));
    console.log(chalk.gray('─'.repeat(60)));
    if (extracted.language) {
      console.log(chalk.white(`Detected Language: ${chalk.magenta(extracted.language)}`));
    }
    console.log('');

    // Ask user if they want to evaluate the code
    const { shouldEvaluate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldEvaluate',
        message: 'Would you like to send this code for evaluation?',
        default: true,
      },
    ]);

    if (!shouldEvaluate) {
      console.log(chalk.gray('Evaluation cancelled.\n'));
      return;
    }

    // Send extracted code to the conversation for evaluation
    const evaluationPrompt = `Please evaluate the following code:\n\n\`\`\`${extracted.language ?? ''}\n${extracted.getCleanCode()}\n\`\`\``;

    console.log(chalk.gray('Sending code for evaluation...'));

    const responseResult = await this.facade.continueConversation(
      conversationId,
      evaluationPrompt
    );

    if (!responseResult.success) {
      console.log(chalk.red('Error: ' + responseResult.error?.message));
      return;
    }

    console.log(chalk.green('\nAssistant: ' + responseResult.value));
    console.log('');
  }

  /**
   * Shows available commands
   */
  private showHelp(): void {
    console.log(chalk.blue.bold('\n=== Available Commands ==='));
    console.log(chalk.white('  /evaluate') + chalk.gray(' - Extract code from conversation and send for evaluation'));
    console.log(chalk.white('  /help    ') + chalk.gray(' - Show this help message'));
    console.log(chalk.white('  /exit    ') + chalk.gray(' - End the conversation'));
    console.log('');
  }
}
