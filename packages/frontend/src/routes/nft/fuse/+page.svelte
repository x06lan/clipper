<script>
  import NftContainer from "$lib/components/NFTContainer.svelte";
  import NftCard from "$lib/components/NFTCard.svelte";
  import { Button } from "$lib/components/ui/button";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { Upload } from "lucide-svelte";
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
  import Loading from "$lib/components/Loading.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";

  let loading = true;
  let nfts = [];
  let selectedIDs = [];
  let clips1 = [];
  let clips2 = [];
  let clipsResult = [];
  let nftName = "";
  let thumbnailPreview = writable(null);

  const thumbnail = writable(null);
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
              return getFileFromIPFS(result.video_cid);
            })
          ),
          price: info.price,
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
  }

  function findNftById(id) {
    return nfts.find((nft) => nft.id === id);
  }

  let fusing = false;
  async function _fuse() {
    const clipsArray = clips.map((clip) => [clip.file.name, clip.file]);

    const uploadToIPFS = async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/ipfs/add", {
          method: "POST",
          body: formData,
          redirect: "manual",
        });
        if (!response.ok) {
          if (response.type === "opaqueredirect")
            throw new Error(
              "Request was redirected to HTTPS, which is not supported."
            );
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error uploading file to IPFS:", error);
        return null; // or handle the error as needed
      }
    };

    // Upload thumbnail to IPFS
    const thumbnailCid = await uploadToIPFS(thumbnail);
    if (!thumbnailCid) {
      console.error("Failed to upload thumbnail to IPFS");
      return; // or handle the error as needed
    }
    // Upload clips to IPFS
    const clipsCids = await Promise.all(
      clipsArray.map(async (clip) => {
        const cid = await uploadToIPFS(clip[1]);
        if (!cid) {
          console.error(`Failed to upload clip ${clip[0]} to IPFS`);
          return null; // or handle the error as needed
        }
        return cid;
      })
    );

    if (clipsCids.some((cid) => cid === null)) {
      console.error("One or more clips failed to upload to IPFS");
      return; // or handle the error as needed
    }
    console.log("Clips, clipsCids", clipsArray, clipsCids);
    // Overwrite clips with CIDs
    clipsArray.forEach((clip, index) => {
      clip[1] = clipsCids[index].Hash;
    });

    let seed = Math.floor(Math.random() * 1000000000);
    let formattedClips = clipsArray.map((clip, index) => {
      return {
        id: seed * (index + 1),
        name: clip[0],
        image_cid: thumbnailCid.Hash,
        video_cid: clip[1],
      };
    });
    console.log(formattedClips, nftName, thumbnailCid.Hash, seed);
    const result = await $contracts.Clipper.methods
      .mint(formattedClips, nftName, thumbnailCid.Hash, seed)
      .send({ from: $selectedAccount })
      .on("transactionHash", (hash) => {
        console.log("Transaction hash:", hash);
      })
      .on("receipt", (receipt) => {
        console.log("Receipt:", receipt);
      })
      .on("error", (error) => {
        console.error("Error minting NFT:", error);
        minting = false;
      });
    return result.events.Transfer.returnValues.tokenId;
  }

  const fuse = async () => {
    minting = true;
    tokenId = await _merge();
    minting = false;
  };
</script>

{#if loading}
  <Loading />
{:else if !fusing}
  <div class="container mx-auto p-4">
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {#each nfts as nft}
        <NftCard
          {...nft}
          variant="select"
          selected={false}
          {selectedCount}
          {toggleSelect}
        />
      {/each}
    </div>
  </div>
  <Button
    variant="default"
    class="w-full items-center lg:w-1/2 mx-auto"
    on:click={() => {
      fusing = true;
      clips1 = findNftById(selectedIDs[0]).videos;
      clips2 = findNftById(selectedIDs[1]).videos;
      let idx = 0;
      clips1 = clips1.map((clip) => ({ id: idx++, clip }));
      clips2 = clips2.map((clip) => ({ id: idx++, clip }));
    }}
  >
    Merge
  </Button>
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
    <div
      class="mt-4 mb-4 border-2 border-dashed border-gray-500 rounded-lg p-4 text-center"
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
        <div class="flex flex-col items-center justify-center h-full">
          {#if $thumbnailPreview}
            <img
              src={$thumbnailPreview}
              alt="Thumbnail Preview"
              class="h-full object-cover rounded-lg mb-2"
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
    <h1 class="mt-2 text-2xl font-bold mb-4">Token Name</h1>
    <Textarea class="mt-1 border p-8" bind:value={nftName} />
    {#if clips1.length == 0 && clips2.length == 0}
      <Button
        variant="primary"
        class="w-full items-center lg:w-1/2 mx-auto"
        on:click={fuse}
      >
        Confirm Fuse
      </Button>
    {:else}
      <Button
        variant="default"
        class="w-full items-center lg:w-1/2 mx-auto"
        disabled
      >
        Confirm Fuse
      </Button>
    {/if}
  </div>
{/if}
