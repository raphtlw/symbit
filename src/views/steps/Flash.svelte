<script lang="ts">
  import { Loader, StepDoneButton } from "../../components"
  import { onMount } from "svelte"
  import { microjob, adb, fastboot, glob, imageDirStore } from "../../global"

  let imageDir: string
  imageDirStore.subscribe((value) => (imageDir = value))

  let flashing = false

  onMount(async () => {
    try {
      await microjob.start()

      await microjob.job(() => {
        flashing = true

        adb("reboot", "bootloader")
        fastboot(
          "flash",
          "bootloader",
          glob.sync(`${imageDir}/bootloader-*.img`)[0]
        )
        fastboot("reboot", "bootloader")
        fastboot("flash", "radio", glob.sync(`${imageDir}/radio-*.img`)[0])
        fastboot("reboot", "bootloader")
        fastboot(
          "--skip-reboot",
          "update",
          glob.sync(`${imageDir}/image-*.zip`)[0]
        )
        fastboot("reboot", "bootloader")
        fastboot("flash", "boot", `${imageDir}/magisk_patched.img`)
        fastboot("reboot")

        flashing = false
        return true
      })
    } catch (e) {
      console.error(e)
    } finally {
      await microjob.stop()
    }
  })
</script>

<span class="spacing-bottom">Rooting your phone</span>
{#if flashing}
  <Loader primary />
{:else}
  <StepDoneButton />
{/if}
