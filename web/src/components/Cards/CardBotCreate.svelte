<script>
  // custom logic
  import { sendRequest } from "../store";
  import { success, error, warn } from "../../components/toast.js";
  let serverConfig = {
    servers: [],
    bots: [],
  };
  let selectedBot = -1;
  let selectedServer = -1;

  function getConfig() {
    sendRequest("config")
      .then((x) => {
        serverConfig = x;
      })
      .catch((err) => {
        error(err);
      });
  }

  function startBot() {
		sendRequest('createBot', 'POST', { serverIndex: selectedServer, botIndex: selectedBot }).then(x => {
		}).catch(err => {
			error(err);
		});
	};

  getConfig();
</script>

<div class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
  <div class="rounded-t bg-white mb-0 px-6 py-6">
    <div class="text-center flex justify-between">
      <h6 class="text-blueGray-700 text-xl font-bold">Bots</h6>
      <button
        class="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
      >
        Create Bot
      </button>
    </div>
  </div>
  <div class="flex-auto px-4 lg:px-10 py-10 pt-0">
    <form>
      <h6 class="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">Bot Information</h6>
      <div class="flex flex-wrap">
        <div class="w-full lg:w-6/12 px-4">
          <div class="relative w-full mb-3">
            <label class="block uppercase text-blueGray-600 text-xs font-bold mb-2" for="selectedServer"> Server List </label>
            <!-- <label class="text-gray-700 text-sm font-bold mb-2" for="selectedServer"> Server List </label> -->
            <div class="relative">
              <select
                id="selectedServer"
                class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                bind:value={selectedServer}
              >
                <option value="-1">--Please select--</option>
                {#each serverConfig.servers as { host, port, cracked }, i}
                  <option value={i}>{host}:{port}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
        <div class="w-full lg:w-6/12 px-4">
          <div class="relative w-full mb-3">
            <label class="block uppercase text-blueGray-600 text-xs font-bold mb-2" for="selectedBot"> Bot List </label>
            <div class="relative">
              <select
                id="selectedBot"
                class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                bind:value={selectedBot}
              >
                <option value="-1">--Please select--</option>
                {#each serverConfig.bots as { username }, i}
                  <option value={i}>{username}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      </div>
      <button
        class="mt-3 float-right bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        disabled={selectedBot == -1 || selectedServer == -1}
        on:click={startBot}
      >
        Create bot
      </button>
    </form>
  </div>
</div>
