<script lang="ts">
  import { Loader, StepDoneButton } from "../../components";
  import { adb, fastboot, glob, imageDirStore } from "../../global";
  import { onMount } from "svelte";

  // @ts-ignore
  import FlashWorker from "web-worker:./Flash";
  const flashWorker: Worker = new FlashWorker();

  onMount(() => {
    flashWorker.postMessage("start");
    flashing = true;
    flashWorker.onmessage = (e) => {
      if (e.data == "done") flashing = false;
    };
  });

  let flashing: boolean = false;
</script>

<span class="spacing-bottom">Rooting your phone</span>
{#if flashing}
  <Loader primary />
{:else}
  <StepDoneButton />
{/if}
