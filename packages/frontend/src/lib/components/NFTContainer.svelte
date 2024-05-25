<script>
  import { dndzone } from "svelte-dnd-action";
  import { Badge } from "$lib/components/ui/badge";
  import { flip } from "svelte/animate";
  import CreateNftPreview from "$lib/components/CreateNFTPreview.svelte";

  export let videos = [];

  function handleDrop(event) {
    videos = event.detail.items;
  }
  function handleConsiderFinalize(event) {
    videos = event.detail.items;
  }
  export let css =
    "flex flex-col items-center bg-gray-800 p-4 hover:bg-gray-700 transition rounded-lg shadow-lg overflow-hidden";
  let flipDuration = 100;
  export let variant = "default";
</script>

<div>
  <section
    use:dndzone={{ items: videos }}
    on:consider={handleDrop}
    on:finalize={handleConsiderFinalize}
    class={css}
  >
    {#if variant === "default"}
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
    {:else if variant === "create"}
      {#each videos as item, index (item.id)}
        <CreateNftPreview
          file={item.file}
          {index}
          preview={item.preview}
          removeFile={item.removeFile}
        />
      {/each}
    {/if}
  </section>
</div>
