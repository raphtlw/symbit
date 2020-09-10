import extract from "extract-zip";
import glob from "glob";
import chalk from "chalk";
import open from "open";
import path from "path";
import shell from "shelljs";
import fs from "fs/promises";

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
  DIR,
  inputChoice,
  Log,
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
  protected constructor() {}

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
    if (
      (await inputChoice("What are you upgrading to?", [
        "Android 10",
        "Android 11",
      ])) === "Android 11"
    ) {
      Log.i("User upgrading to Android 11");
      print("Upgrading to Android 11? You'll need Magisk canary installed.");
      print(STRINGS.magisk_canary_instructions);
      if ((await inputChoice("Choice", ["1", "2"])) === "1") {
        print(STRINGS.magisk_canary_instructions_update_existing);
        if (await inputConfirmation("Open link in browser"))
          open(
            "https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/debug.json"
          );
      } else {
        print(STRINGS.magisk_canary_instructions_install_new);
        if (await inputConfirmation("Open link in browser"))
          open(
            "https://raw.githubusercontent.com/topjohnwu/magisk_files/canary/app-debug.apk"
          );
      }
    }

    if (!(await inputConfirmation("Do you have Developer options enabled"))) {
      Log.i("Developer options not enabled");
      print();
      print(STRINGS.enable_developer_options);
      await inputConfirmation("Done");
    }

    if (!(await inputConfirmation("Do you have USB debugging enabled"))) {
      Log.i("USB debugging not enabled");
      print();
      print(STRINGS.enable_usb_debugging);
      await inputConfirmation("Done");
    }
  }
  async startADBServer() {
    print();
    Log.i("Starting ADB server");
    print("Starting ADB server...");
    print();
    adb("devices");
    print(STRINGS.adb_always_allow);
    print();
    print(
      chalk.bold(
        "Please make sure your device appears in the list of devices attached above"
      )
    );
  }
  async getLatestFactoryImage() {}
  async patchBootImage() {}
  async flash() {}
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

class GooglePixel extends Update {
  constructor() {
    super();
  }

  imageDir: string;

  async getLatestFactoryImage() {
    print();
    print(indoc`
      Please download the latest factory image for your Google Pixel
      from this website: https://developers.google.com/android/images
    `);
    open("https://developers.google.com/android/images");
    print();

    print(STRINGS.tip_drag_folder_into_terminal);
    let imageZipDirPath = await input("Path to image folder");
    imageZipDirPath = path.resolve(imageZipDirPath);
    Log.i(`Google Pixel factory image zip file location: ${imageZipDirPath}`);
    spinner.start("Processing...");
    Log.d(`Factory image exists: ${(await fs.stat(imageZipDirPath)).isFile()}`);
    await extract(imageZipDirPath, { dir: DIR });
    this.imageDir = glob.sync(
      `${DIR}/${path.basename(imageZipDirPath, ".zip").split("-")[0]}*`
    )[0];
    Log.i(`Image directory written to class: ${this.imageDir}`);
    await extract(glob.sync(`${this.imageDir}/image-*.zip`)[0], {
      dir: this.imageDir,
    });
    fs.unlink(`${this.imageDir}.zip`);
    Log.i("Extracted inner image folder");
    spinner.stopAndPersist();
  }
  async patchBootImage() {
    adb("push", path.join(this.imageDir, "boot.img"), "/sdcard/");
    print("\nThe image file has been pushed to your Android device.");
    print(STRINGS.patch_boot_image_file_instructions);
    await inputConfirmation("Done");

    adb("pull", "/sdcard/Download/magisk_patched.img", this.imageDir);
  }
  async flash() {
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
    fastboot("flash", "boot", path.join(this.imageDir, "magisk_patched.img"));
    fastboot("reboot");
    spinner.stopAndPersist();
  }
}

class OnePlus extends Update {
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
      `python3 -m pip install -r ${path.join(
        process.cwd(),
        "lib",
        "payload_dumper",
        "requirements.txt"
      )}`
    );
    shell.exec(
      `python3 ${path.join(
        process.cwd(),
        "lib",
        "payload_dumper",
        "payload_dumper.py"
      )} ${path.join(DIR, "payload.bin")}`
    );
    shell.mv("output", DIR);
    spinner.stopAndPersist();
  }
  async patchBootImage() {
    adb("push", path.join(DIR, "output", "boot.img"), "/sdcard/");
    print("\nThe image file has been pushed to your Android device.");
    print(STRINGS.patch_boot_image_file_instructions);
    await inputConfirmation("Done");
    adb("pull", "/sdcard/Download/magisk_patched.img", `${DIR}`);
  }
  async flash() {
    spinner.start(chalk.greenBright("Updating your phone..."));
    adb("reboot", "recovery");
    print("Your phone has been booted into recovery.");
    print("Now, you need to enter ADB sideload mode.");
    print("To do so, just tap English > Install from USB > OK");
    await inputConfirmation("Done");
    adb("sideload", this.softwareZipPath);
    adb("reboot", "bootloader");
    fastboot("flash", "boot", path.join(DIR, "magisk_patched.img"));
    fastboot("reboot");
    spinner.stopAndPersist();
  }
}

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
