<script>
  export let names = [];
  import Draggable from "./Draggable.svelte";
</script>

<div>
  <h1>Editing NFT</h1>
  <ul>
    {#each names as url}
      <li>{url}</li>
      <Draggable name={url} />
    {/each}
  </ul>
</div>
