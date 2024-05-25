<script>
  import * as Card from "$lib/components/ui/card";
  import SimplePlayer from "./SimplePlayer.svelte";
  import { CircleCheck } from "lucide-svelte";
  import { get } from "svelte/store";

  export let id = null;
  export let name = null;
  export let price = null;
  export let img = null;
  export let videos = null;
  export let redirect = null;
  export let variant = "default";
  export let selected = false;
  export let css =
    "flex flex-col items-center bg-gray-800 p-4 hover:bg-gray-700 transition rounded-lg shadow-lg overflow-hidden";
  let s_id = id.toString();
  let isHovered = false;

  // Counter for selected cards
  export let toggleSelect = () => {};
  export let selectedCount = null;
  function handleToggleSelect() {
    const count = get(selectedCount);
    if (selected || (!selected && count < 2)) {
      selected = !selected;
      toggleSelect(id, selected);
    }
  }
</script>

{#if variant === "default" || variant === "animated"}
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
        {#if !isHovered || !variant === "default"}
          <img
            class="aspect-square w-full object-cover hover:scale-105 transition-transform duration-200 ease-in-out"
            src={img}
            alt={name}
          />
        {:else}
          <SimplePlayer
            {videos}
            css={"aspect-square w-full"}
            controls={false}
          />
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
{:else if variant === "select"}
  <!-- svelte-ignore a11y-invalid-attribute -->
  <button
    class="w-full relative"
    tabindex="-1"
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
    on:click={handleToggleSelect}
  >
    <Card.Root class={css}>
      {#if selected}
        <div
          class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <CircleCheck class="w-16 h-16 text-green-500" />
        </div>
      {/if}
      <div class="flex-shrink-0 w-full relative">
        {#if !isHovered}
          <img
            class="aspect-square w-full object-cover hover:scale-105 transition-transform duration-200 ease-in-out"
            src={img}
            alt={name}
          />
        {:else}
          <SimplePlayer
            {videos}
            css={"aspect-square w-full"}
            controls={false}
          />
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
  </button>
{/if}
