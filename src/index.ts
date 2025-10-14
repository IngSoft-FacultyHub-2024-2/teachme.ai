import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { KataInstructionUI } from './ui/KataInstructionUI';

interface MenuAnswer {
  action: string;
}

class ConsoleApp {
  private running: boolean = true;
  private readonly kataUI: KataInstructionUI;

  constructor() {
    this.kataUI = new KataInstructionUI();
  }

  public async start(): Promise<void> {
    this.displayWelcome();

    while (this.running) {
      await this.showMainMenu();
    }

    this.displayGoodbye();
  }

  private displayWelcome(): void {
    console.log(chalk.blue.bold('\n================================='));
    console.log(chalk.blue.bold('   Welcome to TeachMe.AI App'));
    console.log(chalk.blue.bold('=================================\n'));
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
          { name: 'Load Kata Instructions', value: 'kata' },
          { name: 'Start KataSolver Conversation', value: 'conversation' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);

    await this.handleMenuChoice(answer.action);
  }

  private async handleMenuChoice(choice: string): Promise<void> {
    switch (choice) {
      case 'kata':
        await this.kataUI.showKataSelection();
        break;
      case 'conversation': {
        const { KataSolverConversationUI } = await import('./ui/KataSolverConversationUI');
        const conversationUI = new KataSolverConversationUI();
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
