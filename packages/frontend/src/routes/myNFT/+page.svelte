<script>
  import { nfts } from "../../placeholder/nfts.json";
  //   export let nfts = [];
  import NftCard from "$lib/components/NFTCard.svelte";
</script>

<div class="flex flex-wrap gap-4 mx-2">
  {#each nfts as nft}
    <NftCard
      {...nft}
      css="bg-white rounded-xl shadow-md overflow-hidden w-1/5"
    />
  {/each}
</div>
