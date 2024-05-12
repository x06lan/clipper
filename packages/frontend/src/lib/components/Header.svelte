<script lang="js">
  import { cn } from "$lib/utils.js";
  import { connect } from "$lib/components/Connect.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import LifeBuoy from "lucide-svelte/icons/life-buoy";
  import { Clapperboard } from "lucide-svelte";
  let className = undefined;
  export { className as class };
</script>

<nav class={cn("flex items-center space-x-4 lg:space-x-6", className)}>
  <a
    href="/overview"
    class="text-sm font-medium transition-colors hover:text-primary"
  >
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
  <div class="sc-beff130f-0 hksMfk" style="z-index: 190;" aria-expanded="false">
    <button
      class="inline-flex items-center border-0 bg-inherit font-[inherit] text-[100%] sc-ad61db5a-0 sc-4b28f958-0 bRbcQk cZeNhW"
      type="button"
      data-id="UnstyledButton"
      on:click={connect}
      ><svg
        fill="currentColor"
        height="24"
        role="img"
        viewBox="0 -960 960 960"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        title="Wallet"
        ><title>Wallet</title><path
          d="M240-160q-66 0-113-47T80-320v-320q0-66 47-113t113-47h480q66 0 113 47t47 113v320q0 66-47 113t-113 47H240Zm0-480h480q22 0 42 5t38 16v-21q0-33-23.5-56.5T720-720H240q-33 0-56.5 23.5T160-640v21q18-11 38-16t42-5Zm-74 130 445 108q9 2 18 0t17-8l139-116q-11-15-28-24.5t-37-9.5H240q-26 0-45.5 13.5T166-510Z"
        ></path></svg
      >
      <div class="media-greaterThanOrEqual-lg">
        <span class="text-md leading-md font-semibold h-6" data-id="TextBody"
          >Login</span
        >
      </div></button
    >
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <Button builders={[builder]} variant="outline" size="sm">
          <LifeBuoy />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content class="w-56">
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <Clapperboard class="mr-2 h-4 w-4" />
            <span>My NFTs</span>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</nav>
