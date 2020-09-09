import fs from "fs";
import shell from "shelljs";
import chalk from "chalk";
import got from "got";
import extract from "extract-zip";

import {
  args,
  ACTIONS,
  PLATFORM_TOOLS_DIR,
  SUPPORTED_DEVICE_TYPES,
  platformToolsVariants,
  indoc,
  printError,
  inputChoice,
  print,
  Log,
  DIR,
  LOG_PATH,
} from "./global";
import _root from "./root";
import _update from "./update";

(async () => {
  // Create temporary files if they don't exist
  if (!fs.existsSync(DIR))
    fs.mkdir(DIR, { recursive: true }, (err) => {
      if (err) throw err;
    });
  if (!fs.existsSync(LOG_PATH))
    fs.mkdir(LOG_PATH, { recursive: true }, (err) => {
      if (err) throw err;
    });

  print();
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
  print();

  async function downloadPlatformTools(platform: platformToolsVariants) {
    Log.i("Platform tools not found. Installing...");
    got
      .stream(
        `https://dl.google.com/android/repository/platform-tools-latest-${platform}.zip`
      )
      .pipe(
        fs
          .createWriteStream(`${PLATFORM_TOOLS_DIR}.zip`)
          .on("finish", async () => {
            Log.i("Downloaded platform tools");
            await extract(`${PLATFORM_TOOLS_DIR}.zip`, {
              dir: DIR,
            });
            Log.i(`Extracted platform tools to ${PLATFORM_TOOLS_DIR}`);
            fs.unlinkSync(`${PLATFORM_TOOLS_DIR}.zip`);
            Log.i("Deleted platform tools zip file");
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
  } else {
    Log.i(`Platform tools found in ${PLATFORM_TOOLS_DIR}`);
  }

  const deviceType = await inputChoice(
    "What type of device do you have?",
    Object.values(SUPPORTED_DEVICE_TYPES)
  );

  switch (args._[0]) {
    case ACTIONS.ROOT:
      await _root(deviceType);
      break;
    case ACTIONS.UPDATE:
      await _update(deviceType);
      break;
  }
})();
