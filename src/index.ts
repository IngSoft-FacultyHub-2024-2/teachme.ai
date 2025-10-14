import inquirer from 'inquirer';
import chalk from 'chalk';

interface MenuAnswer {
  action: string;
}

class ConsoleApp {
  private running: boolean = true;

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
        choices: [{ name: 'Exit', value: 'exit' }],
      },
    ]);

    if (answer.action === 'exit') {
      this.running = false;
    }
  }
}

async function main(): Promise<void> {
  const app = new ConsoleApp();
  await app.start();
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
