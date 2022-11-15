<script>
  import { link } from "svelte-routing";
  import { sendRequest, botList } from "../store";
  import { onDestroy } from "svelte";
  import { success, error, warn } from "../toast.js";

  export let id;
  let command = "";

  function sendCommand() {
    sendRequest("commandBot", "POST", { botId: id, command: command })
      .then((x) => {})
      .catch((err) => {
        error(err);
      });
    command = "";
  }
</script>

<form on:submit|preventDefault={sendCommand} class="my-2 lg:my-0 w-full lg:w-auto flex-grow flex-2 lg:flex-1">
  <div class="flex justify-end">
    <input
      id="command"
      placeholder="Type your command here. Type 'help' for command list."
      bind:value={command}
      type="text"
      class="mr-1 mb-1 inline-block border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full lg:w-1/2 focus:lg:w-full ease-linear transition-all duration-150"
    />
    <button
      disabled={command == ""}
      type="submit"
      class="{command == ''
        ? 'bg-gray-300'
        : 'bg-orange-300'} text-white active:bg-orange-600 font-bold uppercase text-xs px-4 py-1 mr-0 lg:mr-2 my-1 rounded-full shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
    >
      <i class="fas fa-arrow-right" />
    </button>
  </div>
</form>
