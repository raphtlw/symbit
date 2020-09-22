<script lang="ts">
  import type { IStep } from "../global";
  export let step: IStep;
</script>

<style>
  main {
    border: 2px solid rgba(199, 199, 199, 0.123);
    padding: 2rem 2rem;
    border-radius: 10px;
  }
  h1,
  h2 {
    color: rgb(226, 226, 226);
  }
  h1 {
    font-size: 1.1rem;
    font-weight: 500;
  }
  h2 {
    font-size: 1rem;
    font-weight: 400;
    color: rgba(226, 226, 226, 0.9);
    margin-top: 0.6rem;
    margin-bottom: 1.2rem;
  }
</style>

<main>
  <h1>{step.name}</h1>
  <h2>{step.description}</h2>
  <slot />
</main>
