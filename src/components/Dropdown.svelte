<script lang="ts">
  import { fly } from "svelte/transition"
  import { cubicOut } from "svelte/easing"

  export let value: string
  export let items: string[]
  let shown = false

  function toggleDropdown(e: Event) {
    e.stopPropagation()
    shown = !shown
  }

  function handleItemSelect(item: string) {
    shown = !shown
    value = item
  }
</script>

<style>
  main {
    --background: rgb(38, 40, 49);
    --width: 10rem;
    --font-size: 0.9rem;
  }
  button {
    background-color: var(--background);
    border: 1px solid rgba(131, 131, 131, 0.76);
    outline: none;
    border-radius: 4px;
    padding: 0.6rem 1rem;
    min-width: var(--width);
    text-align: start;
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size);
    cursor: pointer;
  }
  .caret {
    margin-top: 2px;
    border: solid rgb(173, 173, 173);
    border-width: 0 2px 2px 0;
    padding: 3px;
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
  }
  .dropdown-content {
    border: 1px solid rgba(156, 156, 156, 0.329);
    margin-top: 0.2rem;
    background-color: var(--background);
    position: absolute;
    min-width: var(--width);
    z-index: 2;
    border-radius: 4px;
    box-shadow: 0px 0px 2px rgba(158, 158, 158, 0.315);
  }
  .dropdown-content p {
    font-size: var(--font-size);
    padding: 0.4rem 1rem;
    cursor: pointer;
  }
  .dropdown-content p:hover {
    background-color: rgba(139, 139, 139, 0.336);
  }
</style>

<svelte:window on:click={() => (shown = false)} />

<main>
  <button on:click={toggleDropdown}>
    <span>{value}</span><i class="caret" />
  </button>
  {#if shown}
    <div
      transition:fly={{ y: -40, duration: 350, easing: cubicOut }}
      class="dropdown-content">
      {#each items as item}
        <p on:click={() => handleItemSelect(item)}>{item}</p>
      {/each}
    </div>
  {/if}
</main>
