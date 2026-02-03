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
import {
  HistoryEntry,
  HistoryEvaluation,
} from '../features/kata-solver/domain/HistoryEntry';

export class KataSolverConversationUI {
  private readonly facade: KataSolverFacade;
  private readonly codeExtractor: CodeExtractorFeature;
  private readonly kataEvaluator: KataEvaluatorFeature;
  private readonly rubricService: KataEvaluationRubricService;
  private readonly kataInstructionUI: KataInstructionUI;
  private readonly config: KataFileConfig;
  private evaluationOrdinal: number;
  private history: HistoryEntry[];

  constructor(preloadedKataInstruction?: KataInstruction, preloadedRubric?: KataEvaluationRubric) {
    this.facade = new KataSolverFacade();
    this.codeExtractor = new CodeExtractorFeature();
    this.kataEvaluator = new KataEvaluatorFeature();
    this.config = new KataFileConfig();
    this.rubricService = new KataEvaluationRubricService(this.config);
    this.kataInstructionUI = new KataInstructionUI(preloadedKataInstruction, preloadedRubric);
    this.evaluationOrdinal = 0;
    this.history = [];
  }

  /**
   * Starts a conversation loop with KataSolverFacade
   */
  public async start(): Promise<void> {
    console.log(chalk.blue.bold('\n=== KataSolverService Conversation ==='));
    console.log(chalk.gray('Commands: /kata | /rubric | /evaluate | /history | /new | /help | /exit\n'));

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

      // Handle /history command
      if (userInput.trim() === '/history') {
        await this.handleHistoryCommand();
        continue;
      }

      // Handle /new command
      if (userInput.trim() === '/new') {
        if (conversationId) {
          console.log(chalk.cyan('\n--- Starting New Conversation ---'));
          conversationId = undefined;
          this.evaluationOrdinal = 0;
          this.history = [];
          console.log(chalk.green('✓ New conversation started.'));
          console.log(chalk.gray('  Kata instructions and rubric preserved.\n'));
        } else {
          console.log(chalk.yellow('No active conversation to reset.\n'));
        }
        continue;
      }

      // Handle /evaluate command (requires active conversation)
      if (userInput.trim() === '/evaluate') {
        if (!conversationId) {
          console.log(
            chalk.yellow(
              'No active conversation. Start a conversation first before evaluating code.\n'
            )
          );
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
        this.history.push(new HistoryEntry(userInput, startResult.value.response));
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
        this.history.push(new HistoryEntry(userInput, responseResult.value));
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
      console.log(
        chalk.yellow(
          `Make sure ${this.config.defaultRubricFile} exists in ${this.config.inputDataPath}`
        )
      );
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

    // Update history with extracted code and evaluation
    const lastEntry = this.history[this.history.length - 1];
    if (lastEntry) {
      const historyEval = HistoryEvaluation.fromKataEvaluation(evaluation);
      this.history[this.history.length - 1] = lastEntry
        .withExtractedCode(extracted.getCleanCode())
        .withEvaluation(historyEval);
    }

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
   * Handles the /history command - displays conversation history with interactive mode
   */
  private async handleHistoryCommand(): Promise<void> {
    if (this.history.length === 0) {
      console.log(chalk.yellow('\nNo history available.\n'));
      return;
    }

    // Show instructions on first entry
    console.log(chalk.blue.bold('\n=== History Mode ==='));
    console.log(chalk.gray('  Enter a number to view full interaction details'));
    console.log(chalk.gray('  Enter /back or press Enter to return to conversation\n'));

    while (true) {
      // Display summary list
      console.log(chalk.blue.bold('=== Conversation History ===\n'));

      for (const entry of this.history) {
        const interactionNum = this.history.indexOf(entry) + 1;

        // Header with interaction number and timestamp
        console.log(
          chalk.cyan.bold(`--- Interaction #${interactionNum} ---`) +
            chalk.gray(` (${entry.timestamp.toLocaleString()})`)
        );

        // User prompt (truncated to 200 chars)
        const truncatedPrompt =
          entry.userPrompt.length > 200
            ? entry.userPrompt.substring(0, 200) + '...'
            : entry.userPrompt;
        console.log(chalk.yellow('User: ') + chalk.white(truncatedPrompt));

        // Assistant response (truncated to 500 chars)
        const truncatedResponse =
          entry.assistantResponse.length > 500
            ? entry.assistantResponse.substring(0, 500) + '...'
            : entry.assistantResponse;
        console.log(chalk.green('Assistant: ') + chalk.white(truncatedResponse));

        // Show indicators for code and evaluation
        const indicators: string[] = [];
        if (entry.hasExtractedCode()) {
          indicators.push(chalk.magenta('[Code]'));
        }
        if (entry.hasEvaluation()) {
          indicators.push(chalk.magenta(`[Eval #${entry.evaluation!.ordinal}]`));
        }
        if (indicators.length > 0) {
          console.log(indicators.join(' '));
        }

        console.log('');
      }

      console.log(chalk.gray(`Total: ${this.history.length} interaction(s)\n`));

      // Interactive prompt
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: chalk.blue('History >'),
        },
      ]);

      const trimmedInput = input.trim();

      // Exit history mode
      if (trimmedInput === '/back' || trimmedInput === '') {
        console.log(chalk.gray('Returning to conversation...\n'));
        return;
      }

      // Parse interaction number
      const interactionNum = parseInt(trimmedInput, 10);

      if (isNaN(interactionNum)) {
        console.log(chalk.red(`Invalid input: "${trimmedInput}". Enter a number or /back.\n`));
        continue;
      }

      if (interactionNum < 1 || interactionNum > this.history.length) {
        console.log(
          chalk.red(`Invalid interaction number. Enter a number between 1 and ${this.history.length}.\n`)
        );
        continue;
      }

      // Display full interaction
      const entry = this.history[interactionNum - 1];
      if (entry) {
        this.displayFullInteraction(entry, interactionNum);

        // Wait for user to press enter before showing list again
        await inquirer.prompt([
          {
            type: 'input',
            name: 'continue',
            message: chalk.gray('Press Enter to return to history list...'),
          },
        ]);
      }
    }
  }

