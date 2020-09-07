import chalk from "chalk";
import got from "got";
import fs from "fs";
import glob from "glob";
import extract from "extract-zip";

import {
  supportedDeviceTypes,
  unsupportedDeviceString,
  prompts,
  MAGISK_MANAGER_APK_PATH,
  spinner,
} from "./global";
import { inputConfirmation, adb, fastboot, input, printError } from "./util";

//
// ------------------------------------------------
//

export default async function (deviceType: string) {
  switch (deviceType) {
    case supportedDeviceTypes.GOOGLE_PIXEL:
      await new GooglePixel().start();
      break;
    default:
      console.log(unsupportedDeviceString);
  }
}

class Root {
  imageDir: string;

  async start() {
    await this.introduction();
    await this.prerequisites();
    await this.downloadMagisk();
    await this.promptPlugInPhone();
    await this.startADBServer();
    await this.unlockBootloader();
    await this.getLatestFactoryImage();
    await this.installMagisk();
    await this.patchBootImageWithMagisk();
    await this.flash();
    await this.end();
  }

  async introduction() {
    console.log(
      chalk.greenBright(
        "\nThis app will guide you through the rooting process."
      )
    );
  }
  async prerequisites() {
    if (!(await inputConfirmation("Do you have developer options enabled"))) {
      console.log(prompts.enableDeveloperOptions);
      inputConfirmation("Done");
    }

    if (!(await inputConfirmation("Do you have USB debugging enabled"))) {
      console.log(prompts.enableUSBDebugging);
      inputConfirmation("Done");
    }

    if (!(await inputConfirmation("Do you have OEM unlocking enabled"))) {
      console.log(prompts.enableOEMUnlocking);
      inputConfirmation("Done");
    }
  }
  async downloadMagisk() {
    console.log(chalk.bold("Fetching the latest version of Magisk..."));
    got
      .stream("https://magiskmanager.com/downloading-magisk-manager")
      .pipe(fs.createWriteStream(MAGISK_MANAGER_APK_PATH));
  }
  async installMagisk() {
    spinner.start("Installing Magisk Manager onto your device...");
    adb("install", MAGISK_MANAGER_APK_PATH);
    spinner.stopAndPersist();
  }
  async promptPlugInPhone() {
    await inputConfirmation("Please plug in your phone.");
  }
  async startADBServer() {
    console.log("\nStarting ADB server...");
    adb("devices");
    console.log(prompts.adbAlwaysAllow);
    console.log(
      "\nPlease make sure your device appears in the list of devices attached"
    );
  }
  async unlockBootloader() {
    if (!(await inputConfirmation("Is your bootloader unlocked"))) {
      console.log("Unlocking your bootloader now");
      console.log(chalk.redBright("BEWARE: ALL DATA WILL BE ERASED"));
      if (!(await inputConfirmation("Proceed"))) {
        printError("Aborted bootloader unlock");
      }
      adb("reboot", "bootloader");
      fastboot("flashing", "unlock");
      fastboot("reboot");
    }
  }
  async getLatestFactoryImage() {
    console.log(prompts.latestFactoryImage);
    open("https://developers.google.com/android/images");

    console.log(prompts.tipDragFolderIntoTerminal);
    this.imageDir = await input("Path to extracted image folder");
    spinner.start("Processing...");
    await extract(glob.sync(`${this.imageDir}/image-*.zip`)[0], {
      dir: this.imageDir,
    });
    spinner.stopAndPersist();
  }
  async patchBootImageWithMagisk() {
    adb("push", `${this.imageDir}/boot.img`, "/sdcard/");
    console.log("\nThe image file has been pushed to your Android device.");
    console.log(prompts.patchBootImageFileInstructions);
    await inputConfirmation("Done");
    adb("pull", "/sdcard/Download/magisk_patched.img", this.imageDir);
  }
  async flash() {
    spinner.start(chalk.greenBright("Rooting your phone..."));
    adb("reboot", "bootloader");
    fastboot(
      "flash",
      "bootloader",
      glob.sync(`${this.imageDir}/bootloader-*.img`)[0]
    );
    fastboot("reboot", "bootloader");
    fastboot("flash", "radio", glob.sync(`${this.imageDir}/radio-*.img`)[0]);
    fastboot("reboot", "bootloader");
    fastboot(
      "--skip-reboot",
      "update",
      glob.sync(`${this.imageDir}/image-*.zip`)[0]
    );
    fastboot("reboot", "bootloader");
    fastboot("flash", "boot", `${this.imageDir}/magisk_patched.img`);
    fastboot("reboot");
    spinner.stopAndPersist();
  }
  async end() {
    console.log(
      chalk.bold(
        chalk.greenBright("Your phone has been rooted successfully! 🥳")
      )
    );
  }
}

