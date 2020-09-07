import extract from "extract-zip";
import glob from "glob";
import chalk from "chalk";
import open from "open";
import {
  printError,
  inputConfirmation,
  adb,
  fastboot,
  input,
  indoc,
} from "./util";
import {
  spinner,
  supportedDeviceTypes,
  unsupportedDeviceString,
  prompts,
} from "./global";

//
// ------------------------------------------------
//

export default async function (deviceType: string) {
  switch (deviceType) {
    case supportedDeviceTypes.GOOGLE_PIXEL:
      await GooglePixel();
      break;
    default:
      console.log(unsupportedDeviceString);
  }
}

async function GooglePixel() {
  if (!(await inputConfirmation("Please connect your phone."))) {
    printError("Ensure your phone is connected first before proceeding.");
  }

  if (!(await inputConfirmation("Do you have Developer options enabled"))) {
    console.log(prompts.enableDeveloperOptions);
  }

  console.log("\nStarting ADB server...\n");
  adb("devices");
  console.log(prompts.adbAlwaysAllow);

  console.log(prompts.latestFactoryImage);
  open("https://developers.google.com/android/images");

  console.log(prompts.tipDragFolderIntoTerminal);
  const imageDir = await input("Path to extracted image folder");

  spinner.start("Processing...");

  await extract(glob.sync(`${imageDir}/image-*.zip`)[0], {
    dir: imageDir,
  });

  spinner.stopAndPersist();

  adb("push", `${imageDir}/boot.img`, "/sdcard/");
  console.log("\nThe image file has been pushed to your Android device.");
  console.log(prompts.patchBootImageFileInstructions);

  await inputConfirmation("Done");

  adb("pull", "/sdcard/Download/magisk_patched.img", imageDir);

  console.log("\nUpdate process starting...");

  spinner.start(chalk.greenBright("Updating your phone..."));

  adb("reboot", "bootloader");

  fastboot("flash", "bootloader", glob.sync(`${imageDir}/bootloader-*.img`)[0]);
  fastboot("reboot", "bootloader");
  fastboot("flash", "radio", glob.sync(`${imageDir}/radio-*.img`)[0]);
  fastboot("reboot", "bootloader");
  fastboot("--skip-reboot", "update", glob.sync(`${imageDir}/image-*.zip`)[0]);
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
}
