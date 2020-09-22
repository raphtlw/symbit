<script lang="ts">
  import { pageHistory, currentPage } from "../global";
  import type { page } from "../global";

  let currentPageValue: page;
  let pageHistoryValue: page[];

  currentPage.subscribe((value) => {
    currentPageValue = value;
  });

  pageHistory.subscribe((value) => {
    pageHistoryValue = value;
  });

  function navigateBack() {
    pageHistoryValue.length > 1 &&
      currentPage.set(
        pageHistoryValue[
          pageHistoryValue.findIndex((element) => element == currentPageValue) -
            1
        ]
      );
  }

  function navigateForward() {
    pageHistoryValue.length > 1 &&
      currentPage.set(
        pageHistoryValue[
          pageHistoryValue.findIndex((element) => element == currentPageValue) +
            1
        ]
      );
  }
</script>

<style>
  main {
    padding: 2rem 2rem;
    width: 100%;
    display: flex;
    flex-direction: row;
  }
  button {
    background: none;
    outline: none;
    border: none;
  }
  .caret {
    margin-top: 2px;
    border: solid rgb(173, 173, 173);
    border-width: 0 2px 2px 0;
    padding: 4px;
    display: inline-block;
    margin-right: 0.2rem;
  }
  .caret-left {
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
  }
  .caret-right {
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
  }
  h1 {
    position: absolute;
    color: rgba(255, 255, 255, 0.808);
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    left: 50%;
    transform: translate(-50%, 0%);
  }
</style>

<main>
  <button on:click={navigateBack}><i class="caret caret-left" /></button><button on:click={navigateForward}><i
      class="caret caret-right" /></button>
  <h1>
    {#if currentPageValue === 'index'}
      Symbit
    {:else if currentPageValue === 'root'}
      Root
    {:else if currentPageValue === 'update'}Update{/if}
  </h1>
</main>
