<script>
  import { afterUpdate } from "svelte";
  import { each } from "svelte/internal";
  import { randomColor, randomColorClass, secondsToDDHHMMSS } from "../store";

  export let totalMinecraftServerOnlineTime = [];

  function getPercentageTotalOnlineTime(value) {
    let total = totalMinecraftServerOnlineTime.reduce((total, x) => total + x.onlineTime, 0);
    return Math.floor((value / total) * 100);
  }
</script>

<div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
  <div class="rounded-t mb-0 px-4 py-3 border-0">
    <div class="flex flex-wrap items-center">
      <div class="relative w-full px-4 max-w-full flex-grow flex-1">
        <h3 class="font-semibold text-base text-blueGray-700">Server Online Time Distribution</h3>
      </div>
    </div>
  </div>
  <div class="block w-full overflow-x-auto">
    <!-- Projects table -->
    <table class="items-center w-full bg-transparent border-collapse">
      <thead class="thead-light">
        <tr>
          <th class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
            Server
          </th>
          <th class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
            Online Duration
          </th>
          <th
            class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left min-w-140-px"
          />
        </tr>
      </thead>
      <tbody>
        {#each totalMinecraftServerOnlineTime as { server, onlineTime, colorClass = randomColorClass() }}
          <tr>
            <th class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left"> {server} </th>
            <td class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"> {secondsToDDHHMMSS(Math.floor(onlineTime/1000))} </td>
            <td class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
              <div class="flex items-center">
                <span class="mr-2">{getPercentageTotalOnlineTime(onlineTime)}%</span>
                <div class="relative w-full">
                  <div class="overflow-hidden h-2 text-xs flex rounded {`bg-${colorClass}-200`}">
                    <div style={`width: ${getPercentageTotalOnlineTime(onlineTime)}%;`} class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center {`bg-${colorClass}-500`}" />
                  </div>
                </div>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
