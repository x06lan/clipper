<script>
  import NftContainer from "$lib/components/NFTContainer.svelte";
  import NftCard from "$lib/components/NFTCard.svelte";
  import { Button } from "$lib/components/ui/button";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { Upload } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { goto } from "$app/navigation";
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
    uploadToIPFS,
    constructTokenURI,
  } from "$lib/utils.js";
  import Loading from "$lib/components/Loading.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";

  let loading = true;
  let nfts = [];
  let selectedIDs = [];
  let isFusable = false;
  let nftName = "";
  let expectedLength = null;
  let thumbnailPreview = writable(null);

  const thumbnail = writable(null);
  const showErrorDialog = writable(false);
  const errorMessage = writable("");
  const clips1 = writable([]);
  const clips2 = writable([]);
  const clipsResult = writable([]);

  onMount(async () => {
    await evm.setProvider();
    await evm.attachContract("Clipper", CONTRACT_ADDRESS, CONTRACT_ABI);
    await fetchNFTData();
    loading = false;
  });

  function handleThumbnailChange(event) {
    const file = event.target.files[0];
    if (file) {
      thumbnail.set(file);
      const reader = new FileReader();
      reader.onload = (e) => thumbnailPreview.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handleThumbnailDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      thumbnail.set(file);
      const reader = new FileReader();
      reader.onload = (e) => thumbnailPreview.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

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
          id,
          name: info.name,
          img: getFileFromIPFS(info.image_cid),
          videos: await Promise.all(
            info.clips.map(async (clip_id) => {
              const result = await $contracts.Clipper.methods
                .clipInfo(clip_id)
                .call({ from: $selectedAccount });
              return {
                cid: clip_id,
                clip: getFileFromIPFS(result.video_cid),
                name: result.name,
              };
            })
          ),
          price: info.price,
          selling: info.selling,
          parent: info.parent,
          children: info.children,
        };
      })
    );
  }

  let selectedCount = writable(0);

  function toggleSelect(id, selected) {
    selectedCount.update((count) => {
      if (selected) {
        if (count < 2) {
          selectedIDs.push(id);
          return count + 1;
        } else {
          return count;
        }
      } else {
        selectedIDs = selectedIDs.filter((item) => item !== id);
        return count - 1;
      }
    });
    if (selectedIDs.length === 2) {
      isFusable = true;
    } else {
      isFusable = false;
    }
    return selectedIDs.length;
  }

  function findNftById(id) {
    return nfts.find((nft) => nft.id === id);
  }

  let fusing = false;
  let executing = false;
  let tokenId = null;

  async function _fuse() {
    const clipsArray = $clipsResult.map((clip) => clip.cid);

    // Upload thumbnail to IPFS
    const thumbnailCid = await uploadToIPFS($thumbnail);
    if (!thumbnailCid) {
      console.error("Failed to upload thumbnail to IPFS");
      return; // or handle the error as needed
    }
    let seed = Math.floor(Math.random() * 1000000000);
    let tokenURI = constructTokenURI(
      nftName,
      thumbnailCid.Hash,
      "",
      getFileFromIPFS(clipsArray[0])
    );
    const result = await $contracts.Clipper.methods
      .fuse(
        selectedIDs[0],
        selectedIDs[1],
        nftName,
        thumbnailCid.Hash,
        "", // description FIXME
        tokenURI,
        seed,
        clipsArray
      )
      .send({ from: $selectedAccount })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
      })
      .on("receipt", (receipt) => {
        console.log("Receipt:", receipt);
      })
      .on("error", (error) => {
        console.error("Error minting NFT:", error);
        executing = false;
      });
    console.log("Result:", result.events.Transfer.returnValues.tokenId);
    return result.events.Transfer.returnValues.tokenId.toString().slice(0, -1);
  }

  const fuse = async () => {
    // find the third section and count the videos
    if (!nftName || !thumbnail || $clipsResult.length !== expectedLength) {
      showErrorDialog.set(true);
      errorMessage.set("Please provide a valid name, thumbnail, and clips.");
      return;
    }
    executing = true;
    tokenId = await _fuse();
    executing = false;
  };
</script>

