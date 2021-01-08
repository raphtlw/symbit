<script lang="ts">
  import { Loader, StepDoneButton } from "../../components"
  import { onMount } from "svelte"

  const flashWorker = new Worker("./flash.js")

  onMount(() => {
    flashWorker.postMessage("start")
    flashing = true
    flashWorker.onmessage = (e) => {
      if (e.data == "done") flashing = false
    }
  })

  let flashing: boolean = false
</script>

<span class="spacing-bottom">Rooting your phone</span>
{#if flashing}
  <Loader primary />
{:else}
  <StepDoneButton />
{/if}
