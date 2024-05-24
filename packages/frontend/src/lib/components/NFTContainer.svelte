<script>
  import { dndzone } from "svelte-dnd-action";
  import { onMount } from "svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { fly, fade } from "svelte/transition";
  import { flip } from "svelte/animate";

  export let videos = [];

  function handleDrop(event) {
    videos = event.detail.items;
  }
  function handleConsiderFinalize(event) {
    videos = event.detail.items;
  }

  let flipDuration = 100;
</script>

<div class="rounded-md border p-4">
  <section
    use:dndzone={{ items: videos }}
    on:consider={handleDrop}
    on:finalize={handleConsiderFinalize}
    class="min-h-52 p-4 border dark rounded-lg grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"
  >
    {#each videos as item, index (item.id)}
      <div
        class="flex flex-col items-center bg-gray-800 rounded-lg relative m-2"
        animate:flip={{ duration: flipDuration }}
      >
        <Badge class="absolute top-2 left-2">
          {index + 1}
        </Badge>
        <video
          class="h-40 object-cover rounded-lg"
          src={item.clip}
          autoplay
          loop
          muted
        />
      </div>
    {/each}
  </section>
</div>
