<script lang="ts">
  import Index from "./pages/index.svelte";
  import Root from "./pages/root.svelte";
  import Update from "./pages/update.svelte";
  import TopBar from "./components/TopBar.svelte";
  import type { page, platformToolsVariants } from "./global";
  import {
    currentPage,
    Log,
    PLATFORM_TOOLS_DIR,
    DIR,
    got,
    fs,
    extract,
    chmod,
    printError,
    LOG_DIR,
  } from "./global";
  import { onMount } from "svelte";

  let currentPageValue: page;

  currentPage.subscribe((value) => {
    currentPageValue = value;
  });

  onMount(async () => {
    // Create temporary folders if they don't exist
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

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
                chmod(
                  "+x",
                  `${PLATFORM_TOOLS_DIR}/adb`,
                  `${PLATFORM_TOOLS_DIR}/fastboot`
                );
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
  });
</script>

<main>
  <TopBar />
  {#if currentPageValue === 'index'}
    <Index />
  {:else if currentPageValue === 'root'}
    <Root />
  {:else if currentPageValue === 'update'}
    <Update />
  {/if}
</main>
