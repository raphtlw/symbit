<script lang="ts">
  import Step from "../components/Step.svelte";
  import StepBar from "../components/StepBar.svelte";
  import Button from "../components/Button.svelte";
  import Loader from "../components/Loader.svelte";
  import Link from "../components/Link.svelte";
  import StepDoneButton from "../components/StepDoneButton.svelte";
  import type { IStep } from "../global";
  import {
    STRINGS,
    got,
    fs,
    MAGISK_MANAGER_APK_PATH,
    adb,
    navigate,
    fastboot,
    remote,
    extract,
    glob,
    DIR,
    path,
    Log,
  } from "../global";
  import { onMount } from "svelte";

  onMount(async () => {
    got
      .stream(
        "https://github.com/topjohnwu/Magisk/releases/download/manager-v7.5.1/MagiskManager-v7.5.1.apk"
      )
      .pipe(fs.createWriteStream(MAGISK_MANAGER_APK_PATH));
  });

  const steps: IStep[] = [
    {
      id: 1,
      name: "Prerequisites",
      description: "Make sure you do these before starting.",
    },
    {
      id: 2,
      name: "Download Magisk",
      description: "Download Magisk Manager so that you can root your phone",
    },
    {
      id: 3,
      name: "Connect phone",
      description: "Please plug in your phone.",
    },
    {
      id: 4,
      name: "Unlock bootloader",
      description: "Make sure your bootloader is unlocked before proceeding.",
    },
    {
      id: 5,
      name: "Get latest image",
      description: "Please download the latest factory image",
    },
    {
      id: 6,
      name: "Patch boot image",
      description: "Use the Magisk Manager app to patch the boot image file.",
    },
    {
      id: 7,
      name: "Flash",
      description: "Begin the flashing process to root your phone.",
    },
    {
      id: 8,
      name: "Finish",
      description: "",
    },
  ];

  let currentStep: IStep = steps[0];
  let unlockBootloaderShown = false;
  let patchBootImageFinished = false;
  let pathToImageZipFile: string;
  let imageDir: string;

  function nextStep() {
    currentStep = steps[steps.findIndex((item) => item === currentStep) + 1];
  }

  async function installMagiskManager() {
    adb("install", MAGISK_MANAGER_APK_PATH);
  }

  async function unlockBootloader() {
    adb("reboot", "bootloader");
    fastboot("flashing", "unlock");
    fastboot("reboot");
  }

  async function processImageZipFile() {
    try {
      await extract(pathToImageZipFile, { dir: DIR });
      imageDir = glob.sync(
        `${DIR}/${path.basename(pathToImageZipFile, ".zip").split("-")[0]}*`
      )[0];
      Log.i(`Image directory saved as: ${imageDir}`);
      await extract(glob.sync(`${imageDir}/image-*.zip`)[0], {
        dir: imageDir,
      });
      fs.unlink(`${imageDir}.zip`, () => {
        Log.i("Deleted image directory zip");
      });
      Log.i("Extracted inner image folder");
    } catch (e) {
      remote.dialog.showErrorBox("Error", e.message);
    }
  }

  async function pushBootImageFile() {
    adb("push", path.join(imageDir, "boot.img"), "/sdcard/");
  }

  async function pullBootImageFile() {
    adb("pull", "/sdcard/Download/magisk_patched.img", imageDir);
  }

  async function flash() {
    adb("reboot", "bootloader");
    fastboot(
      "flash",
      "bootloader",
      glob.sync(`${imageDir}/bootloader-*.img`)[0]
    );
    fastboot("reboot", "bootloader");
    fastboot("flash", "radio", glob.sync(`${imageDir}/radio-*.img`)[0]);
    fastboot("reboot", "bootloader");
    fastboot(
      "--skip-reboot",
      "update",
      glob.sync(`${imageDir}/image-*.zip`)[0]
    );
    fastboot("reboot", "bootloader");
    fastboot("flash", "boot", `${imageDir}/magisk_patched.img`);
    fastboot("reboot");
  }
</script>

