<script>
  import { onMount } from "svelte";
  import FileUpload from "$lib/components/FileUpload.svelte"; // Adjust the path accordingly
  import { defaultEvmStores as evm, connected } from "svelte-web3";
  import { redirect } from "@sveltejs/kit";
  import SortNFT from "$lib/components/SortNFT.svelte"; // Adjust the path accordingly
  // if not connected to the network, connect to the network

  let editing = false;
  let files = [];
  const toEdit = async (urls) => {
    editing = true;
    files = urls;
  };
</script>

{#if !editing}
  <div class="flex flex-col items-center gap-4 p-4 bg-white shadow-md rounded">
    <h1 class="text-2xl font-bold mb-4">Create NFT</h1>
    <FileUpload onUpload={toEdit} />
  </div>
{:else}
  <SortNFT names={files} />
{/if}
