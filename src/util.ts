import chalk from "chalk";
import shell from "shelljs";
import inquirer from "inquirer";
import { PLATFORM_TOOLS_DIR } from "./global";

// HELPER FUNCTIONS
// ------------------------------------------
//

/**
 * Throws an error to the user
 */
export function printError(message: string) {
  console.log(chalk.redBright(message));
  process.exit(1);
}

/**
 * Indented Documents
 *
 * Template literal function to generate unindented strings
 *
 * @example
 * indoc`
 *   test
 * `
 * // output: `test`
 */
export function indoc(document: TemplateStringsArray): string {
  return document[0]
    .split("\n")
    .map((item) => item.trim())
    .join("\n");
}

/**
 * Ask for input from the user
 */
export async function input(message: string): Promise<string> {
  const { response } = await inquirer.prompt([
    { type: "input", name: "response", message: message },
  ]);

  return response;
}

/**
 * Ask for input from the user
 */
export async function inputConfirmation(message: string): Promise<boolean> {
  const { confirmation } = await inquirer.prompt([
    { type: "confirm", name: "confirmation", message: message },
  ]);

  return confirmation;
}

/**
 * Ask for input from the user
 */
export async function inputChoice(
  message: string,
  choices: string[]
): Promise<string> {
  const { choice } = await inquirer.prompt([
    { type: "list", name: "choice", message: message, choices: choices },
  ]);

  return choice;
}

/**
 * Run ADB on the shell
 */
export function adb(...command: string[]) {
  const result = shell.exec(`./${PLATFORM_TOOLS_DIR}/adb ${command.join(" ")}`);
  console.log(result.stdout);
}

/**
 * Run Fastboot on the shell
 */
export function fastboot(...command: string[]) {
  const result = shell.exec(
    `./${PLATFORM_TOOLS_DIR}/fastboot ${command.join(" ")}`
  );
  console.log(result.stdout);
}
