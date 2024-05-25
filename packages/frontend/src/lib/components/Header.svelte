<script lang="js">
  import { cn, isActive } from "$lib/utils.js"; // Import the utility function
  import { connect } from "$lib/components/Connect.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import LifeBuoy from "lucide-svelte/icons/life-buoy";
  import FoldHorizontal from "lucide-svelte/icons/fold-horizontal";
  import { Clapperboard, BadgePlus, Wallet, BadgeCheck } from "lucide-svelte";
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
    class={`text-sm font-medium transition-colors ${isActive("/", $page.url.pathname)}`}
  >
    Overview
  </a>
  <a
    href="/web3/contracts"
    class={`text-sm font-medium transition-colors ${isActive("/web3/contracts", $page.url.pathname)}`}
  >
    Contract functions
  </a>
  <a
    href="/web3/set"
    class={`text-sm font-medium transition-colors ${isActive("/web3/set", $page.url.pathname)}`}
  >
    Link wallet
  </a>
  {#if !$connected}
    <Button variant="outline" on:click={connect}>
      <Wallet class="mr-2 h-4 w-4" />
      <span> Connect </span>
    </Button>
  {:else}
    <Button variant="ghost">
      <BadgeCheck class="mr-2 h-4 w-4" />
      <span> Connected </span>
    </Button>
  {/if}
  <div class="dark">
    <DropdownMenu.Root class="">
      <DropdownMenu.Trigger asChild let:builder>
        <Button builders={[builder]} variant="outline" size="sm">
          <LifeBuoy />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content class="dark w-56 bg-card text-card-foreground">
        <a href="/myNFT">
          <DropdownMenu.Item class="hover:bg-muted hover:text-muted-foreground">
            <Clapperboard class="mr-2 h-4 w-4" />
            <span>My NFTs</span>
          </DropdownMenu.Item>
        </a>
        <a href="/nft/create">
          <DropdownMenu.Item>
            <BadgePlus class="mr-2 h-4 w-4" />
            <span>Create NFT</span>
          </DropdownMenu.Item>
        </a>

        <DropdownMenu.Item href="/nft/fuse">
          <FoldHorizontal class="mr-2 h-4 w-4" />
          <span>Fuse NFTs</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</nav>
