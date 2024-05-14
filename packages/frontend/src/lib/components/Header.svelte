<script lang="js">
  import { cn } from "$lib/utils.js";
  import { connect } from "$lib/components/Connect.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import LifeBuoy from "lucide-svelte/icons/life-buoy";
  import { Clapperboard, BadgePlus, Wallet, BadgeCheck } from "lucide-svelte";
  let className = undefined;
  export { className as class };
  import { connected, chainId, selectedAccount } from "svelte-web3";
</script>

<nav class={cn("flex items-center space-x-4 lg:space-x-6", className)}>
  <a href="/" class="text-sm font-medium transition-colors hover:text-primary">
    Overview
  </a>

  <a
    href="/web3/contracts"
    class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
  >
    Contract functions
  </a>
  <a
    href="/web3/set"
    class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
  >
    Link wallet
  </a>
  {#if $connected === false}
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
      <DropdownMenu.Item>
        <Clapperboard class="mr-2 h-4 w-4" />
        <span>My NFTs</span>
      </DropdownMenu.Item>
      <a href="/nft/create">
        <DropdownMenu.Item>
          <BadgePlus class="mr-2 h-4 w-4" />
          <span>Create NFT</span>
          <!-- svelte-ignore a11y-missing-content -->
        </DropdownMenu.Item>
      </a>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</nav>
