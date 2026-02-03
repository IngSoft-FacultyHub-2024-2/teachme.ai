import inquirer from 'inquirer';
import chalk from 'chalk';
import { KataInstruction } from '../features/kata-instruction/domain/KataInstruction';
import { KataEvaluationRubric } from '../features/kata-instruction/domain/KataEvaluationRubric';

export class KataInstructionUI {
  private readonly preloadedKataInstruction?: KataInstruction;
  private readonly preloadedRubric?: KataEvaluationRubric;

  public constructor(preloadedKataInstruction?: KataInstruction, preloadedRubric?: KataEvaluationRubric) {
    this.preloadedKataInstruction = preloadedKataInstruction;
    this.preloadedRubric = preloadedRubric;
  }

  /**
   * Gets the preloaded kata instruction if available
   */
  public getPreloadedKataInstruction(): KataInstruction | undefined {
    return this.preloadedKataInstruction;
  }

  /**
   * Gets the preloaded evaluation rubric if available
   */
  public getPreloadedRubric(): KataEvaluationRubric | undefined {
    return this.preloadedRubric;
  }

  public async showKataInstructionSelection(): Promise<void> {
    console.log(chalk.blue.bold('\n=== Kata Instruction ===\n'));

    if (this.preloadedKataInstruction) {
      this.renderKata(this.preloadedKataInstruction);
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: chalk.gray('Press Enter to continue...'),
        },
      ]);
    } else {
      console.log(chalk.yellow('No kata instruction preloaded. Check your configuration.\n'));
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: chalk.gray('Press Enter to continue...'),
        },
      ]);
    }
  }

  public async showRubricSelection(): Promise<void> {
    console.log(chalk.blue.bold('\n=== Evaluation Rubric ===\n'));

    if (this.preloadedRubric) {
      this.renderRubric(this.preloadedRubric);
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: chalk.gray('Press Enter to continue...'),
        },
      ]);
    } else {
      console.log(chalk.yellow('No evaluation rubric preloaded. Check your configuration.\n'));
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: chalk.gray('Press Enter to continue...'),
        },
      ]);
    }
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
            console.log(
              chalk.gray(
                `    • [${criterion.score_range.min}-${criterion.score_range.max}] ${criterion.description}`
              )
            );
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
        console.log(
          chalk.gray(
            `  Score Range: ${classification.score_range.min}-${classification.score_range.max}`
          )
        );
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}
