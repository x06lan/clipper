<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import FileUpload from "$lib/components/FileUpload.svelte"; // Adjust the path accordingly
  import { defaultEvmStores as evm, connected } from "svelte-web3";
  // if not connected to the network, connect to the network
  onMount(async () => {
    if (!$connected) {
      await evm.setProvider();
    }
  });
  const mintNFT = async (urls) => {
    // Replace with your smart contract ABI and address
    const contractAddress = "0xYourNFTContractAddress";
    const contractABI = [
      // Your contract's ABI
    ];

    const nftContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    try {
      const tx = await nftContract.createToken(urls[0]); // Assuming single URL for simplicity
      await tx.wait();
      console.log("NFT minted successfully");
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };
</script>

<div class="flex flex-col items-center gap-4 p-4 bg-white shadow-md rounded">
  <h1 class="text-2xl font-bold mb-4">Create NFT</h1>
  <FileUpload on:upload={mintNFT} />
</div>
