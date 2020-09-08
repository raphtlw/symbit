import chalk from "chalk";
import got from "got";
import fs from "fs";
import glob from "glob";
import extract from "extract-zip";
import shell from "shelljs";
import path from "path";

import {
  SUPPORTED_DEVICE_TYPES,
  MAGISK_MANAGER_APK_PATH,
  spinner,
  STRINGS,
  inputConfirmation,
  adb,
  printError,
  fastboot,
  input,
  print,
  indoc,
  DIR,
} from "./global";

//
// ------------------------------------------------
//

export default async function (deviceType: string) {
  switch (deviceType) {
    case SUPPORTED_DEVICE_TYPES.GOOGLE_PIXEL:
      await new GooglePixel().start();
      break;
    case SUPPORTED_DEVICE_TYPES.ONEPLUS:
      await new OnePlus().start();
      break;
    default:
      console.log(STRINGS.unsupported_device);
  }
}

class Root {
  protected constructor() {}

  async start() {
    await this.introduction();
    await this.prerequisites();
    await this.downloadMagisk();
    await this.promptPlugInPhone();
    await this.startADBServer();
    await this.unlockBootloader();
    await this.getLatestFactoryImage();
    await this.installMagisk();
    await this.patchBootImage();
    await this.flash();
    await this.end();
  }

  async introduction() {
    print(
      chalk.greenBright(
        "\nThis app will guide you through the rooting process."
      )
    );
  }
  async prerequisites() {
    if (!(await inputConfirmation("Do you have developer options enabled"))) {
      print(STRINGS.enable_developer_options);
      inputConfirmation("Done");
    }

    if (!(await inputConfirmation("Do you have USB debugging enabled"))) {
      print(STRINGS.enable_usb_debugging);
      inputConfirmation("Done");
    }
  }
  async downloadMagisk() {
    print(chalk.bold("Fetching the latest version of Magisk..."));
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
    print("\nStarting ADB server...");
    adb("devices");
    print(STRINGS.adb_always_allow);
    print(
      "\nPlease make sure your device appears in the list of devices attached"
    );
  }
  async unlockBootloader() {
    if (!(await inputConfirmation("Is your bootloader unlocked"))) {
      print("Unlocking your bootloader now");
      print(chalk.redBright("BEWARE: ALL DATA WILL BE ERASED"));
      if (!(await inputConfirmation("Proceed"))) {
        printError("Aborted bootloader unlock");
      }
      if (!(await inputConfirmation("Do you have OEM unlocking enabled"))) {
        print(STRINGS.enable_oem_unlocking);
        inputConfirmation("Done");
      }
      adb("reboot", "bootloader");
      fastboot("flashing", "unlock");
      await inputConfirmation("Done");
      fastboot("reboot");
    }
  }
  async getLatestFactoryImage() {}
  async patchBootImage() {}
  async flash() {}
  async end() {
    print(
      chalk.bold(
        chalk.greenBright("Your phone has been rooted successfully! 🥳")
      )
    );
  }
}

class GooglePixel extends Root {
  constructor() {
    super();
  }

  imageDir: string;

  async getLatestFactoryImage() {
    print("");
    print(indoc`
      Please download the latest factory image for your Google Pixel and
      unzip the zip file from this website: https://developers.google.com/android/images
    `);
    open("https://developers.google.com/android/images");
    print("");

    print(STRINGS.tip_drag_folder_into_terminal);
    this.imageDir = await input("Path to extracted image folder");
    this.imageDir = path.resolve(this.imageDir);
    spinner.start("Processing...");
    await extract(glob.sync(`${this.imageDir}/image-*.zip`)[0], {
      dir: this.imageDir,
    });
    spinner.stopAndPersist();
  }
  async patchBootImage() {
    adb("push", `${this.imageDir}/boot.img`, "/sdcard/");
    print("\nThe image file has been pushed to your Android device.");
    print(STRINGS.patch_boot_image_file_instructions);
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
}

class OnePlus extends Root {
  constructor() {
    super();
  }

  softwareZipPath: string;

  async getLatestFactoryImage() {
    print(indoc`
      Please download the latest software update for your OnePlus phone here:
      https://www.oneplus.com/support/softwareupgrade
    `);
    open("https://www.oneplus.com/support/softwareupgrade");

    print(STRINGS.tip_drag_folder_into_terminal);
    this.softwareZipPath = await input("Path to software update zip file");
    this.softwareZipPath = path.resolve(this.softwareZipPath);

    if (!(await inputConfirmation("Do you have Python on your system?"))) {
      print(STRINGS.install_python_instructions);
    }

    spinner.start("Processing...");
    await extract(this.softwareZipPath, { dir: DIR });

    shell.exec(
      `python3 -m pip install -r ${process.cwd()}/lib/payload_dumper/requirements.txt`
    );
    shell.exec(
      `python3 ${process.cwd()}/lib/payload_dumper/payload_dumper.py ${DIR}/payload.bin`
    );
    shell.mv("output", DIR);
    spinner.stopAndPersist();
  }
  async patchBootImage() {
    adb("push", `${DIR}/output/boot.img`, "/sdcard/");
    print("\nThe image file has been pushed to your Android device.");
    print(STRINGS.patch_boot_image_file_instructions);
    await inputConfirmation("Done");
    adb("pull", "/sdcard/Download/magisk_patched.img", `${DIR}`);
  }
  async flash() {
    spinner.start(chalk.greenBright("Rooting your phone..."));
    adb("reboot", "recovery");
    print("Your phone has been booted into recovery.");
    print("Now, you need to enter ADB sideload mode.");
    print("To do so, just tap English > Install from USB > OK");
    await inputConfirmation("Done");
    adb("sideload", this.softwareZipPath);
    adb("reboot", "bootloader");
    fastboot("flash", "boot", `${DIR}/magisk_patched.img`);
    fastboot("reboot");
    spinner.stopAndPersist();
  }
}

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
