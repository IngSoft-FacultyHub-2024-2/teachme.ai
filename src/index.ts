import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet';
import { KataInstructionUI } from './ui/KataInstructionUI';
import { KataFileConfig } from './services/KataFileConfig';
import { KataInstructionFeature } from './features/kata-instruction/KataInstructionFeature';
import { KataInstruction } from './features/kata-instruction/domain/KataInstruction';
import { KataEvaluationRubric } from './features/kata-instruction/domain/KataEvaluationRubric';

interface MenuAnswer {
  action: string;
}

class ConsoleApp {
  private running: boolean = true;
  private kataUI: KataInstructionUI;
  private readonly config: KataFileConfig;
  private readonly kataFeature: KataInstructionFeature;
  private preloadedKataInstruction?: KataInstruction;
  private preloadedRubric?: KataEvaluationRubric;

  constructor() {
    this.config = new KataFileConfig();
    this.kataFeature = new KataInstructionFeature(this.config);
    // KataUI will be initialized after preloading
    this.kataUI = new KataInstructionUI();
  }

  public async start(): Promise<void> {
    this.displayWelcome();
    await this.preloadKataFiles();

    while (this.running) {
      await this.showMainMenu();
    }

    this.displayGoodbye();
  }

  /**
   * Preloads default kata instruction and rubric files on startup
   */
  private async preloadKataFiles(): Promise<void> {
    console.log(chalk.cyan('\nInitializing kata files...'));

    // Preload kata instruction file
    const instructionSpinner = ora(`Loading ${this.config.defaultInstructionFile}...`).start();
    const instructionResult = await this.kataFeature.loadKataInstruction(
      this.config.defaultInstructionFile
    );

    if (instructionResult.success) {
      this.preloadedKataInstruction = instructionResult.value;
      instructionSpinner.succeed(
        chalk.green(`Loaded kata: ${instructionResult.value.name}`)
      );
    } else {
      instructionSpinner.warn(
        chalk.yellow(`Could not load ${this.config.defaultInstructionFile}: ${instructionResult.error.message}`)
      );
    }

    // Preload rubric file
    const rubricSpinner = ora(`Loading ${this.config.defaultRubricFile}...`).start();
    const rubricResult = await this.kataFeature.loadKataEvaluationRubric(
      this.config.defaultRubricFile
    );

    if (rubricResult.success) {
      this.preloadedRubric = rubricResult.value;
      rubricSpinner.succeed(
        chalk.green(`Loaded rubric: ${rubricResult.value.rubric.title}`)
      );
    } else {
      rubricSpinner.warn(
        chalk.yellow(`Could not load ${this.config.defaultRubricFile}: ${rubricResult.error.message}`)
      );
    }

    // Initialize KataUI with preloaded data
    this.kataUI = new KataInstructionUI(
      this.preloadedKataInstruction,
      this.preloadedRubric
    );

    console.log('');
  }

  private displayWelcome(): void {
    console.clear();
    const banner = figlet.textSync('TeachMe.AI', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    });

    console.log(chalk.cyan.bold(banner));
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.yellow.bold('               Your AI-Powered Kata Learning Companion'));
    console.log(chalk.gray('─'.repeat(80)));
    console.log('');
  }

  private displayGoodbye(): void {
    console.log(chalk.green('\nGoodbye!\n'));
  }

  private async showMainMenu(): Promise<void> {
    const answer = await inquirer.prompt<MenuAnswer>([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'View Kata Instruction', value: 'kata' },
          { name: 'View Evaluation Rubric', value: 'rubric' },
          { name: 'Start KataSolverService Conversation', value: 'conversation' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);

    await this.handleMenuChoice(answer.action);
  }

  private async handleMenuChoice(choice: string): Promise<void> {
    switch (choice) {
      case 'kata':
        await this.kataUI.showKataInstructionSelection();
        break;
      case 'rubric':
        await this.kataUI.showRubricSelection();
        break;
      case 'conversation': {
        const { KataSolverConversationUI } = await import('./ui/KataSolverConversationUI');
        const conversationUI = new KataSolverConversationUI(
          this.preloadedKataInstruction,
          this.preloadedRubric
        );
        await conversationUI.start();
        break;
      }
      case 'exit':
        this.running = false;
        break;
    }
  }
}

async function main(): Promise<void> {
  // Load environment variables: prefer project .env, fallback to .github/.env
  const projectRoot = path.resolve(__dirname, '..');
  const dotEnvPath = path.join(projectRoot, '.env');
  const githubEnvPath = path.join(projectRoot, '.github', '.env');

  if (fs.existsSync(dotEnvPath)) {
    dotenv.config({ path: dotEnvPath });
    console.log('Loaded environment from .env');
  } else if (fs.existsSync(githubEnvPath)) {
    dotenv.config({ path: githubEnvPath });
    console.log('Loaded environment from .github/.env');
  } else {
    // Also allow dotenv's default behaviour (look for .env in cwd)
    dotenv.config();
    console.log('No .env found in project root or .github; loaded default dotenv config if present');
  }

  const app = new ConsoleApp();
  await app.start();
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
