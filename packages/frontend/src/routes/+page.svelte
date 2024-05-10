<script>
  import welcome from "$lib/images/svelte-welcome.webp";
  import welcome_fallback from "$lib/images/svelte-welcome.png";
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  <span class="welcome">
    <picture>
      <source srcset={welcome} type="image/webp" />
      <img src={welcome_fallback} alt="Welcome" />
    </picture>
  </span>
</section>
