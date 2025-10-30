import inquirer from 'inquirer';
import chalk from 'chalk';
import { KataInstructionFeature } from '../features/kata-instruction/KataInstructionFeature';
import { KataInstruction } from '../features/kata-instruction/domain/KataInstruction';
import { KataEvaluationRubric } from '../features/kata-instruction/domain/KataEvaluationRubric';

export class KataInstructionUI {
  private readonly kataFeature: KataInstructionFeature;

  constructor() {
    this.kataFeature = new KataInstructionFeature();
  }

  public async showKataInstructionSelection(): Promise<void> {
    console.log(chalk.blue.bold('\n=== Kata Instruction Files ===\n'));

    // List available kata files
    const listResult = await this.kataFeature.listAvailableKatas();

    if (!listResult.success) {
      console.log(chalk.red(`Error: ${listResult.error.message}`));
      return;
    }

    if (listResult.value.length === 0) {
      console.log(chalk.yellow('No JSON files found in inputData folder.'));
      return;
    }

    // Let user select a file
    const answer = await inquirer.prompt<{ kataFile: string }>([
      {
        type: 'list',
        name: 'kataFile',
        message: 'Select a kata instruction file to view:',
        choices: [...listResult.value, new inquirer.Separator(), 'Back to main menu'],
      },
    ]);

    if (answer.kataFile === 'Back to main menu') {
      return;
    }

    // Load and display the selected kata instruction file
    await this.displayKataFile(answer.kataFile);
  }

  public async showRubricSelection(): Promise<void> {
    console.log(chalk.blue.bold('\n=== Rubric Instruction Files ===\n'));

    // List available rubric files
    const listResult = await this.kataFeature.listAvailableKatas();

    if (!listResult.success) {
      console.log(chalk.red(`Error: ${listResult.error.message}`));
      return;
    }

    if (listResult.value.length === 0) {
      console.log(chalk.yellow('No JSON files found in inputData folder.'));
      return;
    }

    // Let user select a file
    const answer = await inquirer.prompt<{ rubricFile: string }>([
      {
        type: 'list',
        name: 'rubricFile',
        message: 'Select a rubric instruction file to view:',
        choices: [...listResult.value, new inquirer.Separator(), 'Back to main menu'],
      },
    ]);

    if (answer.rubricFile === 'Back to main menu') {
      return;
    }

    // Load and display the selected rubric file
    await this.displayRubricFile(answer.rubricFile);
  }

  private async displayKataFile(filename: string): Promise<void> {
    const kataResult = await this.kataFeature.loadKataInstruction(filename);

    if (kataResult.success) {
      this.renderKata(kataResult.value);
    } else {
      console.log(chalk.red(`\nError loading kata file: ${kataResult.error.message}\n`));
      return;
    }

    // Wait for user to press enter
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: chalk.gray('Press Enter to continue...'),
      },
    ]);
  }

  private async displayRubricFile(filename: string): Promise<void> {
    const rubricResult = await this.kataFeature.loadKataEvaluationRubric(filename);

    if (rubricResult.success) {
      this.renderRubric(rubricResult.value);
    } else {
      console.log(chalk.red(`\nError loading rubric file: ${rubricResult.error.message}\n`));
      return;
    }

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

  private renderRubric(rubric: KataEvaluationRubric): void {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.green.bold(`  ${rubric.rubric.title}`));
    console.log(chalk.white(`  Total Max Score: ${rubric.rubric.total_max_score}`));
    console.log('='.repeat(60) + '\n');

    // Display categories
    rubric.rubric.categories.forEach((category) => {
      console.log(chalk.cyan.bold(`\n▶ ${category.name} (Max Score: ${category.max_score})`));
      console.log(chalk.white('─'.repeat(60)));

      category.levels.forEach((level) => {
        console.log(chalk.magenta(`\n  Level ${level.level}: ${level.name}`));
        console.log(chalk.gray(`  Score Range: ${level.score_range.min}-${level.score_range.max}`));

        if (level.criteria && level.criteria.length > 0) {
          console.log(chalk.white('\n  Criteria:'));
          level.criteria.forEach((criterion) => {
            console.log(chalk.gray(`    • [${criterion.score_range.min}-${criterion.score_range.max}] ${criterion.description}`));
          });
        }
      });
    });

    // Display overall classification
    if (rubric.rubric.overall_classification && rubric.rubric.overall_classification.length > 0) {
      console.log(chalk.magenta.bold('\n\n▶ Overall Classification'));
      console.log(chalk.white('─'.repeat(60)));

      rubric.rubric.overall_classification.forEach((classification) => {
        console.log(chalk.cyan(`\n${classification.name}:`));
        console.log(chalk.gray(`  Score Range: ${classification.score_range.min}-${classification.score_range.max}`));
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}
