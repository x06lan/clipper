<script context="module">
  import { connected } from "svelte-web3";
  export const debug = () => {
    console.log("connected", connected);
  };
</script>
