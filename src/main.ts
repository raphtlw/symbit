import yargs from "yargs";
import fs from "fs";
import shell from "shelljs";
import chalk from "chalk";
import got from "got";
import extract from "extract-zip";

import { PLATFORM_TOOLS_DIR, supportedDeviceTypes } from "./global";
import { printError, inputChoice } from "./util";
import _update from "./update";

// prettier-ignore
const argv = yargs
  .usage("Usage: $0 <command> [options]")
  .command("root", "Root your phone")
  .command("update", "Update your phone")
  .epilog("copyright 2020")
  .argv;

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

(async () => {
  /**
   * Downloads the latest version of platform tools for your system.
   *
   * @param {string} platform
   * Platform to be appended to the end of the requested filename.
   */
  async function downloadPlatformTools(platform: string) {
    got
      .stream(
        `https://dl.google.com/android/repository/platform-tools-latest-${platform}.zip`
      )
      .pipe(
        fs
          .createWriteStream(`${PLATFORM_TOOLS_DIR}.zip`)
          .on("finish", async () => {
            await extract(`${PLATFORM_TOOLS_DIR}.zip`, { dir: process.cwd() });
            fs.unlinkSync(`${PLATFORM_TOOLS_DIR}.zip`);
            shell.chmod("+x", `${PLATFORM_TOOLS_DIR}/adb`);
            shell.chmod("+x", `${PLATFORM_TOOLS_DIR}/fastboot`);
          })
      );
  }

  if (!fs.existsSync(PLATFORM_TOOLS_DIR)) {
    if (process.platform === "linux") {
      await downloadPlatformTools("linux");
    } else if (process.platform === "win32") {
      await downloadPlatformTools("windows");
    } else if (process.platform === "darwin") {
      await downloadPlatformTools("darwin");
    } else {
      printError("Android platform tools not found for your device.");
    }
  }

  const deviceType = await inputChoice(
    "What type of device do you have?",
    Object.values(supportedDeviceTypes)
  );

  switch (argv._[0]) {
    case "update":
      await _update(deviceType);
      break;
  }
})();
