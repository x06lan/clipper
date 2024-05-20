<script>
  import { nfts } from "../../placeholder/nfts.json";
  //   export let nfts = [];
  import NftCard from "$lib/components/NFTCard.svelte";
</script>

<div class="container mx-auto p-4">
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
  >
    {#each nfts as nft}
      <NftCard {...nft} />
    {/each}
  </div>
</div>
