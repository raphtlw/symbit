<script lang="ts">
  import type { IStep } from "../global";

  export let steps: IStep[];
  export let current: IStep;
</script>

<style>
  ul {
    --step-number-size: 1.6rem;
    padding: 0.2rem 0.2rem;
  }
  .step {
    padding: 0.6rem 0.8rem;
    display: flex;
    flex-direction: row;
    border-radius: 8px;
  }
  .step-current {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .id {
    background-color: rgb(42, 51, 68);
    width: var(--step-number-size);
    height: var(--step-number-size);
    line-height: var(--step-number-size);
    font-size: 0.8rem;
    border-radius: 50%;
    text-align: center;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.178);
  }
  .name {
    align-self: center;
    margin-left: 0.8rem;
  }
</style>

<ul>
  {#each steps as step}
    <div class={`step ${current === step && 'step-current'}`}>
      <div class="id">{step.id}</div>
      <span class="name">{step.name}</span>
    </div>
  {/each}
</ul>
