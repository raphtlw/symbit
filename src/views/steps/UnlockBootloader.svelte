<script lang="ts">
  import { Button, Loader, StepDoneButton } from "../../components"
  import { nextStep, adb, fastboot, remote } from "../../global"

  async function unlockBootloader() {
    adb("reboot", "bootloader")
    fastboot("flashing", "unlock")
    fastboot("reboot", "bootloader")

    // Verify unlock
    if (
      fastboot("oem", "device-info")
        .toLowerCase()
        .includes("device unlocked: false")
    ) {
      remote.dialog.showMessageBoxSync({
        title: "ERROR",
        message: "Bootloader not unlocked, unable to proceed.",
      })
      remote.app.quit()
    }
  }

  let unlockBootloaderShown = false
</script>

<span>You first need to enable OEM unlocking.</span>
<p class="spacing-top">
  Instructions:<br />1. Go to the Developer Options menu<br />2. Scroll down to
  find "OEM Unlocking"<br />3. Flip the switch and you're good to go!
</p>
<span class="spacing-top">Unlock your bootloader?</span>
<span class="spacing-top spacing-bottom">This process is irreversible and all
  your data will be erased forever!</span>
<div class="horizontal-layout">
  <div class="spacing-right">
    <Button label="Yes" onClick={() => (unlockBootloaderShown = true)} />
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
<StepDoneButton />
