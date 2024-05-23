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
</script>

{#if controls}
  <video
    class="{css} transition-transform duration-200 ease-in-out"
    src={videos[videoIndex]}
    preload="auto"
    muted
    autoplay
    playsinline
    controls
    controlslist="nodownload"
    on:ended={handleVideoEnded}
  ></video>
{:else}
  <video
    class="{css} aspect-square w-full object-cover hover:scale-105 transition-transform duration-200 ease-in-out"
    src={videos[videoIndex]}
    preload="auto"
    muted
    autoplay
    playsinline
    on:ended={handleVideoEnded}
  ></video>
{/if}
<video
  class="hidden"
  src={videos[(videoIndex + 1) % videos.length]}
  preload="auto"
  muted
></video>
