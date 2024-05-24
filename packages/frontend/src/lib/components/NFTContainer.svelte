<script>
  import { dndzone } from "svelte-dnd-action";
  export let videos = [];
  export let onDrop;
  import { Badge } from "$lib/components/ui/badge";
  import { CircleX } from "lucide-svelte";
  import { fly, fade } from "svelte/transition";

  function handleDrop(event) {
    onDrop(event.detail.items);
  }
  function removeFile(index) {
    videos.update((files) => files.filter((_, i) => i !== index));
  }
</script>

<div
  class="p-4 border rounded dark"
  use:dndzone={{ items: videos, onDrop: handleDrop }}
>
  {#each videos as { file, preview }, index (file.name)}
    <div
      role="button"
      tabindex="0"
      class="video-container flex flex-col items-center bg-gray-800 rounded-lg relative m-2"
      in:fly={{ x: 50 }}
      out:fade={{ x: -50 }}
      draggable="true"
    >
      <Badge class="absolute top-2 left-2">
        {index + 1}
      </Badge>
      <video
        class="w-fill h-40 object-cover rounded-lg"
        src={preview}
        autoplay
        loop
        muted
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
  {/each}
</div>
