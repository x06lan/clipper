<script>
  import * as Card from "$lib/components/ui/card";
  export let id;
  export let name;
  export let price;
  export let img;
  export let videos;
  console.log(videos);
  export let css =
    "flex flex-col items-center bg-gray-800 p-4 hover:bg-gray-700 transition rounded-lg shadow-lg overflow-hidden";
  let s_id = id.toString().padStart(4, "0");
  let isHovered = false;
  let videoIndex = 0;

  function handleVideoEnded(event) {
    videoIndex = (videoIndex + 1) % videos.length;
    event.target.src = videos[videoIndex];
    event.target.play();
  }
</script>

<a
  href="/nft/{id}"
  class="w-full"
  on:mouseenter={() => {
    isHovered = true;
  }}
  on:mouseout={() => {
    isHovered = false;
  }}
  on:blur={() => {
    isHovered = false;
  }}
>
  <Card.Root class={css}>
    <div class="flex-shrink-0 w-full relative">
      {#if !isHovered}
        <img
          class="aspect-square w-full object-cover hover:scale-105 transition-transform duration-200 ease-in-out"
          src={img}
          alt={name}
        />
      {:else}
        <video
          id={"video-" + id}
          class="aspect-square w-full object-cover hover:scale-105 transition-transform duration-200 ease-in-out"
          src={videos[videoIndex]}
          preload="auto"
          muted
          autoplay
          on:ended={handleVideoEnded}
        ></video>
        <video
          id={"next-video-" + id}
          class="hidden"
          src={videos[(videoIndex + 1) % videos.length]}
          preload="auto"
          muted
        ></video>
      {/if}
    </div>
    <div class="mt-4 w-full text-center text-white">
      <div class="text-lg font-bold">{name}</div>
      <div class="uppercase tracking-wide text-sm text-gray-400 font-semibold">
        #{s_id}
      </div>
      <p class="mt-2 text-gray-400">{price} ETH</p>
    </div>
  </Card.Root>
</a>
