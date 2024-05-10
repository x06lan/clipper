<script context="module">
  import { defaultEvmStores as evm } from "svelte-web3";

  export let pending = false;

  export const connect = async () => {
    pending = true;
    try {
      await evm.setProvider();
      pending = false;
    } catch (e) {
      console.log(e);
      pending = false;
    }
  };

  export const disconnect = async () => {
    await evm.disconnect();
    pending = false;
  };
</script>
