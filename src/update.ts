import extract from "extract-zip";
import glob from "glob";
import chalk from "chalk";
import open from "open";
import path from "path";

import {
  SUPPORTED_DEVICE_TYPES,
  STRINGS,
  spinner,
  inputConfirmation,
  adb,
  input,
  fastboot,
  print,
  indoc,
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
      print(STRINGS.unsupported_device);
  }
}

class Update {
  imageDir: string;

  async start() {
    await this.promptConnectPhone();
    await this.prerequisites();
    await this.startADBServer();
    await this.getLatestFactoryImage();
    await this.patchBootImage();
    await this.flash();
    await this.end();
  }

  async promptConnectPhone() {
    await inputConfirmation("Please connect your phone.");
  }
  async prerequisites() {
    if (!(await inputConfirmation("Do you have Developer options enabled"))) {
      print(STRINGS.enable_developer_options);
      inputConfirmation("Done");
    }

    if (!(await inputConfirmation("Do you have USB debugging enabled"))) {
      print(STRINGS.enable_usb_debugging);
      inputConfirmation("Done");
    }
  }
  async startADBServer() {
    print("");
    print("Starting ADB server...");
    print("");
    adb("devices");
    print(STRINGS.adb_always_allow);
    print("");
    print(
      "Please make sure your device appears in the list of devices attached above"
    );
  }
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
    print("\nUpdate process starting...");
    spinner.start(chalk.greenBright("Updating your phone..."));
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
    print(
      chalk.bold(
        chalk.greenBright(
          "\nYour phone has been updated to the latest version of Android! 🥳"
        )
      )
    );
  }
}

class GooglePixel extends Update {}
class OnePlus extends Update {}

// async function GooglePixel() {
//   await inputConfirmation("Please connect your phone.");

//   if (!(await inputConfirmation("Do you have Developer options enabled"))) {
//     print(prompts.enable_developer_options);
//     inputConfirmation("Done");
//   }

//   if (!(await inputConfirmation("Do you have USB debugging enabled"))) {
//     print(prompts.enableUSBDebugging);
//     inputConfirmation("Done");
//   }

//   print("\nStarting ADB server...\n");
//   adb("devices");
//   print(prompts.adbAlwaysAllow);
//   print(
//     "\nPlease make sure your device appears in the list of devices attached"
//   );

//   print(prompts.latestFactoryImage);
//   open("https://developers.google.com/android/images");

//   print(prompts.tipDragFolderIntoTerminal);
//   const imageDir = await input("Path to extracted image folder");

//   spinner.start("Processing...");
//   await extract(glob.sync(`${imageDir}/image-*.zip`)[0], {
//     dir: imageDir,
//   });
//   spinner.stopAndPersist();

//   adb("push", `${imageDir}/boot.img`, "/sdcard/");
//   print("\nThe image file has been pushed to your Android device.");
//   print(prompts.patchBootImageFileInstructions);

//   await inputConfirmation("Done");

//   adb("pull", "/sdcard/Download/magisk_patched.img", imageDir);

//   print("\nUpdate process starting...");
//   spinner.start(chalk.greenBright("Updating your phone..."));
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

//   print(
//     chalk.bold(
//       chalk.greenBright(
//         "\nYour phone has been updated to the latest version of Android! 🥳"
//       )
//     )
//   );
// }
