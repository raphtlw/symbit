<script lang="ts">
  import Button from "./Button.svelte";

  export let onClick: svelte.JSX.EventHandler;
</script>

<style>
  .wrapper {
    margin-top: 1.4rem;
  }
</style>

<div class="wrapper">
  <Button label="Done" {onClick} />
</div>
