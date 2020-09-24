<script lang="ts">
  import { Loader, StepDoneButton } from "../../components";
  import { adb, fastboot, glob, imageDirStore } from "../../global";

  let imageDir: string;

  imageDirStore.subscribe((value) => (imageDir = value));

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

{#await flash()}
  <span class="spacing-bottom">Rooting your phone</span>
  <Loader primary />
{:then}
  <StepDoneButton />
{/await}
