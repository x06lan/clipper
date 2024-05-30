<script>
  import { dndzone } from "svelte-dnd-action";
  import { Badge } from "$lib/components/ui/badge";
  import { flip } from "svelte/animate";
  import CreateNftPreview from "$lib/components/CreateNFTPreview.svelte";
  import loadingGif from "$lib/images/loading.gif";
  import { writable } from "svelte/store";

  export let videos = writable([]);

  function handleDrop(event) {
    videos.set(event.detail.items);
  }
  function handleConsiderFinalize(event) {
    videos.set(event.detail.items);
  }
  export let css =
    "min-h-52 p-4 border dark rounded-lg grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4";

  let flipDuration = 100;
  export let variant = "default";
  let loading = {};
  $: {
    $videos.forEach((video) => {
      if (!(video.id in loading)) {
        loading[video.id] = true;
      }
    });
  }
</script>

<div>
  <section
    use:dndzone={{ items: $videos }}
    on:consider={handleDrop}
    on:finalize={handleConsiderFinalize}
    class={css}
  >
    {#if variant === "default"}
      {#each $videos as item, index (item.id)}
        <div
          class="flex flex-col items-center bg-gray-800 rounded-lg relative m-2"
          animate:flip={{ duration: flipDuration }}
        >
          <Badge class="absolute top-2 left-2">
            {index + 1}
          </Badge>
          {#if loading[item.id]}
            <img
              src={loadingGif}
              alt="Loading..."
              class="h-40 object-cover rounded-lg"
            />
          {/if}
          <video
            class="h-40 object-cover rounded-lg {loading[item.id]
              ? 'hidden'
              : ''}"
            src={item.clip}
            autoplay
            loop
            muted
            on:loadeddata={() => (loading[item.id] = false)}
          />

          <span
            class="mt-1 text-center rounded text-white bg-slate-400 overflow-hidden text-ellipsis whitespace-nowrap w-full max-w-xs"
          >
            {item.name}
          </span>
        </div>
      {/each}
    {:else if variant === "create"}
      {#each $videos as item, index (item.id)}
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
