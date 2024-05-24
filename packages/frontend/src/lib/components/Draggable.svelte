<script>
  import { FileVideo } from "lucide-svelte";
  export let left = 30;
  export let top = 30;
  let moving = false;
  export let index = 0;
  export let name = "NFT";
  function start() {
    moving = true;
  }

  function stop() {
    moving = false;
  }

  function move(e) {
    if (moving) {
      left += e.movementX;
      top += e.movementY;
    }
  }

  //$: console.log(moving)
</script>

<svelte:window on:mousemove={move} on:mouseup={stop} />
<button
  on:mousedown={start}
  style="left: {left}px; top: {top}px"
  class="draggable"
  ><FileVideo />
  <!-- {name} -->
</button>

<style>
  .draggable {
    user-select: none;
    position: absolute;
    border: solid 1px gray;
    cursor: move;
  }
</style>
