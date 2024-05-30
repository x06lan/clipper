<script lang="js">
  import { cn, isActive } from "$lib/utils.js"; // Import the utility function
  import { connect } from "$lib/components/Connect.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import LifeBuoy from "lucide-svelte/icons/life-buoy";
  import FoldHorizontal from "lucide-svelte/icons/fold-horizontal";
  import {
    Clapperboard,
    BadgePlus,
    Wallet,
    BadgeCheck,
    UnfoldHorizontal,
    Store,
  } from "lucide-svelte";
  import { page } from "$app/stores"; // Import the $page store
  import { defaultEvmStores, connected } from "svelte-web3"; // Adjust the import as needed

  let className = undefined;
  export { className as class };
  import { onMount } from "svelte";
  onMount(() => {
    // defaultEvmStores.setProvider();
  });
</script>

<nav class={cn("flex items-center space-x-4 lg:space-x-6", className)}>
  <a
    href="/"
    class={`flex text-sm font-medium transition-colors ${isActive("/", $page.url.pathname)}`}
  >
    <Store class="mr-2 h-5 w-5" />
    Market Place
  </a>
  <a
    href="/myNFT"
    class={`flex text-sm font-medium transition-colors ${isActive("/myNFT", $page.url.pathname)}`}
  >
    <Clapperboard class="mr-2 h-5 w-5" />
    My NFTs
  </a>
  <a
    href="/nft/create"
    class={`flex text-sm font-medium transition-colors ${isActive("/nft/create", $page.url.pathname)}`}
  >
    <BadgePlus class="mr-2 h-5 w-5" />
    Create NFT
  </a>
  <a
    href="/nft/fuse"
    class={`flex text-sm font-medium transition-colors ${isActive("/nft/fuse", $page.url.pathname)}`}
  >
    <FoldHorizontal class="mr-2 h-5 w-5" />
    Fuse NFTs
  </a>
  <a
    href="/nft/split"
    class={`flex text-sm font-medium transition-colors ${isActive("/nft/split", $page.url.pathname)}`}
  >
    <UnfoldHorizontal class="mr-2 h-5 w-5" />
    Split NFT
  </a>
  <div class="dark">
    {#if !$connected}
      <Button variant="outline" on:click={connect}>
        <Wallet class="mr-2 h-5 w-5" />
        <span> Connect </span>
      </Button>
    {:else}
      <Button variant="ghost">
        <BadgeCheck class="mr-2 h-5 w-5" />
        <span> Connected </span>
      </Button>
    {/if}
  </div>
</nav>