class GooglePixel extends Root {}

// async function GooglePixel() {
//   console.log(
//     chalk.greenBright("\nThis app will guide you through the rooting process.")
//   );

//   if (!(await inputConfirmation("Do you have developer options enabled"))) {
//     console.log(prompts.enableDeveloperOptions);
//     inputConfirmation("Done");
//   }

//   if (!(await inputConfirmation("Do you have USB debugging enabled"))) {
//     console.log(prompts.enableUSBDebugging);
//     inputConfirmation("Done");
//   }

//   if (!(await inputConfirmation("Do you have OEM unlocking enabled"))) {
//     console.log(prompts.enableOEMUnlocking);
//     inputConfirmation("Done");
//   }

//   console.log(chalk.bold("Fetching the latest version of Magisk..."));
//   got
//     .stream("https://magiskmanager.com/downloading-magisk-manager")
//     .pipe(fs.createWriteStream(MAGISK_MANAGER_APK_PATH));

//   await inputConfirmation("Please plug in your phone.");

//   console.log("\nStarting ADB server...");
//   adb("devices");
//   console.log(prompts.adbAlwaysAllow);
//   console.log(
//     "\nPlease make sure your device appears in the list of devices attached"
//   );

//   if (!(await inputConfirmation("Is your bootloader unlocked"))) {
//     console.log("Unlocking your bootloader now");
//     console.log(chalk.redBright("BEWARE: ALL DATA WILL BE ERASED"));
//     if (!(await inputConfirmation("Proceed"))) {
//       printError("Aborted bootloader unlock");
//     }
//     adb("reboot", "bootloader");
//     fastboot("flashing", "unlock");
//     fastboot("reboot");
//   }

//   console.log(prompts.latestFactoryImage);
//   open("https://developers.google.com/android/images");

//   console.log(prompts.tipDragFolderIntoTerminal);
//   const imageDir = await input("Path to extracted image folder");
//   spinner.start("Processing...");
//   await extract(glob.sync(`${imageDir}/image-*.zip`)[0], {
//     dir: imageDir,
//   });
//   spinner.stopAndPersist();

//   spinner.start("Installing Magisk Manager onto your device...");
//   adb("install", MAGISK_MANAGER_APK_PATH);
//   spinner.stopAndPersist();

//   adb("push", `${imageDir}/boot.img`, "/sdcard/");
//   console.log("\nThe image file has been pushed to your Android device.");
//   console.log(prompts.patchBootImageFileInstructions);
//   await inputConfirmation("Done");
//   adb("pull", "/sdcard/Download/magisk_patched.img", imageDir);

//   spinner.start(chalk.greenBright("Rooting your phone..."));
//   adb("reboot", "bootloader");
//   fastboot("flash", "bootloader", glob.sync(`${imageDir}/bootloader-*.img`)[0]);
//   fastboot("reboot", "bootloader");
//   fastboot("flash", "radio", glob.sync(`${imageDir}/radio-*.img`)[0]);
//   fastboot("reboot", "bootloader");
//   fastboot("--skip-reboot", "update", glob.sync(`${imageDir}/image-*.zip`)[0]);
//   fastboot("reboot", "bootloader");
//   fastboot("flash", "boot", `${imageDir}/magisk_patched.img`);
//   fastboot("reboot");
//   spinner.stopAndPersist();

//   console.log(
//     chalk.bold(chalk.greenBright("Your phone has been rooted successfully! 🥳"))
//   );
// }
