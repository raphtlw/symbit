<script lang="ts">
  import { Loader, Button, StepDoneButton } from "../../components";
  import { imageDirStore, path, adb } from "../../global";

  let imageDir: string;
  imageDirStore.subscribe((value) => (imageDir = value));

  async function pushBootImageFile() {
    adb("push", path.join(imageDir, "boot.img"), "/sdcard/");
  }

  async function pullBootImageFile() {
    adb("pull", "/sdcard/Download/magisk_patched.img", imageDir);
  }

  let patchBootImageFinished = false;
</script>

{#await pushBootImageFile()}
  <div class="loading">
    <Loader primary />
  </div>
{:then}
  <span class="spacing-bottom">The image file has been sent to your Android
    device.</span>
  <span class="spacing-bottom">Now you'll need to patch the boot image file
    using the Magisk Manager app on your Android device.</span>
  <p class="spacing-bottom">
    1. Open Magisk<br />2. Tap 'install'<br />3. Tap 'install' again<br />4. Tap
    'Select and Patch a File'<br />5. Go to the root of your Pixel's file
    manager and select the boot.img file
  </p>
  <span class="spacing-bottom">NOTE: After patching the boot.img, DO NOT REBOOT.</span>
  <Button
    label="Finished patching"
    onClick={() => (patchBootImageFinished = true)} />
  {#if patchBootImageFinished}
    {#await pullBootImageFile()}
      <div class="loading">
        <Loader primary />
      </div>
    {:then}
      <StepDoneButton />
    {/await}
  {/if}
{/await}
