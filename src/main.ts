import yargs from "yargs";
import fs from "fs";
import shell from "shelljs";
import ora from "ora";
import chalk from "chalk";
import inquirer from "inquirer";
import got from "got";
import stream from "stream";
import extract from "extract-zip";
import open from "open";
import glob from "glob";

const PLATFORM_TOOLS_DIR = "platform-tools";
const spinner = ora();

const argv = yargs
  .usage("Usage: $0 <command> [options]")
  .command("update", "Update your phone")
  .epilog("copyright 2020").argv;

console.log(
  chalk.bold(`
  SYMBIT
  ---
  A root manager for Android devices which allows you to update
  existing rooted devices, tweak magisk and run other commands which improve the
  Android root experience and adds onto Magisk. 🚀
  
  - raphtlw
  `)
);

function printError(message: string) {
  console.log(chalk.redBright(message));
  process.exit(1);
}

// Download platform tools
function downloadPlatformTools(platform: string) {
  spinner.start(chalk.greenBright("Platform tools not found. Installing..."));
  stream.pipeline(
    got.stream(
      `https://dl.google.com/android/repository/platform-tools-latest-${platform}.zip`
    ),
    fs.createWriteStream(`${PLATFORM_TOOLS_DIR}.zip`),
    (err) => {
      if (err) throw err;
      extract(`${PLATFORM_TOOLS_DIR}.zip`, { dir: process.cwd() }).then(() => {
        fs.unlink(`${PLATFORM_TOOLS_DIR}.zip`, (err) => {
          if (err) throw err;
          shell.chmod("+x", `${PLATFORM_TOOLS_DIR}/adb`);
          shell.chmod("+x", `${PLATFORM_TOOLS_DIR}/fastboot`);
          spinner.stopAndPersist();
        });
      });
    }
  );
}

if (!fs.existsSync(PLATFORM_TOOLS_DIR)) {
  if (process.platform === "linux") {
    downloadPlatformTools("linux");
  } else if (process.platform === "win32") {
    downloadPlatformTools("windows");
  } else if (process.platform === "darwin") {
    downloadPlatformTools("darwin");
  } else {
    printError("Android platform tools not found for your device.");
  }
}

async function input(message: string): Promise<string> {
  const { response } = await inquirer.prompt([
    { type: "input", name: "response", message: message },
  ]);

  return response;
}

async function inputConfirmation(message: string): Promise<boolean> {
  const { confirmation } = await inquirer.prompt([
    { type: "confirm", name: "confirmation", message: message },
  ]);

  return confirmation;
}

async function inputChoice(
  message: string,
  choices: string[]
): Promise<string> {
  const { choice } = await inquirer.prompt([
    { type: "list", name: "choice", message: message, choices: choices },
  ]);

  return choice;
}

function adb(...command: string[]) {
  const result = shell.exec(`./${PLATFORM_TOOLS_DIR}/adb ${command.join(" ")}`);
  console.log(result.stdout);
}

function fastboot(...command: string[]) {
  const result = shell.exec(
    `./${PLATFORM_TOOLS_DIR}/fastboot ${command.join(" ")}`
  );
  console.log(result.stdout);
}

// Main functions depending on command line options
async function _update() {
  if (!(await inputConfirmation("Please connect your phone."))) {
    printError("Ensure your phone is connected first before proceeding.");
  }

  const deviceType = await inputChoice("What type of device do you have?", [
    "Google Pixel",
  ]);

  switch (deviceType) {
    case "Google Pixel":
      if (!(await inputConfirmation("Do you have Developer options enabled"))) {
        console.log(
          `
Instructions for enabling Developer Options
---

1. Go to settings > about phone
2. Tap "build number" 7 times
        `
        );
      }

      console.log("\nStarting ADB server...\n");
      adb("devices");
      console.log(
        `
Please check the 'always allow' option for ADB
if you see a popup asking you to allow this PC to connect with ADB.
        `
      );

      console.log(
        `
Please download the latest factory image for your Google Pixel
and unzip the zip file from this website: https://developers.google.com/android/images
        `
      );
      open("https://developers.google.com/android/images");

      console.log("TIP: You can drag and drop the folder into the terminal");
      const imageDir = await input("Path to extracted image folder");

      spinner.start("Processing...");

      await extract(glob.sync(`${imageDir}/image-*.zip`)[0], {
        dir: imageDir,
      });

      spinner.stopAndPersist();

      adb("push", `${imageDir}/boot.img`, "/sdcard/");
      console.log("\nThe image file has been pushed to your Android device.");
      console.log(`
Now you'll need to patch the image file using the Magisk Manager app
on your Android device.

1. Open Magisk
2. Tap 'install'
3. Tap 'install' again
4. Tap 'Select and Patch a File'
5. Go to the root of your Pixel's file manager
   and select the boot.img file
NOTE: After patching the boot.img, DO NOT REBOOT.
      `);

      await inputConfirmation("Done");

      adb("pull", "/sdcard/Download/magisk_patched.img", imageDir);

      console.log(`
Update process starting...
      `);

      spinner.start(chalk.greenBright("Updating your phone..."));

      adb("reboot", "bootloader");

      fastboot(
        "flash",
        "bootloader",
        await glob.sync(`${imageDir}/bootloader-*.img`)[0]
      );
      fastboot("reboot", "bootloader");
      fastboot("flash", "radio", glob.sync(`${imageDir}/radio-*.img`)[0]);
      fastboot("reboot", "bootloader");
      fastboot(
        "--skip-reboot",
        "update",
        glob.sync(`${imageDir}/image-*.zip`)[0]
      );
      fastboot("reboot", "bootloader");
      fastboot("flash", "boot", `${imageDir}/magisk_patched.img`);

      spinner.stopAndPersist();

      console.log(
        chalk.bold(
          chalk.greenBright(
            "\nYour phone has been updated to the latest version of Android! 🥳"
          )
        )
      );

      console.log("Now you may press the power button to start your phone.");

      break;
    default:
      printError("Unfortunately your device has not been supported yet.");
  }
}

switch (argv._[0]) {
  case "update":
    _update();
    break;
}
