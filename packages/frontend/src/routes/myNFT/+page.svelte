<script>
  //   export let nfts = [];
  import NftCard from "$lib/components/NFTCard.svelte";
  import { onMount } from "svelte";
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
  onMount(async () => {
    await evm.setProvider();
    await evm.attachContract("Clipper", CONTRACT_ADDRESS, CONTRACT_ABI);
    await fetchNFTData();
  });
  let nfts = [];
  async function fetchNFTData() {
    let nftIds = await $contracts.Clipper.methods
      .ownedTokens()
      .call({ from: $selectedAccount });
    nfts = await Promise.all(
      nftIds.map(async (id) => {
        const info = await $contracts.Clipper.methods
          .tokenInfo(id)
          .call({ from: $selectedAccount });
        return {
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
        };
      })
    );
  }
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
