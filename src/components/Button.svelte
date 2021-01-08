<script lang="ts">
  export let label: string
  export let onClick: svelte.JSX.EventHandler
</script>

<style>
  button {
    padding: 0.6rem 1.2rem;
    border-radius: 4px;
    border: none;
    outline: none;
    background-color: rgb(43, 52, 68);
    color: rgb(238, 238, 238);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.199);
    transition: all ease-out 0.1s;
  }
  button:hover {
    box-shadow: 0px 8px 14px rgba(0, 0, 0, 0.212);
    transform: translateY(-1px);
  }
  button:active {
    transform: scale(0.96);
  }
</style>

<main><button on:click={onClick}>{label}</button></main>
