<script>
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import SimplePlayer from "$lib/components/SimplePlayer.svelte";
  import { onMount } from "svelte";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { GetUSDExchangeRate } from "$lib/utils.js";
  import * as Dialog from "$lib/components/ui/dialog";
  import {
    defaultEvmStores as evm,
    contracts,
    selectedAccount,
    web3,
  } from "svelte-web3";
  import {
    getFileFromIPFS,
    CONTRACT_ABI,
    CONTRACT_ADDRESS,
  } from "$lib/utils.js";
  import Loading from "$lib/components/Loading.svelte";
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

  let loading = false;
  let listSuccess = false;
  async function fetchNFTData() {
    loading = true;
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
      selling: info.selling,
      children: info.children,
      parent: info.parent,
    };
    loading = false;
  }
  let listingPrice = 0;
  async function listForSale() {
    loading = true;
    listingPrice = listingPrice * 10 ** 18;
    const result = await $contracts.Clipper.methods
      .sell(nft.id, listingPrice)
      .send({ from: $selectedAccount })
      .on("receipt", (receipt) => {
        console.log(receipt);
      })
      .on("error", (error) => {
        console.error(error);
      });
    if (result) {
      loading = false;
      listSuccess = true;
      nft.selling = true;
      nft.price = listingPrice;
      fetchUSDPrice();
    }
    // invalidateAll();
  }
</script>

{#if loading}
  <Loading />
{/if}
{#if nft}
  <SimplePlayer videos={nft.videos} controls={true} css={"h-[80vh]"} />

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
        {#if nft.selling}
          <div class="text-xl font-bold flex items-center space-x-2">
            <span>{$web3.utils.fromWei(nft.price, "ether")} ETH</span>
            <span class="text-sm text-gray-500">{usdPrice}</span>
          </div>
        {/if}
        <div class="flex space-x-2">
          {#if nft.selling}
            <Button
              variant="primary"
              class="w-full lg:w-1/2 bg-red-500 text-white rounded transition"
            >
              Cancel listing
            </Button>
          {:else}
            <Dialog.Root>
              <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
                List for sale
              </Dialog.Trigger>
              <Dialog.Content>
                {#if loading}
                  <Loading />
                {:else if !listSuccess}
                  <Dialog.Header>
                    <Dialog.Title>List for sale</Dialog.Title>
                    <Dialog.Description>
                      Enter the price you want to list this NFT for sale.
                    </Dialog.Description>
                  </Dialog.Header>
                  <div class="grid gap-4 py-4">
                    <Label for="price">Price (ETH)</Label>
                    <Input type="number" id="price" bind:value={listingPrice} />
                  </div>
                  <Dialog.Footer>
                    <Button
                      variant="primary"
                      class="w-full bg-green-500 text-white rounded hover:bg-green-600 transition"
                      on:click={listForSale}
                    >
                      List for sale
                    </Button>
                  </Dialog.Footer>
                {:else}
                  <Dialog.Header>
                    <Dialog.Title>Success</Dialog.Title>
                    <Dialog.Description>
                      Your NFT has been listed for sale.
                    </Dialog.Description>
                  </Dialog.Header>
                  <Dialog.Footer>
                    <Button
                      variant="primary"
                      class="w-full bg-green-500 text-white rounded hover:bg-green-600 transition"
                      on:click={() => (listSuccess = false)}
                    >
                      Close
                    </Button>
                  </Dialog.Footer>
                {/if}
              </Dialog.Content>
            </Dialog.Root>
          {/if}
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
{:else}
  <Loading />
{/if}

<style>
  .container {
    background-color: #1a1a1a;
    color: #f1f1f1;
  }
</style>