<style>
  main {
    margin: 1rem 1.6rem;
  }
  p,
  h2,
  span {
    color: rgb(233, 233, 233);
    display: block;
  }
  p {
    white-space: pre-wrap;
  }
  h2 {
    font-size: 1rem;
    font-weight: 500;
    margin-top: 0.8rem;
    margin-bottom: 0.4rem;
  }
  .title {
    margin: 0rem 1rem 2rem;
    font-size: 1.4rem;
    color: rgb(226, 226, 226);
    font-weight: 500;
  }
  .steps {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .step-bar {
    width: 40%;
    margin-right: 1rem;
  }
  .step-view {
    width: 60%;
  }
  .loading {
    margin-top: 1.2rem;
    transform: scale(0.8);
  }
  .spacing-top {
    margin-top: 1rem;
  }
  .spacing-bottom {
    margin-bottom: 1rem;
  }
  .spacing-right {
    margin-right: 1rem;
  }
  .spacing-left {
    margin-left: 1rem;
  }
  .hidden {
    display: none;
  }
  .horizontal-layout {
    display: flex;
    flex-direction: row;
  }
</style>

<main>
  <h1 class="title">Let's walk through the rooting process together.</h1>
  <div class="steps">
    <div class="step-bar">
      <StepBar bind:current={currentStep} {steps} />
    </div>
    <div class="step-view">
      {#if currentStep === steps[0]}
        <Step step={steps[0]}>
          <h2>Enable developer options</h2>
          <p>{STRINGS.enable_developer_options}</p>
          <h2>Enable USB Debugging</h2>
          <p>{STRINGS.enable_usb_debugging}</p>
          <StepDoneButton onClick={nextStep} />
        </Step>
      {:else if currentStep === steps[1]}
        <Step step={steps[1]}>
          <span>Installing Magisk Manager onto your device...</span>
          {#await installMagiskManager()}
            <div class="loading">
              <Loader primary />
            </div>
          {:then}
            <span class="spacing-top">Done!</span>
            <div class="hidden">{nextStep()}</div>
          {/await}
        </Step>
      {:else if currentStep === steps[2]}
        <Step step={steps[2]}>
          <StepDoneButton onClick={nextStep} />
        </Step>
      {:else if currentStep === steps[3]}
        <Step step={steps[3]}>
          <span>You first need to enable OEM unlocking.</span>
          <p class="spacing-top">{STRINGS.enable_oem_unlocking}</p>
          <span class="spacing-top">Unlock your bootloader?</span>
          <span class="spacing-top spacing-bottom">This process is irreversible
            and all your data will be erased forever!</span>
          <div class="horizontal-layout">
            <div class="spacing-right">
              <Button
                label="Yes"
                onClick={() => {
                  unlockBootloaderShown = true;
                }} />
            </div>
            <div>
              <Button label="No" onClick={nextStep} />
            </div>
          </div>
          {#if unlockBootloaderShown}
            {#await unlockBootloader()}
              <span>Unlocking your bootloader...</span>
              <div class="loading">
                <Loader primary />
              </div>
            {:then}
              <span class="spacing-top">Done!</span>
            {/await}
          {/if}
          <StepDoneButton onClick={nextStep} />
        </Step>
      {:else if currentStep === steps[4]}
        <Step step={steps[4]}>
          <div>
            Please download the latest factory image for your Google Pixel and
            unzip the zip file from
            <Link href="https://developers.google.com/android/images">
              here.
            </Link>
          </div>
          <span class="spacing-top spacing-bottom">Select the zip file you
            downloaded</span>
          <div class="horizontal-layout">
            <Button
              label="Choose file"
              onClick={async () => {
                const result = await remote.dialog.showOpenDialog({
                  properties: ['openFile'],
                  filters: [{ name: 'Zip files', extensions: ['zip'] }],
                });
                if (!result.canceled) {
                  pathToImageZipFile = result.filePaths[0];
                }
              }} />
            <span
              class="spacing-left"
              style="margin-top: 0.5rem">{pathToImageZipFile}</span>
          </div>
          {#if pathToImageZipFile !== undefined}
            <span class="spacing-top spacing-bottom">Processing file...</span>
            {#await processImageZipFile()}
              <div class="loading">
                <Loader primary />
              </div>
            {:then}
              <StepDoneButton onClick={nextStep} />
            {/await}
          {/if}
        </Step>
      {:else if currentStep === steps[5]}
        <Step step={steps[5]}>
          {#await pushBootImageFile()}
            <div class="loading">
              <Loader primary />
            </div>
          {:then}
            <span class="spacing-bottom">The image file has been sent to your
              Android device.</span>
            <span class="spacing-bottom">Now you'll need to patch the boot image
              file using the Magisk Manager app on your Android device.</span>
            <p class="spacing-bottom">
              {STRINGS.patch_boot_image_file_instructions}
            </p>
            <span class="spacing-bottom">NOTE: After patching the boot.img, DO
              NOT REBOOT.</span>
            <Button
              label="Finished patching"
              onClick={() => patchBootImageFinished} />
            {#if patchBootImageFinished}
              {#await pullBootImageFile()}
                <div class="loading">
                  <Loader primary />
                </div>
              {:then}
                <StepDoneButton onClick={nextStep} />
              {/await}
            {/if}
          {/await}
        </Step>
      {:else if currentStep === steps[6]}
        <Step step={steps[6]}>
          {#await flash()}
            <span class="spacing-bottom">Rooting your phone</span>
            <Loader primary />
          {:then}
            <StepDoneButton onClick={nextStep} />
          {/await}
        </Step>
      {:else if currentStep === steps[7]}
        <Step step={steps[7]}>
          <span>Your phone has been successfully rooted! 🚀</span>
        </Step>
      {:else}{navigate('index')}{/if}
    </div>
  </div>
</main>
