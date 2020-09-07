import ora from "ora";

import { indoc } from './util'





export const PLATFORM_TOOLS_DIR = "platform-tools";
export const MAGISK_MANAGER_APK_PATH = "magisk-manager.apk";


export const spinner = ora();


export enum supportedDeviceTypes {
  GOOGLE_PIXEL = "Google Pixel"
}


export const unsupportedDeviceString = "Unfortunately your device has not been supported yet 😕"


export enum ACTIONS {
  UPDATE = "update",
  ROOT = "root"
}


export const prompts = {
  enableDeveloperOptions: indoc`
    Instructions for enabling Developer Options
    ---

    1. Go to settings > about phone
    2. Tap "build number" 7 times
  `,
  enableUSBDebugging: indoc`
    Instructions for enabling USB debugging
    ---

    1. Go to the Developer Options menu
    2. Scroll down to find "USB Debugging"
    3. Flip the switch and you're good to go!
  `,
  enableOEMUnlocking: indoc`
    Instructions for enabling OEM unlocking
    ---

    1. Go to the Developer Options menu
    2. Scroll down to find "OEM Unlocking"
    3. Flip the switch and you're good to go!
  `,
  adbAlwaysAllow: indoc`
    Please check the 'always allow' option for ADB
    if you see a popup asking you to allow this PC to connect with ADB.
  `,
  latestFactoryImage: indoc`
    Please download the latest factory image for your Google Pixel
    and unzip the zip file from this website: https://developers.google.com/android/images
  `,
  tipDragFolderIntoTerminal: indoc`TIP: You can drag and drop the folder into the terminal`,
  patchBootImageFileInstructions: indoc`
    Now you'll need to patch the boot image file using the Magisk Manager app
    on your Android device.
    
    1. Open Magisk
    2. Tap 'install'
    3. Tap 'install' again
    4. Tap 'Select and Patch a File'
    5. Go to the root of your Pixel's file manager
      and select the boot.img file
    NOTE: After patching the boot.img, DO NOT REBOOT.
  `
}