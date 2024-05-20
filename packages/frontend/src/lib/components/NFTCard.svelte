<script>
  import * as Card from "$lib/components/ui/card";
  export let id;
  export let name;
  export let price;
  export let img;
  export let css =
    "bg-gray-800 rounded-xl shadow-lg overflow-hidden w-full sm:w-1/2 lg:w-1/3 xl:w-1/4";
</script>

<a href="/nft/{id}" class="block p-2 hover:bg-gray-700 transition">
  <Card.Root class={css}>
    <div class="flex flex-col items-center">
      <div class="flex-shrink-0 w-full">
        <img
          class="aspect-square w-full object-cover hover:scale-105 transition-transform duration-200 ease-in-out"
          src={img}
          alt={name}
        />
      </div>
      <div class="p-4 w-full text-center text-white">
        <div class="text-lg font-bold">{name}</div>
        <div
          class="uppercase tracking-wide text-sm text-gray-400 font-semibold"
        >
          #{id}
        </div>
        <p class="mt-2 text-gray-400">{price} ETH</p>
      </div>
    </div>
  </Card.Root>
</a>
