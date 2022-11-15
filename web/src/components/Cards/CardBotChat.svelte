<script>
  // can be one of light or dark
  export let color = "light";

  // custom logic
  import { link } from "svelte-routing";
  import { sendRequest, botList } from "../store";
  import { onDestroy } from "svelte";
  import { success, error, warn } from "../toast.js";
  import BotCommandInput from "../Inputs/BotCommandInput.svelte";

  export let id;
  let chatHistory;
  let currentBot = {};

  const unsubscribe = botList.subscribe((value) => {
    let bot = value.find((x) => x.id == id);
    if (bot) currentBot = bot;
  });
  onDestroy(unsubscribe);

  function getInfo() {
    if (!id) return;

    sendRequest("getInfo", "POST", { botId: id })
      .then((x) => {
        chatHistory = x.chatHistory;
      })
      .catch((err) => {
        error(err);
      });
  }

  function displayDateTime(epoch) {
    let date = new Date(epoch).toLocaleString("en-gb", { year: "numeric", month: "2-digit", day: "2-digit" });
    let time = new Date(epoch).toLocaleString("en-gb", { hour: "2-digit", hour12: false, minute: "2-digit", second: "2-digit" });
    return `${date} ${time}`;
  }

  let getInfoInterval = setInterval(getInfo, 1000);
  onDestroy(() => clearInterval(getInfoInterval));
</script>

<div class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded {color === 'light' ? 'bg-white' : 'bg-red-800 text-white'}">
  <div class="rounded-t mb-0 px-4 py-3 border-0">
    <div class="flex flex-wrap items-center">
      <div class="relative w-full px-4 max-w-full flex-grow flex-1">
        <h3 class="font-semibold text-lg {color === 'light' ? 'text-blueGray-700' : 'text-white'}">
          <img src="https://mineskin.eu/helm/{currentBot.username}" class="inline h-12 w-12 bg-white rounded-full border" alt={currentBot.username} />
          {currentBot.username} - Chat Log
        </h3>
      </div>
      <BotCommandInput {id} />
      <a
        href="/console/{id}"
        use:link
        class="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-center text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 w-full lg:w-auto"
      >
        Switch to console log
      </a>
    </div>
  </div>
  <div class="block w-full overflow-x-auto">
    <!-- Projects table -->
    <table class="items-center w-full bg-transparent border-collapse">
      <thead>
        <tr>
          <th
            class="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left {color === 'light'
              ? 'bg-blueGray-50 text-blueGray-500 border-blueGray-100'
              : 'bg-red-700 text-red-200 border-red-600'}"
          >
            Time
          </th>
          <th
            class="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left {color === 'light'
              ? 'bg-blueGray-50 text-blueGray-500 border-blueGray-100'
              : 'bg-red-700 text-red-200 border-red-600'}"
          >
            Message
          </th>
        </tr>
      </thead>
      <tbody>
        {#if chatHistory == undefined}
          <tr class="animate-pulse bg-blueGray-200">
            <td class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
              <span class="ml-3 font-bold {color === 'light' ? 'btext-blueGray-600' : 'text-whit'}"> Loading chat history... </span>
            </td>
            <td />
          </tr>
        {:else if chatHistory.length == 0}
          <tr>
            <th colspan="2" class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
              <span class="ml-3 font-bold {color === 'light' ? 'btext-blueGray-600' : 'text-whit'}"> No chat history yet. </span>
            </th>
          </tr>
        {:else}
          {#each chatHistory as { timestamp, message }, i}
            <tr>
              <th class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-1 text-left flex items-center">
                <span class="ml-3 font-bold {color === 'light' ? 'btext-blueGray-600' : 'text-whit'}"> {displayDateTime(timestamp)} </span>
              </th>
              <td class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-1"> {message} </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
