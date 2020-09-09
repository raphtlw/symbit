import yargs from "yargs";
import fs from "fs";
import shell from "shelljs";
import chalk from "chalk";
import got from "got";
import extract from "extract-zip";

import {
  ACTIONS,
  PLATFORM_TOOLS_DIR,
  SUPPORTED_DEVICE_TYPES,
  platformToolsVariants,
  indoc,
  printError,
  inputChoice,
  print,
} from "./global";
import _root from "./root";
import _update from "./update";

// prettier-ignore
const argv = yargs
  .usage("Usage: $0 <command> [options]")
  .command(ACTIONS.ROOT, "Root your phone")
  .command(ACTIONS.UPDATE, "Update your phone")
  .epilog("copyright 2020")
  .argv;

(async () => {
  print("");
  print(
    chalk.bold(indoc`
      SYMBIT
      ---
      A root manager for Android devices which allows you to update
      existing rooted devices, tweak magisk and run other commands which improve the
      Android root experience and adds onto Magisk. 🚀
  
      - raphtlw
    `)
  );
  print("");

  async function downloadPlatformTools(platform: platformToolsVariants) {
    got
      .stream(
        `https://dl.google.com/android/repository/platform-tools-latest-${platform}.zip`
      )
      .pipe(
        fs
          .createWriteStream(`${PLATFORM_TOOLS_DIR}.zip`)
          .on("finish", async () => {
            await extract(`${PLATFORM_TOOLS_DIR}.zip`, {
              dir: PLATFORM_TOOLS_DIR,
            });
            fs.unlinkSync(`${PLATFORM_TOOLS_DIR}.zip`);
            if (platform === "darwin" || platform === "linux") {
              shell.chmod("+x", `${PLATFORM_TOOLS_DIR}/adb`);
              shell.chmod("+x", `${PLATFORM_TOOLS_DIR}/fastboot`);
            }
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
      printError("Android platform tools not found for your device. 😕");
    }
  }

  const deviceType = await inputChoice(
    "What type of device do you have?",
    Object.values(SUPPORTED_DEVICE_TYPES)
  );

  switch (argv._[0]) {
    case ACTIONS.ROOT:
      await _root(deviceType);
      break;
    case ACTIONS.UPDATE:
      await _update(deviceType);
      break;
  }
})();
