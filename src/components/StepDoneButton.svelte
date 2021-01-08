<script lang="ts">
  import Button from "./Button.svelte"
  import { nextStep } from "../global"
</script>

<style>
  .wrapper {
    margin-top: 1.4rem;
  }
</style>

<div class="wrapper">
  <Button label="Done" onClick={nextStep} />
</div>
