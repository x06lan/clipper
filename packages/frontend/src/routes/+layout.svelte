<script>
  import { Header } from "$lib/components/index.js";
  import "../app.css";
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
</div>

<style global>
  @import "../app.css";
</style>
