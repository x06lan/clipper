<script>
  import { superForm } from "sveltekit-superforms";
  import { formSchema } from "./schema.js";
  import { writable } from "svelte/store";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { CircleX, Upload } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import { fly, fade } from "svelte/transition";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Badge } from "$lib/components/ui/badge";

  export let data;
  const form = superForm(data.form, {
    validators: zodClient(formSchema),
  });

  let thumbnail = writable(null);
  let thumbnailPreview = writable(null);
  let mediaFiles = writable([]);
  let dragIndex = writable(null);
  let hoverIndex = writable(null);

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

<form use:enhance method="POST">
  <div class="flex">
    <div class="w-1/4 p-4">
      <div
        class="mb-4 border-2 border-dashed border-gray-500 rounded-lg p-4 text-center"
        role="button"
        tabindex="0"
        on:dragover={handleThumbnailDrop}
        on:drop={handleThumbnailDrop}
      >
        <label for="thumbnail-upload" class="block text-sm font-medium mb-1"
          >Upload Thumbnail</label
        >
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
        <label for="media-upload" class="block text-sm font-medium mb-1"
          >Upload Media Files</label
        >
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
    <div class="w-3/4 p-4">
      <h1 class="text-2xl font-bold mb-4">Create an NFT</h1>
      <Form.Field {form} name="nftName">
        <Form.Control let:attrs>
          <Form.Label>Name *</Form.Label>
          <Input {...attrs} />
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="description">
        <Form.Control let:attrs>
          <Form.Label>Description</Form.Label>
          <Textarea {...attrs} />
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="externalLink">
        <Form.Control let:attrs>
          <Form.Label>External link</Form.Label>
          <Input {...attrs} />
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <ScrollArea
        class="w-full h-72 rounded-md border p-4"
        orientation="vertical"
      >
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
              style={`left: calc(${$hoverIndex} * (100% / ${$mediaFiles.length} + 1rem))`}
            ></div>
          {/if}
        </div>
      </ScrollArea>
      <Button type="submit">Create</Button>
    </div>
  </div>
</form>

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
