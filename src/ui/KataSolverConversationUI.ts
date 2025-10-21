import inquirer from 'inquirer';
import chalk from 'chalk';
import { KataSolverFacade } from '../features/kata-solver/KataSolverFacade';

export class KataSolverConversationUI {
  private readonly facade: KataSolverFacade;

  constructor() {
    this.facade = new KataSolverFacade();
  }

  /**
   * Starts a conversation loop with KataSolverFacade
   */
  public async start(): Promise<void> {
    console.log(chalk.blue.bold('\n=== KataSolver Conversation ==='));
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
      if (userInput.trim() === '/exit') {
        console.log(chalk.blue('Conversation ended.'));
        break;
      }
      const responseResult = await this.facade.continueConversation(conversationId, userInput);
      if (!responseResult.success) {
        console.log(chalk.red('Error: ' + responseResult.error?.message));
        break;
      }
      console.log(chalk.green('Assistant: ' + responseResult.value));
    }
  }
}
