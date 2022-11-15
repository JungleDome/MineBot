<script>
  //Tailwind base css
  import Tailwindcss from "./components/Tailwind.svelte";

  // Toast Component
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { success, error, warn } from "./components/toast.js";
  const SvelteToastOptions = {};

  // Svelte router
  import { Router, Route } from "svelte-routing";

  // Admin Layout
  import Index from "./layouts/Index.svelte";

  export let url = "";
</script>

<Router {url}>
  <Route path="/*" component={Index} />
</Router>
