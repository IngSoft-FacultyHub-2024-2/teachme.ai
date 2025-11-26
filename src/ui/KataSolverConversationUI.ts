import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { KataSolverFacade } from '../features/kata-solver/KataSolverFacade';
import { CodeExtractorFeature } from '../features/code-extractor/CodeExtractorFeature';
import { KataEvaluatorFeature } from '../features/kata-evaluator/KataEvaluatorFeature';
import { KataEvaluationRubricService } from '../features/kata-instruction/services/KataEvaluationRubricService';
import { KataInstructionUI } from './KataInstructionUI';
import { KataFileConfig } from '../services/KataFileConfig';
import { KataInstruction } from '../features/kata-instruction/domain/KataInstruction';
import { KataEvaluationRubric } from '../features/kata-instruction/domain/KataEvaluationRubric';

export class KataSolverConversationUI {
  private readonly facade: KataSolverFacade;
  private readonly codeExtractor: CodeExtractorFeature;
  private readonly kataEvaluator: KataEvaluatorFeature;
  private readonly rubricService: KataEvaluationRubricService;
  private readonly kataInstructionUI: KataInstructionUI;
  private readonly config: KataFileConfig;
  private evaluationOrdinal: number;

  constructor(
    preloadedKataInstruction?: KataInstruction,
    preloadedRubric?: KataEvaluationRubric
  ) {
    this.facade = new KataSolverFacade();
    this.codeExtractor = new CodeExtractorFeature();
    this.kataEvaluator = new KataEvaluatorFeature();
    this.config = new KataFileConfig();
    this.rubricService = new KataEvaluationRubricService(this.config);
    this.kataInstructionUI = new KataInstructionUI(
      preloadedKataInstruction,
      preloadedRubric
    );
    this.evaluationOrdinal = 0;
  }

  /**
   * Starts a conversation loop with KataSolverFacade
   */
  public async start(): Promise<void> {
    console.log(chalk.blue.bold('\n=== KataSolver Conversation ==='));
    console.log(chalk.gray('Commands: /kata - Kata instructions | /rubric - Evaluation rubric | /evaluate - Evaluate code | /help - Help | /exit - Exit\n'));

    let conversationId: string | undefined;

    while (true) {
      const { userInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userInput',
          message: conversationId ? chalk.yellow('You:') : 'Enter your prompt or command:',
        },
      ]);

      // Handle /exit command
      if (userInput.trim() === '/exit') {
        console.log(chalk.blue('Conversation ended.'));
        break;
      }

      // Handle /help command
      if (userInput.trim() === '/help') {
        this.showHelp();
        continue;
      }

      // Handle /kata command
      if (userInput.trim() === '/kata') {
        await this.handleKataCommand();
        continue;
      }

      // Handle /rubric command
      if (userInput.trim() === '/rubric') {
        await this.handleRubricCommand();
        continue;
      }

      // Handle /evaluate command (requires active conversation)
      if (userInput.trim() === '/evaluate') {
        if (!conversationId) {
          console.log(chalk.yellow('No active conversation. Start a conversation first before evaluating code.\n'));
          continue;
        }
        await this.handleEvaluateCommand(conversationId);
        continue;
      }

      // Check for invalid commands (starts with / but not a valid command)
      if (userInput.trim().startsWith('/')) {
        console.log(chalk.red(`\nUnknown command: ${userInput.trim()}`));
        console.log(chalk.yellow('Type /help to see available commands.\n'));
        continue;
      }

      // Start or continue conversation
      if (!conversationId) {
        // Starting new conversation
        const spinner = ora('Thinking...').start();
        const startResult = await this.facade.startConversation(userInput);
        spinner.stop();

        if (!startResult.success) {
          console.log(chalk.red('Error: ' + startResult.error?.message));
          return;
        }
        conversationId = startResult.value.conversationId;
        console.log(chalk.green('Assistant: ' + startResult.value.response));
      } else {
        // Continue existing conversation
        const spinner = ora('Thinking...').start();
        const responseResult = await this.facade.continueConversation(conversationId, userInput);
        spinner.stop();

        if (!responseResult.success) {
          console.log(chalk.red('Error: ' + responseResult.error?.message));
          break;
        }
        console.log(chalk.green('Assistant: ' + responseResult.value));
      }
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

    // Use only the last message from the conversation
    const messages = historyResult.value;
    if (messages.length === 0) {
      console.log(chalk.yellow('No messages in the conversation.'));
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.trim()) {
      console.log(chalk.yellow('Last message is empty.'));
      return;
    }

    const conversationText: string = lastMessage;

    const spinner = ora('Extracting code from last message...').start();

    // Extract code using CodeExtractor
    const extractionResult = await this.codeExtractor.extractCode(conversationText);
    spinner.stop();

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

    // Load evaluation rubric
    let evaluationSpinner = ora('Loading evaluation rubric...').start();
    const rubricResult = await this.rubricService.loadRubric(this.config.defaultRubricFile);

    if (!rubricResult.success) {
      evaluationSpinner.fail('Error loading rubric');
      console.log(chalk.red('Error: ' + rubricResult.error.message));
      console.log(chalk.yellow(`Make sure ${this.config.defaultRubricFile} exists in ${this.config.inputDataPath}`));
      return;
    }

    evaluationSpinner.succeed('Rubric loaded');

    // Increment ordinal for this evaluation
    this.evaluationOrdinal++;

    evaluationSpinner = ora(`Evaluating code (attempt #${this.evaluationOrdinal})...`).start();

    // Get kata instruction for context-aware evaluation
    const kataInstruction = this.kataInstructionUI.getPreloadedKataInstruction();

    // Evaluate using KataEvaluatorFeature
    const evaluationResult = await this.kataEvaluator.evaluate(
      extracted,
      rubricResult.value,
      this.evaluationOrdinal,
      kataInstruction
    );

    if (!evaluationResult.success) {
      evaluationSpinner.fail('Evaluation failed');
      console.log(chalk.red('Error: ' + evaluationResult.error.message));
      return;
    }

    evaluationSpinner.succeed('Evaluation completed');

    const evaluation = evaluationResult.value;

    // Display evaluation results
    console.log(chalk.green('\n✓ Evaluation completed!\n'));
    console.log(chalk.white.bold('=== Evaluation Results ==='));
    console.log(chalk.white(`Evaluation #${evaluation.ordinal}`));
    console.log(chalk.white(`Timestamp: ${evaluation.timestamp.toLocaleString()}`));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.cyan(evaluation.responseString));
    console.log(chalk.gray('─'.repeat(60)));
    console.log('');
  }

  /**
   * Handles the /kata command - loads and displays kata instructions
   */
  private async handleKataCommand(): Promise<void> {
    await this.kataInstructionUI.showKataInstructionSelection();
  }

  /**
   * Handles the /rubric command - loads and displays evaluation rubric
   */
  private async handleRubricCommand(): Promise<void> {
    await this.kataInstructionUI.showRubricSelection();
  }

  /**
   * Shows available commands
   */
  private showHelp(): void {
    console.log(chalk.blue.bold('\n=== Available Commands ==='));
    console.log(chalk.white('  /evaluate') + chalk.gray(' - Extract code from conversation and send for evaluation'));
    console.log(chalk.white('  /kata    ') + chalk.gray(' - Display kata instructions'));
    console.log(chalk.white('  /rubric  ') + chalk.gray(' - Display evaluation rubric'));
    console.log(chalk.white('  /help    ') + chalk.gray(' - Show this help message'));
    console.log(chalk.white('  /exit    ') + chalk.gray(' - End the conversation'));
    console.log('');
  }
}
