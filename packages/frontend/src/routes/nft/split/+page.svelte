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
  let selectedID = null;
  let isSplittable = false;
  let nftName1 = "";
  let nftName2 = "";
  let leftNFTdescription = "";
  let rightNFTdescription = "";
  let thumbnailPreview1 = writable(null);
  let thumbnailPreview2 = writable(null);

  const thumbnail1 = writable(null);
  const thumbnail2 = writable(null);

  const showErrorDialog = writable(false);
  const errorMessage = writable("");
  const clipsResult1 = writable([]);
  const clipsResult2 = writable([]);
  const clipsFrom = writable([]);

  onMount(async () => {
    await evm.setProvider();
    await evm.attachContract("Clipper", CONTRACT_ADDRESS, CONTRACT_ABI);
    await fetchNFTData();
    loading = false;
  });

  function handleThumbnail1Change(event) {
    const file = event.target.files[0];
    if (file) {
      thumbnail1.set(file);
      const reader = new FileReader();
      reader.onload = (e) => thumbnailPreview1.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handleThumbnail1Drop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      thumbnail1.set(file);
      const reader = new FileReader();
      reader.onload = (e) => thumbnailPreview1.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handleThumbnail2Change(event) {
    const file = event.target.files[0];
    if (file) {
      thumbnail2.set(file);
      const reader = new FileReader();
      reader.onload = (e) => thumbnailPreview2.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handleThumbnail2Drop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      thumbnail2.set(file);
      const reader = new FileReader();
      reader.onload = (e) => thumbnailPreview2.set(e.target.result);
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
                cid: result.video_cid,
                clip: getFileFromIPFS(result.video_cid),
                name: result.name,
                clip_id: clip_id,
              };
            })
          ),
          price: info.price,
          selling: info.selling,
        };
      })
    );
  }

  let selectedCount = writable(0);

  function toggleSelect(id, selected) {
    selectedCount.update((count) => {
      if (selected) {
        if (count < 1) {
          selectedID = id;
          return count + 1;
        } else {
          return count;
        }
      } else {
        selectedID = null;
        return count - 1;
      }
    });
    if (selectedID !== null) {
      isSplittable = true;
    } else {
      isSplittable = false;
    }
    return $selectedCount;
  }

  function findNftById(id) {
    return nfts.find((nft) => nft.id === id);
  }

  let splitting = false;
  let executing = false;

  async function _split() {
    const clipsArray1 = $clipsResult1.map((clip) => clip.clip_id);
    const clipsArray2 = $clipsResult2.map((clip) => clip.clip_id);

    // Upload thumbnail to IPFS
    const thumbnailCid1 = await uploadToIPFS($thumbnail1);
    const thumbnailCid2 = await uploadToIPFS($thumbnail2);
    if (!thumbnailCid1 || !thumbnailCid2) {
      console.error("Failed to upload thumbnail to IPFS");
      return; // or handle the error as needed
    }
    let seed = Math.floor(Math.random() * 1000000000);
    let leftTokenURI = await constructTokenURI(
      nftName1,
      getFileFromIPFS(thumbnailCid1.Hash),
      leftNFTdescription,
      getFileFromIPFS($clipsResult1[0].cid)
    );
    let rightTokenURI = await constructTokenURI(
      nftName2,
      thumbnailCid2.Hash,
      rightNFTdescription,
      getFileFromIPFS($clipsResult2[0].cid)
    );
    console.log(
      selectedID,
      seed,
      clipsArray1,
      clipsArray2,
      nftName1,
      nftName2,
      rightNFTdescription,
      leftNFTdescription,
      thumbnailCid2.Hash,
      thumbnailCid1.Hash,
      leftTokenURI,
      rightTokenURI
    );

    const result = await $contracts.Clipper.methods
      .split(
        selectedID,
        seed,
        clipsArray1,
        clipsArray2,
        nftName1,
        nftName2,
        rightNFTdescription,
        leftNFTdescription,
        thumbnailCid2.Hash,
        thumbnailCid1.Hash,
        leftTokenURI,
        rightTokenURI
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
    console.log("Result:", result);
    return true;
  }
  let success = false;
  const split = async () => {
    // find the third section and count the videos
    if (
      !nftName1 ||
      !thumbnail1 ||
      $clipsResult1.length === 0 ||
      !nftName2 ||
      !thumbnail2 ||
      $clipsResult2.length === 0
    ) {
      showErrorDialog.set(true);
      errorMessage.set("Please provide a valid name, thumbnail, and clips.");
      return;
    }
    executing = true;
    success = await _split();
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

<Dialog.Root bind:open={success}>
  <Dialog.Trigger />
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Split Success!</Dialog.Title>
      <Dialog.Description class="truncate">
        The NFT has been splitted successfully.
      </Dialog.Description>
      <Button on:click={() => goto(`/myNFT`)}>View Owned NFT</Button>
      <Button on:click={() => location.reload()}>Fuse Another</Button>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

{#if loading || executing}
  <Loading />
{/if}
{#if !splitting}
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
        if (selectedID === null) {
          showErrorDialog.set(true);
          errorMessage.set("Please select exactly 2 NFTs to fuse.");
          return;
        }
        splitting = true;
        clipsFrom.set(findNftById(selectedID).videos);
        let idx = 0;
        clipsFrom.update((clips) =>
          clips.map((c) => ({
            id: idx++,
            clip: c.clip,
            name: c.name,
            cid: c.cid,
            clip_id: c.clip_id,
          }))
        );
      }}
    >
      Split
    </Button>
  {/if}
{:else}
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">
      Source Token <span class="text-gray-500">
        #{selectedID}
      </span>
    </h1>
    <NftContainer
      videos={clipsFrom}
      css={"min-h-60 p-4 border dark rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"}
    />
    <div class="flex">
      <div class="w-full lg:w-1/2 p-2">
        <h1 class="mt-2 text-2xl font-bold mb-4">Lysis Token 1st</h1>
        <NftContainer
          videos={clipsResult1}
          css={"min-h-60 p-4 border dark rounded-lg grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}
        />
        <div class="flex">
          <div
            class="h-60 w-90 mt-4 mb-4 border-2 border-dashed border-gray-500 rounded-lg p-4 text-center mr-4"
            role="button"
            tabindex="0"
            on:dragover={handleThumbnail1Drop}
            on:drop={handleThumbnail1Drop}
          >
            <label
              for="thumbnail-upload"
              class="block text-sm font-medium mb-1"
            >
              Upload Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              on:change={handleThumbnail1Change}
              class="hidden"
              id="thumbnail-upload"
            />
            <label for="thumbnail-upload" class="cursor-pointer">
              <div
                class="flex flex-col items-center justify-center w-full h-full"
              >
                {#if $thumbnailPreview1}
                  <img
                    src={$thumbnailPreview1}
                    alt="Thumbnail Preview"
                    class="object-contain h-full w-full rounded-lg mb-5 mt-2"
                  />
                {:else}
                  <Upload class="w-16 h-16 mb-2" />
                  <p class="text-gray-400">
                    Drag and drop media<br />or<br /><span
                      class="text-blue-400 underline">Browse files</span
                    >
                  </p>
                  <p class="text-gray-400 text-sm">
                    Max size: 50MB<br />JPG, PNG, GIF, SVG
                  </p>
                {/if}
              </div>
            </label>
          </div>
          <div class="flex-grow">
            <div class="flex-grow">
              <h1 class="mt-2 text-2xl font-bold mb-2">Token Name</h1>
              <Textarea class="text-2xl" bind:value={nftName1} />
            </div>
            <div class="flex-grow">
              <h1 class="mt-2 text-2xl font-bold mb-2">Description</h1>
              <Textarea class="text-2xl" bind:value={leftNFTdescription} />
            </div>
          </div>
        </div>
      </div>
      <div class="w-full lg:w-1/2 p-2">
        <h1 class="mt-2 text-2xl font-bold mb-4">Lysis Token 2nd</h1>
        <NftContainer
          videos={clipsResult2}
          css={"min-h-60 p-4 border dark rounded-lg grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}
        />
        <div class="flex">
          <div
            class="h-60 mt-4 mb-4 border-2 border-dashed border-gray-500 rounded-lg p-4 text-center mr-4"
            role="button"
            tabindex="0"
            on:dragover={handleThumbnail2Drop}
            on:drop={handleThumbnail2Drop}
          >
            <label
              for="thumbnail-upload2"
              class="block text-sm font-medium mb-1"
            >
              Upload Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              on:change={handleThumbnail2Change}
              class="hidden"
              id="thumbnail-upload2"
            />
            <label for="thumbnail-upload2" class="cursor-pointer">
              <div
                class="flex flex-col items-center justify-center w-full h-full"
              >
                {#if $thumbnailPreview2}
                  <img
                    src={$thumbnailPreview2}
                    alt="Thumbnail Preview2"
                    class="rounded-lg mb-5 h-full w-full object-contain mt-2"
                  />
                {:else}
                  <Upload class="w-16 h-16 mb-2" />
                  <p class="text-gray-400">
                    Drag and drop media<br />or<br /><span
                      class="text-blue-400 underline">Browse files</span
                    >
                  </p>
                  <p class="text-gray-400 text-sm">
                    Max size: 50MB<br />JPG, PNG, GIF, SVG
                  </p>
                {/if}
              </div>
            </label>
          </div>
          <div class="flex-grow">
            <div class="flex-grow">
              <h1 class="mt-2 text-2xl font-bold mb-2">Token Name</h1>
              <Textarea class="text-2xl" bind:value={nftName2} />
            </div>
            <div class="flex-grow">
              <h1 class="mt-2 text-2xl font-bold mb-2">Description</h1>
              <Textarea class="text-2xl" bind:value={rightNFTdescription} />
            </div>
          </div>
        </div>
      </div>
    </div>
    {#if !loading}
      <Button
        variant="primary"
        class="w-full items-center mt-2 mx-auto"
        on:click={split}
      >
        Confirm Split
      </Button>
    {/if}
  </div>
{/if}
