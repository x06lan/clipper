<script>
  export let videos;
  let videoIndex = 0;
  function handleVideoEnded(event) {
    videoIndex = (videoIndex + 1) % videos.length;
    event.target.src = videos[videoIndex];
    event.target.play();
  }
  export let controls = true;
  export let css = "";
  import loadingGif from "$lib/images/loading.gif";
  let loading = true;
</script>

{#if loading}
  <img src={loadingGif} alt="Loading..." class="{css} w-full aspect-square" />
{/if}
{#if controls}
  <video
    class="{css} transition-transform duration-200 ease-in-out {loading
      ? 'hidden'
      : ''}"
    src={videos[videoIndex]}
    preload="auto"
    muted
    autoplay
    playsinline
    controls
    controlslist="nodownload"
    on:ended={handleVideoEnded}
    on:loadeddata={() => (loading = false)}
  ></video>
{:else}
  <video
    class="{css}  w-full object-cover hover:scale-105 transition-transform duration-200 ease-in-out {loading
      ? 'hidden'
      : ''}"
    src={videos[videoIndex]}
    preload="auto"
    muted
    autoplay
    playsinline
    on:ended={handleVideoEnded}
    on:loadeddata={() => (loading = false)}
  ></video>
{/if}
<video
  class="hidden"
  src={videos[(videoIndex + 1) % videos.length]}
  preload="auto"
  muted
></video>
