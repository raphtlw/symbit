<script lang="ts">
  import type { page } from "../../global"
  import { currentPage } from "../../global"

  let currentPageValue: page

  currentPage.subscribe((value) => (currentPageValue = value))
</script>

{#if currentPageValue === 'root'}
  <span>Your phone has been successfully rooted! 🚀</span>
{:else if currentPageValue === 'update'}
  <span>Your phone has been successfully updated to the latest version of
    Android! 🚀
  </span>
{/if}
