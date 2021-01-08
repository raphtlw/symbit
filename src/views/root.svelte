<script lang="ts">
  import { StepBar, Step } from "../components"
  import {
    ConnectPhone,
    DownloadMagisk,
    GetLatestFactoryImage,
    PatchBootImage,
    Finish,
    Flash,
    Prerequisites,
    UnlockBootloader,
  } from "./steps"
  import type { IStep } from "../global"
  import {
    got,
    fs,
    MAGISK_MANAGER_APK_PATH,
    currentStep,
    currentSteps,
  } from "../global"
  import { onMount } from "svelte"

  onMount(async () => {
    currentStep.set(steps[0])
    currentSteps.set(steps)
    got
      .stream(
        "https://github.com/topjohnwu/Magisk/releases/download/manager-v7.5.1/MagiskManager-v7.5.1.apk"
      )
      .pipe(fs.createWriteStream(MAGISK_MANAGER_APK_PATH))
  })

  const steps: IStep[] = [
    {
      id: 1,
      name: "Prerequisites",
      description: "Make sure you do these before starting.",
      component: Prerequisites,
    },
    {
      id: 2,
      name: "Download Magisk",
      description: "Download Magisk Manager so that you can root your phone",
      component: DownloadMagisk,
    },
    {
      id: 3,
      name: "Connect phone",
      description: "Please plug in your phone.",
      component: ConnectPhone,
    },
    {
      id: 4,
      name: "Unlock bootloader",
      description: "Make sure your bootloader is unlocked before proceeding.",
      component: UnlockBootloader,
    },
    {
      id: 5,
      name: "Get latest image",
      description: "Please download the latest factory image",
      component: GetLatestFactoryImage,
    },
    {
      id: 6,
      name: "Patch boot image",
      description: "Use the Magisk Manager app to patch the boot image file.",
      component: PatchBootImage,
    },
    {
      id: 7,
      name: "Flash",
      description: "Begin the flashing process to root your phone.",
      component: Flash,
    },
    {
      id: 8,
      name: "Finish",
      description: "",
      component: Finish,
    },
  ]

  let currentStepValue: IStep
  currentStep.subscribe((value) => (currentStepValue = value))
</script>

<style>
  main {
    margin: 1rem 1.6rem;
  }
  main :global(p),
  main :global(h2),
  main :global(span) {
    color: rgb(233, 233, 233);
    display: block;
  }
  main :global(h2) {
    font-size: 1rem;
    font-weight: 500;
    margin-top: 0.8rem;
    margin-bottom: 0.4rem;
  }
  main :global(.title) {
    margin: 0rem 1rem 2rem;
    font-size: 1.4rem;
    color: rgb(226, 226, 226);
    font-weight: 500;
  }
  main :global(.steps) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  main :global(.step-bar) {
    width: 40%;
    margin-right: 1rem;
  }
  main :global(.step-view) {
    width: 60%;
  }
  main :global(.loading) {
    margin-top: 1.2rem;
    transform: scale(0.8);
  }
  main :global(.spacing-top) {
    margin-top: 1rem;
  }
  main :global(.spacing-bottom) {
    margin-bottom: 1rem;
  }
  main :global(.spacing-right) {
    margin-right: 1rem;
  }
  main :global(.spacing-left) {
    margin-left: 1rem;
  }
  main :global(.hidden) {
    display: none;
  }
  main :global(.horizontal-layout) {
    display: flex;
    flex-direction: row;
  }
</style>

<main>
  <h1 class="title">Let's walk through the rooting process together.</h1>
  <div class="steps">
    <div class="step-bar">
      <StepBar bind:current={currentStepValue} {steps} />
    </div>
    <div class="step-view">
      {#if currentStepValue}
        <Step bind:step={currentStepValue} />
      {/if}
    </div>
  </div>
</main>
