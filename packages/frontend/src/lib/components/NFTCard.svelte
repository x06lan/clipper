<script>
  import * as Card from "$lib/components/ui/card";
  import SimplePlayer from "./SimplePlayer.svelte";
  export let id;
  export let name;
  export let price;
  export let img;
  export let videos;
  export let redirect;
  export let css =
    "flex flex-col items-center bg-gray-800 p-4 hover:bg-gray-700 transition rounded-lg shadow-lg overflow-hidden";
  let s_id = id.toString();
  let isHovered = false;
</script>

<a
  href="/{redirect}/{id}"
  class="w-full"
  on:mouseover={() => {
    isHovered = true;
  }}
  on:focus={() => {
    isHovered = true;
  }}
  on:mouseout={() => {
    isHovered = false;
  }}
  on:blur={() => {
    isHovered = false;
  }}
>
  <Card.Root class={css}>
    <div class="flex-shrink-0 w-full relative">
      {#if !isHovered || !videos}
        <img
          class="aspect-square w-full object-cover hover:scale-105 transition-transform duration-200 ease-in-out"
          src={img}
          alt={name}
        />
      {:else}
        <SimplePlayer {videos} css={"aspect-square w-full"} />
      {/if}
    </div>
    <div class="mt-4 w-full text-center text-white">
      <div class="text-lg font-bold">{name}</div>
      <div
        class="uppercase tracking-wide text-sm text-gray-400 font-semibold text-wrap"
      >
        #{s_id}
      </div>
      <p class="mt-2 text-gray-400">{price} ETH</p>
    </div>
  </Card.Root>
</a>
