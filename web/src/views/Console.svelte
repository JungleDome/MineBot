<script>
  // core components
  import ConsoleTable from "../components/Cards/CardBotConsole.svelte";
  export let location;
  export let id;
</script>

<div class="flex flex-wrap mt-4">
  <div class="w-full mb-12 px-4">
    <ConsoleTable id={id}/>
  </div>
</div>
