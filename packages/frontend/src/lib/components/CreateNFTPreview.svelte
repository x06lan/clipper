<script>
  export let file = null;
  export let index = null;
  export let preview = null;
  export let removeFile = null;
  import { Badge } from "$lib/components/ui/badge";
  import { CircleX } from "lucide-svelte";
  import loadingGif from "$lib/images/loading.gif";
  let loading = true;
</script>

<div
  class="video-container flex flex-col items-center bg-gray-800 rounded-lg relative m-2"
>
  <Badge class="absolute top-2 left-2">
    {index + 1}
  </Badge>
  {#if loading}
    <img src={loadingGif} alt="Loading..." class="object-cover rounded-lg" />
  {/if}
  <video
    class="w-fill h-40 object-cover rounded-lg {loading ? 'hidden' : ''}"
    src={preview}
    autoplay
    loop
    muted
    on:loadeddata={() => (loading = false)}
  />
  <span
    class="mt-1 text-center text-white overflow-hidden text-ellipsis whitespace-nowrap w-full max-w-xs"
  >
    {file.name}
  </span>
  <button
    type="button"
    class="absolute top-2 right-2 text-white rounded-full p-1"
    on:click={() => removeFile(index)}
  >
    <CircleX class="w-4 h-4" />
  </button>
</div>

<style>
  .video-container {
    position: relative;
    transition: transform 0.2s ease;
  }
  .video-container:hover {
    transform: scale(1.05);
  }
</style>
