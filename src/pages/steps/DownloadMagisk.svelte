<script lang="ts">
  import { Loader } from "../../components";
  import { nextStep, adb, MAGISK_MANAGER_APK_PATH } from "../../global";

  async function installMagiskManager() {
    adb("install", MAGISK_MANAGER_APK_PATH);
  }
</script>

<span>Installing Magisk Manager onto your device...</span>
{#await installMagiskManager()}
  <div class="loading">
    <Loader primary />
  </div>
{:then}
  <span class="spacing-top">Done!</span>
  <div class="hidden">{nextStep()}</div>
{/await}
