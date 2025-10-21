import inquirer from 'inquirer';
import chalk from 'chalk';
import { KataInstructionFeature } from '../features/kata-instruction/KataInstructionFeature';
import { KataInstruction } from '../features/kata-instruction/domain/KataInstruction';

export class KataInstructionUI {
  private readonly kataFeature: KataInstructionFeature;

  constructor() {
    this.kataFeature = new KataInstructionFeature();
  }

  public async showKataSelection(): Promise<void> {
    console.log(chalk.blue.bold('\n=== Kata Instructions ===\n'));

    // List available kata files
    const listResult = await this.kataFeature.listAvailableKatas();

    if (!listResult.success) {
      console.log(chalk.red(`Error: ${listResult.error.message}`));
      return;
    }

    if (listResult.value.length === 0) {
      console.log(chalk.yellow('No kata instruction files found in inputData folder.'));
      return;
    }

    // Let user select a kata
    const answer = await inquirer.prompt<{ kataFile: string }>([
      {
        type: 'list',
        name: 'kataFile',
        message: 'Select a kata to view:',
        choices: [...listResult.value, new inquirer.Separator(), 'Back to main menu'],
      },
    ]);

    if (answer.kataFile === 'Back to main menu') {
      return;
    }

    // Load and display the selected kata
    await this.displayKataInstructions(answer.kataFile);
  }

  private async displayKataInstructions(filename: string): Promise<void> {
    const loadResult = await this.kataFeature.loadKataInstruction(filename);

    if (!loadResult.success) {
      console.log(chalk.red(`\nError loading kata: ${loadResult.error.message}\n`));
      return;
    }

    const kata = loadResult.value;
    this.renderKata(kata);

    // Wait for user to press enter
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: chalk.gray('Press Enter to continue...'),
      },
    ]);
  }

  private renderKata(kata: KataInstruction): void {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.green.bold(`  ${kata.name}`));
    console.log('='.repeat(60) + '\n');

    // Display stages
    kata.stages.forEach((stage) => {
      console.log(chalk.cyan.bold(`\n▶ Stage ${stage.stageNumber}: ${stage.title}`));
      console.log(chalk.white('─'.repeat(60)));
      console.log(chalk.white('\nProblem:'));
      console.log(chalk.gray(stage.problem));

      if (stage.sampleOutput) {
        console.log(chalk.white('\nSample Output:'));
        console.log(chalk.yellow(stage.sampleOutput));
      }

      if (stage.requirements && stage.requirements.length > 0) {
        console.log(chalk.white('\nRequirements:'));
        stage.requirements.forEach((req) => {
          console.log(chalk.gray(`  • ${req}`));
        });
      }
    });

    // Display evaluation criteria
    if (kata.evaluationCriteria && kata.evaluationCriteria.length > 0) {
      console.log(chalk.magenta.bold('\n\n▶ Evaluation Criteria'));
      console.log(chalk.white('─'.repeat(60)));

      kata.evaluationCriteria.forEach((level) => {
        console.log(chalk.cyan(`\n${level.levelId}:`));
        console.log(chalk.gray(level.description));
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}