  /**
   * Displays a single interaction in full detail
   */
  private displayFullInteraction(entry: HistoryEntry, interactionNum: number): void {
    console.log(chalk.blue.bold(`\n=== Interaction #${interactionNum} (Full) ===`));
    console.log(chalk.gray(`Timestamp: ${entry.timestamp.toLocaleString()}\n`));

    // Full user prompt
    console.log(chalk.yellow.bold('User Prompt:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(entry.userPrompt));
    console.log(chalk.gray('─'.repeat(60)));

    // Full assistant response
    console.log(chalk.green.bold('\nAssistant Response:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(entry.assistantResponse));
    console.log(chalk.gray('─'.repeat(60)));

    // Full extracted code if exists
    if (entry.hasExtractedCode() && entry.extractedCode) {
      console.log(chalk.magenta.bold('\nExtracted Code:'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.cyan(entry.extractedCode));
      console.log(chalk.gray('─'.repeat(60)));
    }

    // Full evaluation if exists
    if (entry.hasEvaluation() && entry.evaluation) {
      console.log(chalk.magenta.bold(`\nEvaluation #${entry.evaluation.ordinal}:`));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.white(entry.evaluation.responseString));
      console.log(chalk.gray('─'.repeat(60)));
    }

    console.log('');
  }

  /**
   * Shows available commands
   */
  private showHelp(): void {
    console.log(chalk.blue.bold('\n=== Available Commands ==='));
    console.log(
      chalk.white('  /evaluate') +
        chalk.gray(' - Extract code from conversation and send for evaluation')
    );
    console.log(chalk.white('  /kata    ') + chalk.gray(' - Display kata instructions'));
    console.log(chalk.white('  /rubric  ') + chalk.gray(' - Display evaluation rubric'));
    console.log(
      chalk.white('  /history ') + chalk.gray(' - Browse conversation history (interactive)')
    );
    console.log(
      chalk.white('  /new     ') +
        chalk.gray(' - Start a new conversation (preserves kata & rubric)')
    );
    console.log(chalk.white('  /help    ') + chalk.gray(' - Show this help message'));
    console.log(chalk.white('  /exit    ') + chalk.gray(' - End the conversation'));
    console.log('');
  }
}
