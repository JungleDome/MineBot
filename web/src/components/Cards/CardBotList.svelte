<script>
  // core components
  import BotListDropdown from "../Dropdowns/BotListDropdown.svelte";

  // can be one of light or dark
  export let color = "light";

  // custom logic
  import { link } from "svelte-routing";
  import { sendRequest } from "../store";

  let bots = [];

  function getListBot() {
    sendRequest("listBot")
      .then((x) => {
        bots = x.list;
      })
      .catch((err) => {
        error(err);
      });
  }

  getListBot()
</script>

<div class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded {color === 'light' ? 'bg-white' : 'bg-red-800 text-white'}">
  <div class="rounded-t mb-0 px-4 py-3 border-0">
    <div class="flex flex-wrap items-center">
      <div class="relative w-full px-4 max-w-full flex-grow flex-1">
        <h3 class="font-semibold text-lg {color === 'light' ? 'text-blueGray-700' : 'text-white'}">Bot List</h3>
      </div>
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
            Name
          </th>
          <th
            class="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left {color === 'light'
              ? 'bg-blueGray-50 text-blueGray-500 border-blueGray-100'
              : 'bg-red-700 text-red-200 border-red-600'}"
          >
            Server
          </th>
          <th
            class="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left {color === 'light'
              ? 'bg-blueGray-50 text-blueGray-500 border-blueGray-100'
              : 'bg-red-700 text-red-200 border-red-600'}"
          >
            Cracked
          </th>
          <th
            class="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left {color === 'light'
              ? 'bg-blueGray-50 text-blueGray-500 border-blueGray-100'
              : 'bg-red-700 text-red-200 border-red-600'}"
          >
            Status
          </th>
          <th
            class="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left {color === 'light'
              ? 'bg-blueGray-50 text-blueGray-500 border-blueGray-100'
              : 'bg-red-700 text-red-200 border-red-600'}"
          />
        </tr>
      </thead>
      <tbody>
        {#if bots.length == 0}
          <tr colspan="4">
            <th class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
              <span class="ml-3 font-bold {color === 'light' ? 'btext-blueGray-600' : 'text-whit'}">
                No bot created yet. Perharps <a href="/create" use:link class="underline ">create</a> a new bot?
              </span>
            </th>
          </tr>
        {:else}
          {#each bots as { id, username, serverHost, serverPort, online, cracked }, i}
            <tr>
              <th class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                <img src="https://mineskin.eu/helm/{username}" class="h-12 w-12 bg-white rounded-full border" alt={username} />
                <span class="ml-3 font-bold {color === 'light' ? 'btext-blueGray-600' : 'text-whit'}"> {username} </span>
              </th>
              <td class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"> {serverHost}:{serverPort} </td>
              <td class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"> {cracked ? 'Yes' : 'No'} </td>
              <td class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <i class="fas fa-circle {online ? 'text-green-500' : 'text-rose-600'} mr-2" />
                {online ? 'Online' : 'Offline'}
              </td>
              <td class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                <BotListDropdown {id} hideStartButton={online} botStartedHandler={getListBot} />
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
