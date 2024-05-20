<script>
  export let names = [];
  import Draggable from "./Draggable.svelte";
  export const getNewPosition = (x, y) => {
    let min_dis = 1000000000;
    let min_x = 0;
    let min_y = 0;
    for (let i = 0; i < names.length; i++) {
      let dis = Math.sqrt((x - names[i].left) ** 2 + (y - names[i].top) ** 2);
      if (dis < min_dis) {
        min_dis = dis;
        min_x = names[i].left;
        min_y = names[i].top;
      }
    }
    // exchange the position of the two elements
    return { x: min_x, y: min_y };
  };
  export let left = 500;
  export let top = 500;

  let offset = 10;
</script>

<div>
  <h1>Editing NFT</h1>
  <ul>
    {#each names as { url }, i}
      <li>{url}</li>
      <Draggable name={url} left={left + offset * i} {top} />
    {/each}
  </ul>
</div>
