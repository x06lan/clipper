<script lang="js">
  import { cn, isActive } from "$lib/utils.js"; // Import the utility function
  import { connect } from "$lib/components/Connect.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import LifeBuoy from "lucide-svelte/icons/life-buoy";
  import { Clapperboard, BadgePlus, Wallet, BadgeCheck } from "lucide-svelte";
  import { page } from "$app/stores"; // Import the $page store
  import { connected } from "svelte-web3"; // Adjust the import as needed
  let className = undefined;
  export { className as class };
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
    <Button on:click={connect}>
      <Wallet class="mr-2 h-4 w-4" />
      <span> Connect </span>
    </Button>
  {:else}
    <Button>
      <BadgeCheck class="mr-2 h-4 w-4" />
      <span> Connected </span>
    </Button>
  {/if}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
      <Button builders={[builder]} variant="outline" size="sm">
        <LifeBuoy />
      </Button>
    </DropdownMenu.Trigger>

    <DropdownMenu.Content class="w-56">
      <a href="/myNFT">
        <DropdownMenu.Item>
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
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</nav>
