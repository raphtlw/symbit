import extract from "extract-zip";
import glob from "glob";
import chalk from "chalk";
import open from "open";
import { printError, inputConfirmation, adb, fastboot, input } from "./util";
import { supportedDeviceTypes, spinner } from "./global";

//
// -----------------------------------------------------
//

export default async function _update(deviceType: string) {
  switch (deviceType) {
    case supportedDeviceTypes.GOOGLE_PIXEL:
      await GooglePixel();
      break;
    default:
      break;
  }
}

async function GooglePixel() {
  if (!(await inputConfirmation("Please connect your phone."))) {
    printError("Ensure your phone is connected first before proceeding.");
  }

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
