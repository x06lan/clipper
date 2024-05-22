<script>
  import { writable } from "svelte/store";
  import { CircleX, Upload, LoaderCircle } from "lucide-svelte";
  import { fly, fade } from "svelte/transition";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { enhance } from "$app/forms";
  import { CONTRACT_ABI, CONTRACT_ADDRESS } from "$lib/utils";
  import { onMount } from "svelte";
  import {
    defaultEvmStores as evm,
    contracts,
    connected,
    selectedAccount,
  } from "svelte-web3";
  onMount(() => {
    // add a test to return in SSR context
    evm.setProvider();
  });
  let thumbnailPreview = writable(null);
  let dragIndex = writable(null);
  let hoverIndex = writable(null);
  const nftName = writable("");
  const description = writable("");
  const thumbnail = writable(null);
  const mediaFiles = writable([]);
  evm.attachContract("Clipper", CONTRACT_ADDRESS, CONTRACT_ABI);

  async function _mint(nftName, description, clips, thumbnail) {
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

    let seed = Math.floor(Math.random() * 1000000);
    formattedClips = clipsArray.map((clip, index) => {
      return {
        id: seed * (index + 1),
        name: clip[0],
        image_url: thumbnailCid.Hash,
        movie_url: clip[1],
      };
    });
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
      });
    console.log(result);
  }

  const mint = async () => {
    await _mint($nftName, $description, $mediaFiles, $thumbnail);
  };
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

  function handleMediaChange(event) {
    const files = Array.from(event.target.files);
    mediaFiles.update((currentFiles) => {
      const newFiles = files.map((file) => {
        const preview = URL.createObjectURL(file);
        return { file, preview };
      });
      return [
        ...currentFiles,
        ...newFiles.filter(
          (newFile) =>
            !currentFiles.some((f) => f.file.name === newFile.file.name)
        ),
      ];
    });
  }

  function handleMediaDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    mediaFiles.update((currentFiles) => {
      const newFiles = files.map((file) => {
        const preview = URL.createObjectURL(file);
        return { file, preview };
      });
      return [
        ...currentFiles,
        ...newFiles.filter(
          (file) => !currentFiles.find((f) => f.file.name === file.name)
        ),
      ];
    });
  }

  function handleMediaDragOver(event, index) {
    console.log(mediaFiles);
    event.preventDefault();
    hoverIndex.set(index);
    if (dragIndex !== null && $dragIndex !== index) {
      mediaFiles.update((files) => {
        const reorderedFiles = [...files];
        const [movedItem] = reorderedFiles.splice(dragIndex, 1);
        reorderedFiles.splice(index, 0, movedItem);
        dragIndex.set(index);
        return reorderedFiles;
      });
    }
  }

  function handleDragStart(event, index) {
    dragIndex.set(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index);
  }

  function handleDrop(event, index) {
    event.preventDefault();
    const fromIndex = event.dataTransfer.getData("text/plain");
    mediaFiles.update((currentFiles) => {
      const reorderedFiles = [...currentFiles];
      const [movedItem] = reorderedFiles.splice(fromIndex, 1);
      reorderedFiles.splice(index, 0, movedItem);
      return reorderedFiles;
    });
    dragIndex.set(null);
    hoverIndex.set(null);
  }

  function removeFile(index) {
    mediaFiles.update((files) => files.filter((_, i) => i !== index));
  }
</script>

"
<div class="flex">
  <div class="w-1/4 p-4">
    <div
      class="mb-4 border-2 border-dashed border-gray-500 rounded-lg p-4 text-center"
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
              class="w-full h-108 object-cover rounded-lg mb-2"
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
    <div
      class="flex-1 border-2 border-dashed border-gray-500 rounded-lg p-4 text-center"
      role="button"
      tabindex="0"
      on:dragover={handleMediaDragOver}
      on:drop={handleMediaDrop}
    >
      <label for="media-upload" class="block text-sm font-medium mb-1">
        Upload Media Files
      </label>
      <input
        type="file"
        multiple
        accept="video/*"
        on:change={handleMediaChange}
        class="hidden"
        id="media-upload"
      />
      <label for="media-upload" class="cursor-pointer">
        <div class="flex flex-col items-center justify-center h-full">
          <Upload class="w-16 h-16 mb-2" />
          <p class="text-gray-400">
            Drag and drop media<br />or<br /><span
              class="text-blue-400 underline">Browse files</span
            >
          </p>
          <p class="text-gray-400 text-sm">Max size: 50MB<br />MP4</p>
        </div>
      </label>
    </div>
  </div>
  <div class="w-3/4 p-4 dark">
    <h1 class="text-2xl font-bold mb-4">Create an NFT</h1>
    <div class="mb-4">
      <label for="nftName" class="block text-sm font-medium">Name *</label>
      <Textarea
        bind:value={$nftName}
        class="mt-1 block w-full border resize-none rounded-md shadow-sm focus:ring focus:ring-opacity-50"
      />
    </div>
    <div class="mb-4">
      <label for="description" class="block text-sm font-medium"
        >Description</label
      >
      <Textarea
        bind:value={$description}
        class="mt-1 block w-full border  rounded-md shadow-sm focus:ring focus:ring-opacity-50"
      />
    </div>
    <div class="mb-4">
      <label for="externalLink" class="block text-sm font-medium"
        >External link</label
      >
      <Textarea
        type="text"
        id="externalLink"
        name="externalLink"
        class="mt-1 block w-full border resize-none rounded-md shadow-sm focus:ring focus:ring-opacity-50"
      />
    </div>

    <div class="w-full h-72 rounded-md border p-4 overflow-auto">
      <div
        class="rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {#each $mediaFiles as { file, preview }, index (file.name)}
          <div
            role="button"
            tabindex="0"
            class="video-container flex flex-col items-center bg-gray-800 rounded-lg relative m-2"
            in:fly={{ x: 50 }}
            out:fade={{ x: -50 }}
            draggable="true"
            on:dragstart={(event) => handleDragStart(event, index)}
            on:dragover={(event) => handleMediaDragOver(event, index)}
            on:drop={(event) => handleDrop(event, index)}
          >
            <Badge class="absolute top-2 left-2">
              {index + 1}
            </Badge>
            <video
              class="w-fill h-40 object-cover rounded-lg"
              src={preview}
              autoplay
              loop
              muted
            />
            <span
              class="mt-1 text-center text-white overflow-hidden text-ellipsis whitespace-nowrap w-full max-w-xs"
            >
              {file.name}
            </span>
            <button
              type="button"
              class="absolute top-2 right-2 text-white rounded-full p-1"
              on:click={() => removeFile(index)}
            >
              <CircleX class="w-4 h-4" />
            </button>
          </div>
        {/each}
        {#if $hoverIndex !== null}
          <div
            class="drag-indicator"
            style={`left: calc(${$hoverIndex} * (100% / ${mediaFiles.length} + 1rem))`}
          ></div>
        {/if}
      </div>
    </div>
    <Button on:click={mint}>Create</Button>
  </div>
</div>

<style>
  .drag-indicator {
    height: 100%;
    width: 4px;
    background-color: blue;
    position: absolute;
    z-index: 10;
    transition: left 0.2s ease;
  }
  .video-container {
    position: relative;
    transition: transform 0.2s ease;
  }
  .video-container:hover {
    transform: scale(1.05);
  }
</style>
