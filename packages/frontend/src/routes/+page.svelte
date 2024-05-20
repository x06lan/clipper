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
<body>
  <div class="flex flex-wrap gap-4 mx-2">
    {#each nfts as nft}
      <NftCard {...nft} />
    {/each}
  </div>
</body>
