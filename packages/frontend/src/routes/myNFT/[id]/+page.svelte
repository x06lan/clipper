<script>
  import { Button } from "$lib/components/ui/button";
  import SimplePlayer from "$lib/components/SimplePlayer.svelte";
  import { onMount } from "svelte";
  import { GetUSDExchangeRate } from "$lib/utils.js";
  import {
    defaultEvmStores as evm,
    contracts,
    selectedAccount,
  } from "svelte-web3";
  import {
    getFileFromIPFS,
    CONTRACT_ABI,
    CONTRACT_ADDRESS,
  } from "$lib/utils.js";

  export let data;
  let nft = data.nftData.nft;
  let usdPrice = "";

  onMount(async () => {
    await evm.setProvider();
    await evm.attachContract("Clipper", CONTRACT_ADDRESS, CONTRACT_ABI);
    await fetchNFTData();
    fetchUSDPrice();
  });

  const fetchUSDPrice = async () => {
    usdPrice = "$" + (await GetUSDExchangeRate(nft.price));
  };

  async function fetchNFTData() {
    let id = data.nftData.id;
    const info = await $contracts.Clipper.methods
      .tokenInfo(id)
      .call({ from: $selectedAccount });
    nft = {
      id: id,
      name: info.name,
      img: getFileFromIPFS(info.image_cid),
      videos: await Promise.all(
        info.clips.map(async (clip_id) => {
          const result = await $contracts.Clipper.methods
            .clipInfo(clip_id)
            .call({ from: $selectedAccount });
          return getFileFromIPFS(result.video_cid);
        })
      ),
      price: info.price,
      description: info.description,
    };
  }
</script>

{#if nft}
  <!-- <div class="h-52"> -->
  <!-- <div class="h-screen"> -->
  <SimplePlayer videos={nft.videos} controls={true} css={"h-[80vh]"} />
  <!-- </div> -->
  <!-- </div> -->
  <div class="container mx-auto p-4">
    <div class="flex flex-col lg:space-x-8 mt-4">
      <!-- NFT Details Section -->
      <div class="flex-grow w-full lg:w-1/3 space-y-4">
        <div class="text-3xl font-bold">{nft.name}</div>
        <div class="text-lg text-gray-400">#{nft.id}</div>
        <div class="text-gray-500">
          Owned by
          {#await $contracts.Clipper.methods.ownerOf(nft.id).call()}
            ...
          {:then owner}
            <span class="text-blue-500">{owner}</span>
          {/await}
        </div>
        <div class="text-xl font-bold flex items-center space-x-2">
          <span>{nft.price} ETH</span>
          <span class="text-sm text-gray-500">{usdPrice}</span>
        </div>
        <div class="flex space-x-2">
          <Button
            variant="primary"
            class="w-full lg:w-1/2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Sell
          </Button>
        </div>
        <!-- NFT Image Section -->
        <div class="flex-shrink-0 w-full lg:w-2/3 mt-4 lg:mt-0">
          <div class="rounded-lg shadow-lg">
            <img
              src={nft.img}
              alt="NFT"
              class="nft-image w-full h-auto rounded-lg object-cover"
            />
          </div>
        </div>
        <div class="text-sm text-red-500">Supports creator</div>
        <div class="mt-6">
          <h3 class="text-lg font-semibold">Description</h3>
          <p class="text-gray-400">{nft.description}</p>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .container {
    background-color: #1a1a1a;
    color: #f1f1f1;
  }
</style>
