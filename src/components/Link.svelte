<script lang="ts">
  import { remote } from "../global";

  export let href: string;
</script>

<style>
  .link {
    text-decoration: underline;
  }
  .link:hover {
    cursor: pointer;
  }
</style>

<span on:click={() => remote.shell.openExternal(href)} class="link">
  <slot />
</span>
