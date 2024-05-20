<script>
  import { superForm } from "sveltekit-superforms";
  import { formSchema } from "./schema.js";
  import { writable } from "svelte/store";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { FileVideo, Upload } from "lucide-svelte";
  import { enhance } from "$app/forms";

  export let data;
  const form = superForm(data.form, {
    validators: zodClient(formSchema),
  });

  let thumbnail = writable(null);
  let thumbnailPreview = writable(null);
  let mediaFiles = writable([]);

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
    mediaFiles.update((currentFiles) => [...currentFiles, ...files]);
  }

  function handleDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    mediaFiles.update((currentFiles) => [...currentFiles, ...files]);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }
</script>

<form use:enhance method="POST">
  <div class="flex">
    <div class="w-1/2 p-4">
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
      <div class="flex gap-4">
        <div
          class="flex-1 border-2 border-dashed border-gray-500 rounded-lg p-4 text-center"
          role="button"
          tabindex="0"
          on:dragover={handleDragOver}
          on:drop={handleDrop}
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
        <div class="flex-1 grid grid-cols-1 gap-4">
          {#each $mediaFiles as file}
            <div
              class="flex items-center gap-4 p-2 border rounded-lg bg-gray-800"
            >
              <FileVideo class="w-12 h-12" />
              <span class="text-white">{file.name}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="w-1/2 p-4">
      <h1 class="text-2xl font-bold mb-4">Create an NFT</h1>
      <!-- <Form.Field {form} name="collection">
        <Form.Control let:attrs>
          <Form.Label>Collection *</Form.Label>
          <Input {...attrs} />
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field> -->
      <Form.Field {form} name="nftName">
        <Form.Control let:attrs>
          <Form.Label>Name *</Form.Label>
          <Input {...attrs} />
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <!-- <Form.Field {form} name="supply">
        <Form.Control let:attrs>
          <Form.Label>Supply *</Form.Label>
          <Input type="number" {...attrs} />
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field> -->
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
      <Button type="submit">Create</Button>
    </div>
  </div>
</form>
