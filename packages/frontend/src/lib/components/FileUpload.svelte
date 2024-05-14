<script>
  import { createEventDispatcher } from "svelte";
  import { Upload } from "lucide-svelte";
  import { writable } from "svelte/store";

  export let onUpload = () => {};

  const dispatch = createEventDispatcher();
  const fileStore = writable([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    fileStore.set(files);
    dispatch("filesSelected", { files });
  };

  const handleUpload = async () => {
    const files = [];
    fileStore.subscribe((value) => {
      files.push(...value);
    });

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.text();
        console.log(data);
        onUpload(data.urls);
        console.log("Files uploaded successfully");
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };
</script>

<div class="flex flex-col items-center gap-4">
  <input
    type="file"
    multiple
    on:change={handleFileChange}
    class="border p-2 rounded"
  />
  <button
    on:click={handleUpload}
    class="bg-blue-500 text-white p-2 rounded flex items-center gap-2"
  >
    <Upload /> Upload Files
  </button>
</div>