<Dialog.Root bind:open={$showErrorDialog}>
  <Dialog.Trigger />
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Error</Dialog.Title>
      <Dialog.Description>{$errorMessage}</Dialog.Description>
      <Button on:click={() => ($showErrorDialog = false)}>Close</Button>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={tokenId}>
  <Dialog.Trigger />
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Fuse Success!</Dialog.Title>
      <Dialog.Description class="truncate">
        The NFT has been fused successfully.<br /> New token ID: {tokenId}
      </Dialog.Description>
      <Button on:click={() => goto(`/myNFT`)}>View Owned NFT</Button>
      <Button on:click={() => location.reload()}>Fuse Another</Button>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

{#if loading || executing}
  <Loading />
{/if}
{#if !fusing}
  <div class="container mx-auto p-4">
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {#each nfts as nft}
        <NftCard
          id={nft.id}
          name={nft.name}
          img={nft.img}
          videos={nft.videos.map((video) => video.clip)}
          price={nft.price}
          selling={nft.selling}
          variant="select"
          selected={false}
          {selectedCount}
          {toggleSelect}
        />
      {/each}
    </div>
  </div>
  {#if !loading}
    <Button
      variant="default"
      class="w-full items-center lg:w-1/2 mx-auto"
      on:click={() => {
        if (selectedIDs.length !== 2) {
          showErrorDialog.set(true);
          errorMessage.set("Please select exactly 2 NFTs to fuse.");
          return;
        }
        fusing = true;
        clips1.set(findNftById(selectedIDs[0]).videos);
        clips2.set(findNftById(selectedIDs[1]).videos);
        let idx = 0;
        clips1.update((clips) =>
          clips.map((c) => ({
            id: idx++,
            clip: c.clip,
            name: c.name,
            cid: c.cid,
          }))
        );
        clips2.update((clips) =>
          clips.map((c) => ({
            id: idx++,
            clip: c.clip,
            name: c.name,
            cid: c.cid,
          }))
        );
        isFusable = false;
        expectedLength = $clips1.length + $clips2.length;
      }}
    >
      Fuse
    </Button>
  {/if}
{:else}
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">
      Token <span class="text-gray-500">
        #{selectedIDs[0]}
      </span>
    </h1>
    <NftContainer videos={clips1} />
    <h1 class="text-2xl font-bold mb-4">
      Token <span class="text-gray-500">
        #{selectedIDs[1]}
      </span>
    </h1>
    <NftContainer videos={clips2} />
    <h1 class="mt-2 text-2xl font-bold mb-4">Fused Token</h1>
    <NftContainer videos={clipsResult} />
    <div class="flex">
      <div
        class="max-w-72 min-w-60 mt-4 mb-4 border-2 border-dashed border-gray-500 rounded-lg p-4 text-center mr-4"
        role="button"
        tabindex="0"
        on:dragover={handleThumbnailDrop}
        on:drop={handleThumbnailDrop}
      >
        <label for="thumbnail-upload" class="block text-sm font-medium mb-1">
          Upload Thumbnail
        </label>
        <input
          type="file"
          accept="image/*"
          on:change={handleThumbnailChange}
          class="hidden"
          id="thumbnail-upload"
        />
        <label for="thumbnail-upload" class="cursor-pointer">
          <div class="flex flex-col items-center justify-center">
            {#if $thumbnailPreview}
              <img
                src={$thumbnailPreview}
                alt="Thumbnail Preview"
                class="h-fit rounded-lg mb-2"
              />
            {:else}
              <Upload class="w-16 h-16 mb-2" />
              <p class="text-gray-400">
                Drag and drop media<br />or<br /><span
                  class="text-blue-400 underline">Browse files</span
                >
              </p>
              <p class="text-gray-400 text-sm">
                Max size: 50MB<br />JPG, PNG, GIF, SVG, MP4
              </p>
            {/if}
          </div>
        </label>
      </div>
      <div class="flex-grow">
        <h1 class="mt-2 text-2xl font-bold mb-4">Token Name</h1>
        <Textarea
          class="mt-1 border p-8 text-3xl min-h-48"
          bind:value={nftName}
        />
      </div>
    </div>
    {#if !loading}
      <Button
        variant="primary"
        class="w-full items-center mt-2 mx-auto"
        on:click={fuse}
      >
        Confirm Fuse
      </Button>
    {/if}
  </div>
{/if}
