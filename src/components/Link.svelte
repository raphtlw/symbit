<script lang="ts">
  import { remote } from "../global";

  export let href: string;
</script>

<style>
  .link:hover {
    cursor: pointer;
    text-decoration: underline;
  }
</style>

<span on:click={() => remote.shell.openExternal(href)} class="link">
  <slot />
</span>
