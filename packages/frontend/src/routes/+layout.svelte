<script>
  import { Header } from "$lib/components/index.js";
  import "../app.css";
  import { defaultEvmStores } from "svelte-web3";
  import { CONTRACT_ABI, CONTRACT_ADDRESS } from "$lib/utils.js";
  defaultEvmStores.attachContract("Clipper", CONTRACT_ADDRESS, CONTRACT_ABI);
</script>

<div class="dark">
  <main class="">
    <body>
      <div class=" flex-col md:flex">
        <div class="border-b">
          <div class="flex h-16 items-center px-4">
            <Header />
          </div>
        </div>
      </div>
      <slot />
    </body>
  </main>

  <!-- <footer>
    <p>
      visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit
    </p>
  </footer> -->
</div>

<style global>
  @import "../app.css";
</style>
