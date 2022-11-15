<script>
  // core components
  import ChatTable from "../components/Cards/CardBotChat.svelte";
  export let location;
  export let id;
</script>

<div class="flex flex-wrap mt-4">
  <div class="w-full mb-12 px-4">
    <ChatTable id={id}/>
  </div>
</div>
