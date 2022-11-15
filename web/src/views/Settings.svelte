<script>
  // core components
  import CardBotCreate from "../components/Cards/CardBotAdd.svelte";
  // import CardProfile from "../components/Cards/CardProfile.svelte";
  export let location;
  export let id;
</script>

<div class="flex flex-wrap">
  <div class="w-full lg:w-8/12 px-4 m-auto">
    <CardBotCreate {id}/>
  </div>
  <!-- <div class="w-full lg:w-4/12 px-4">
    <CardProfile />
  </div> -->
</div>
