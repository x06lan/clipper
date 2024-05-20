<script>
  import * as Card from "$lib/components/ui/card";
  export let id;
  export let name;
  export let price;
  export let img;
  export let css = "bg-white rounded-xl shadow-md overflow-hidden w-1/5";
</script>

<Card.Root class={css}>
  <div class="flex flex-col items-center">
    <div class="flex-shrink-0">
      <img
        class="aspect-square w-full object-cover hover:scale-110"
        src={img}
        alt={name}
      />
    </div>
    <div class="p-4 w-full text-center">
      <div
        class="uppercase tracking-wide text-sm text-indigo-500 font-semibold"
      >
        #{id}
      </div>
      <h1
        class="break-words block mt-1 text-lg leading-tight font-medium text-black"
        style="word-wrap: break-word; white-space: normal;"
      >
        {name}
      </h1>
      <p class="mt-2 text-gray-500">{price} ETH</p>
    </div>
  </div>
</Card.Root>
