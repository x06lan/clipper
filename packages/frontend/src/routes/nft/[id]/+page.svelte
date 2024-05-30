<script>
  /** @type {import('./$types').PageData} */
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { GetUSDExchangeRate } from "$lib/utils.js";
  import { onMount } from "svelte";
  import Loading from "$lib/components/Loading.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
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
  import { goto } from "$app/navigation";
  export let data;
  let nft = data.nftData.nft;
  // Reactive variable for USD price
  let usdPrice = "";
  onMount(async () => {
    await evm.setProvider();
    await evm.attachContract("Clipper", CONTRACT_ADDRESS, CONTRACT_ABI);
    await fetchNFTData();
    fetchUSDPrice();
  });

  let loading = false;
  // Function to fetch and set the USD price
  const fetchUSDPrice = async () => {
    usdPrice = "$" + (await GetUSDExchangeRate(nft.price));
  };
  // Fetch USD price on component mount
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
      price: info.price,
      saleEnd: info.saleEnd,
      description: info.description,
    };
    owner = await $contracts.Clipper.methods.ownerOf(nft.id).call();
    owner = owner.toLowerCase();
    loading = false;
  }
  let owner = "";
  let success = false;
  // buy nft

  async function buyNFT() {
    if (owner == $selectedAccount) {
      alert("You already own this NFT");
      return;
    }
    loading = true;
    const result = await $contracts.Clipper.methods
      .buySellingToken(nft.id)
      .send({ from: $selectedAccount })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash: ", hash);
      })
      .on("receipt", (receipt) => {
        console.log("Transaction receipt: ", receipt);
      })
      .on("error", (error) => {
        console.error("Transaction error: ", error);
      });
    success = true;
    loading = false;
  }
</script>

<Dialog.Root
  bind:open={success}
  preventScroll={true}
  closeOnEscape={false}
  closeOnOutsideClick={false}
>
  <Dialog.Trigger />
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Mint Success!</Dialog.Title>
      <Dialog.Description class="truncate">
        The NFT has been bought successfully. <br />Token ID: {nft.id}
      </Dialog.Description>
      <Button on:click={() => goto(`/myNFT`)}>View Owned NFTs 🪙</Button>
      <Button on:click={() => goto("/")}>Browse Other NFTs 🚀</Button>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
{#if loading}
  <Loading />
{/if}
{#if nft}
  <div class="container mx-auto p-4">
    <div class="flex flex-col lg:flex-row lg:space-x-8">
      <!-- NFT Image Section -->
      <div class="flex-shrink-0 w-full lg:w-1/2">
        <Card.Root class="rounded-lg shadow-lg">
          <img src={nft.img} alt="NFT" class="nft-image rounded-lg" />
        </Card.Root>
      </div>

      <!-- NFT Details Section -->
      <div class="flex-grow mt-4 lg:mt-0 w-full lg:w-1/2 space-y-4">
        <div class="text-3xl font-bold">{nft.name}</div>
        <div class="text-lg text-gray-400 truncate mr-10">#{nft.id}</div>
        <div class="text-gray-500">
          Owned by
          {#if owner === $selectedAccount}
            <span class="text-blue-500">You</span>
          {:else}
            <span class="text-blue-500">{owner}</span>
          {/if}
        </div>
        <div class="text-xl font-bold flex items-center space-x-2">
          <span>{$web3.utils.fromWei(nft.price, "ether")} ETH</span>
          <span class="text-sm text-gray-500">{usdPrice}</span>
        </div>
        <div class="flex space-x-2 mr-8">
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild let:builder>
              <Button
                variant="primary"
                class="w-full lg:w-1/2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                builders={[builder]}
              >
                Buy now
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              {#if owner == $selectedAccount}
                <AlertDialog.Header>
                  <AlertDialog.Title
                    >You cannot buy yourselves NFT</AlertDialog.Title
                  >
                  <AlertDialog.Description>
                    This action cannot be done. You already own this NFT.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>Back</AlertDialog.Cancel>
                </AlertDialog.Footer>
              {:else}
                <AlertDialog.Header>
                  <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title
                  >
                  <AlertDialog.Description>
                    You will buy this NFT for {nft.price} ETH.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                  <AlertDialog.Action on:click={buyNFT}>Buy</AlertDialog.Action>
                </AlertDialog.Footer>
              {/if}
            </AlertDialog.Content>
          </AlertDialog.Root>

          <Button variant="outline" size="lg" class="w-full lg:w-1/2">
            Make offer
          </Button>
        </div>
        <div class="text-gray-400">Sale ends tomorrow</div>

        <!-- Support creator info -->
        <div class="text-sm text-red-500">Supports creator</div>

        <!-- Description Section -->
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
  .nft-image {
    width: 700px;
    height: 700px;
    object-fit: cover;
    border-bottom: 1px solid #333;
  }
  /* .button-wide {
    width: 100%;
  } */
  .text-lg {
    font-size: 1.125rem;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  /* .text-2xl {
    font-size: 1.5rem;
  } */
  .text-3xl {
    font-size: 1.875rem;
  }
</style>
