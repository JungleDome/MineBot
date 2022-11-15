<script>
  // custom logic
  import { sendRequest } from "../store";
  import { success, error, warn } from "../toast.js";
  import { link, navigate } from "svelte-routing";

  export let id;

  let username = "";
  let password = "";
  let serverHost = "";
  let serverPort = "25565";
  let serverVersion = "1.18.2";
  let cracked = true;
  let isEdit = !!id;

  function getBot() {
    if (!id) return;

    sendRequest("getBot", "POST", { loginInfoId: id })
      .then((x) => {
        let bot = x.bot;
        username = bot.username;
        password = bot.password;
        serverHost = bot.serverHost;
        serverPort = bot.serverPort;
        serverVersion = bot.serverVersion;
        cracked = bot.cracked;
      })
      .catch((err) => {
        error(err);
      });
  }

  function updateBot() {
    if (!id) return;

    sendRequest("updateBot", "POST", { loginInfoId: id, username, password, serverHost, serverPort, serverVersion, cracked })
      .then((x) => {
        success('Successfully updated!')
        navigate("/list")
      })
      .catch((err) => {
        error(err);
      });
  }

  function startBot() {
    sendRequest("createBot", "POST", { username, password, serverHost, serverPort, serverVersion, cracked })
      .then((x) => {
        success('Successfully created!')
        navigate("/list")
      })
      .catch((err) => {
        error(err);
      });
  }

  function submit() {
    isEdit ? updateBot() : startBot();
  }

  //load login info on edit page
  if (isEdit) getBot();
</script>

<div class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
  <div class="rounded-t bg-white mb-0 px-6 py-6">
    <div class="text-center flex justify-between">
      <h6 class="text-blueGray-700 text-xl font-bold">Bots</h6>
      <button
        class="bg-red-500 text-white disabled:bg-gray-400 active:bg-red-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        disabled={!(username && password && serverHost && serverPort && serverVersion)}
        on:click={submit}
      >
        {isEdit ? "Edit" : "Create"} Bot
      </button>
    </div>
  </div>
  <div class="flex-auto px-4 lg:px-10 py-10 pt-0">
    <form>
      <h6 class="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">Bot Information</h6>
      <div class="flex flex-wrap">
        <div class="w-full lg:w-full px-4">
          <div class="relative w-full mb-3">
            <label class="block uppercase text-blueGray-600 text-xs font-bold mb-2" for="cracked"> Cracked </label>
            <div class="relative">
              <input
                id="cracked"
                type="checkbox"
                class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 rounded text-sm shadow focus:outline-none ease-linear transition-all duration-150"
                bind:checked={cracked}
              />
            </div>
          </div>
        </div>
        <div class="w-full lg:w-6/12 px-4">
          <label class="block uppercase text-blueGray-600 text-xs font-bold mb-2" for="username"> Username </label>
          <div class="relative">
            <input
              id="username"
              type="text"
              class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
              bind:value={username}
            />
          </div>
        </div>
        <div class="w-full lg:w-6/12 px-4">
          <div class="relative w-full mb-3">
            <label class="block uppercase text-blueGray-600 text-xs font-bold mb-2" for="password"> Password </label>
            <div class="relative">
              <input
                id="password"
                type="password"
                class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                bind:value={password}
              />
            </div>
          </div>
        </div>
      </div>
      <h6 class="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">Server Information</h6>
      <div class="flex flex-wrap">
        <div class="w-full lg:w-6/12 px-4">
          <label class="block uppercase text-blueGray-600 text-xs font-bold mb-2" for="serverHost"> Host </label>
          <div class="relative">
            <input
              id="serverHost"
              type="text"
              class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
              bind:value={serverHost}
            />
          </div>
        </div>
        <div class="w-full lg:w-6/12 px-4">
          <div class="relative w-full mb-3">
            <label class="block uppercase text-blueGray-600 text-xs font-bold mb-2" for="serverPort"> Port </label>
            <div class="relative">
              <input
                id="serverPort"
                type="text"
                class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                bind:value={serverPort}
              />
            </div>
          </div>
        </div>
        <div class="w-full lg:w-6/12 px-4">
          <div class="relative w-full mb-3">
            <label class="block uppercase text-blueGray-600 text-xs font-bold mb-2" for="serverVersion"> Version </label>
            <div class="relative">
              <input
                id="serverVersion"
                type="text"
                class="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                bind:value={serverVersion}
              />
            </div>
          </div>
        </div>
      </div>
      <button
        class="mt-3 float-right bg-red-500 text-white disabled:bg-gray-400 active:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        disabled={!(username && password && serverHost && serverPort && serverVersion)}
        on:click={submit}
      >
        {isEdit ? "Edit" : "Create"} bot
      </button>
    </form>
  </div>
</div>
