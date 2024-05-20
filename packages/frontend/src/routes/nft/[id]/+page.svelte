<script>
  /** @type {import('./$types').PageData} */
  export let data;
  let nft = data.props.nft;
</script>

<div class="container mx-auto p-4">
  <div class="layout">
    <div>
      <img src={nft.img} alt="NFT" class="nft-image rounded-lg shadow-lg" />
    </div>
    <div class="space-y-4">
      <div class="text-2xl font-bold">{nft.name}</div>
      <div class="text-lg">#{nft.id}</div>
      <div>Owned by {nft.owner}</div>
      <div class="text-xl font-bold">
        {nft.price} ETH
        <span class="text-sm text-gray-500">(${nft.price})</span>
      </div>
      <button class="bg-blue-500 text-white px-4 py-2 rounded">Buy now</button>
      <div>Sale ends {nft.saleEnd}</div>
    </div>
  </div>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
  }
  .nft-image {
    max-width: 100%;
  }
</style>
