<script>
  import welcome from "$lib/images/svelte-welcome.webp";
  import welcome_fallback from "$lib/images/svelte-welcome.png";
  import NftCard from "$lib/components/NFTCard.svelte";
  import { nfts } from "../placeholder/nfts.json";
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>
<div class="container mx-auto p-4">
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
  >
    <!-- {#each nfts as nft}
      <NftCard {...nft} redirect={"nft"} />
    {/each} -->
  </div>
</div>
