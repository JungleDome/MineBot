<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	const SvelteToastOptions = {};

	import Tailwindcss from './components/Tailwind.svelte';

	import { success, error, warn } from './components/toast.js';

	function displayDateTime(epoch) {
		let d = new Date(epoch);
		let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
		let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
		let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
		let time = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d);
		return `${da}/${mo}/${ye} ${time}`;
	}

	let command = "";
	let botStatus = "Offline";
	let serverConfig = {
		servers: [],
		bots: []
	};
	let bots = [];
	let chatHistory = [];
	let logHistory = [];
	let selectedBotItem = null;
	let displayChatTab = true;
	let displayLogTab = false;
	let selectedBot = -1;
	let selectedServer = -1;

	let sendCommand = () => {
		sendRequest('commandBot', 'POST', { botId: selectedBotItem.id, command: command }).then(x => {

		}).catch(err => {
			error(err);
		});
		command = '';
	};

	let getConfig = () => {
		sendRequest('config').then(x => {
			serverConfig = x;
		}).catch(err => {
			error(err);
		});
	};

	let getInfo = () => {
		if (!(selectedBotItem && selectedBotItem.id))
			return;

		sendRequest('getInfo', 'POST', { botId: selectedBotItem.id }).then(x => {
			chatHistory = x.chatHistory;
			logHistory = x.logHistory;
		}).catch(err => {
			error(err);
		});
	};

	let getCurrentBot = () => {
		sendRequest('currentBot').then(x => {
			botStatus = "Online";
			bots = x.bots;
			if (!selectedBotItem) {
				selectedBotItem = bots[0];
			}
		}).catch(err => {
			botStatus = "Offline";
			error(err);
		});
	};

	let startBot = () => {
		sendRequest('createBot', 'POST', { serverIndex: selectedServer, botIndex: selectedBot }).then(x => {
			getCurrentBot();
		}).catch(err => {
			error(err);
		});
	};

	let sendRequest = (uri, method, content) => {
		let xhrMethod = method ?? 'GET';

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open(xhrMethod, `/${uri}`, true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.onreadystatechange = () => {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) {
						resolve(JSON.parse(xhr.response));
					}
					else if (xhr.status >= 400 && xhr.status < 600) {
						reject(JSON.parse(xhr.response).error);
					}
				}
			};
			xhr.onerror = (e) => {
				reject("Unknown Error Occured. Server response not received.");
			};
			xhr.send(JSON.stringify(content));
		});
	};

	getConfig();
	setInterval(getCurrentBot, 1000);
	setInterval(getInfo, 1000);

</script>

<main class="h-screen bg-gradient-to-r from-cyan-100 to-slate-300 place-content-center">
	<!-- <Tailwindcss/> -->
	<h1 class="text-orange-600">Welcome to MineBot!</h1>
	<div class="container mx-auto w-99 py-2 bg-white shadow rounded grid grid-cols-1">
		<div>
			<span class="shadow rounded-full bg-orange-300 uppercase px-2 py-1 text-xs font-normal tracking-wide mr-3">
				Status: {botStatus} <span
					class="shadow {botStatus == 'Online' ? 'text-green-500' : 'text-rose-600'}">⬤</span>
			</span>
		</div>

		<div class="align-center">
			<div class="inline-block w-1/4 mr-2">
				<label class="text-gray-700 text-sm font-bold mb-2" for="selectedServer">
					Server List
				</label>
				<div class="relative">
					<select
						class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
						id="selectedServer" bind:value={selectedServer}>
						<option value="-1">--Please select--</option>
						{#each serverConfig.servers as { host, port, cracked }, i}
						<option value={i}>{host}:{port}</option>
						{/each}
					</select>
					<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
						<svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
							<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
						</svg>
					</div>
				</div>
			</div>
			<div class="inline-block w-1/4 mr-2">
				<label class="text-gray-700 text-sm font-bold mb-2" for="selectedBot">
					Bot List
				</label>
				<div class="relative">
					<select
						class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
						id="selectedBot" bind:value={selectedBot}>
						<option value="-1">--Please select--</option>
						{#each serverConfig.bots as { username }, i}
						<option value={i}>{username}</option>
						{/each}
					</select>
					<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
						<svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
							<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
						</svg>
					</div>
				</div>
			</div>
			<div class="inline-block w-auto mr-2">
				<button class="minebot-button-primary" disabled={selectedBot==-1 || selectedServer==-1}
					on:click={startBot}>Start Bot</button>
			</div>
		</div>
	</div>

	<div class="mx-auto w-full container grid grid-cols-6 mt-4 gap-1">
		{#if bots.length == 0}
		<div class="minebot-bot-item">
			<p>No bots yet.</p>
			<p>Perharps create one?</p>
		</div>
		{:else}
		{#each bots as { id,username,server,status }, i}
		<div class="minebot-bot-item cursor-pointer" class:selected={id==selectedBotItem?.id} on:click={()=>{selectedBotItem = { id,username,server,status };}} on:keydown={() => {}}>
			<span title={status}
				class="float-right {status == 'Normal' ? 'text-green-500' : status == 'Kicked' ? 'text-orange-600' : 'text-rose-600'}">⬤</span>
			<h6 class="font-bold">{username}</h6>
			<p>{server.host}:{server.port}</p>
		</div>
		{/each}
		{/if}
	</div>

	<div class="container mx-auto mt-4">
		<div class="flex flex-none">
			<div class="minebot-container basis-0 px-4 py-2 cursor-pointer" class:selected={displayChatTab}
				on:click={()=> {displayChatTab=true;displayLogTab=false}} on:keydown={() => {}}>
				<p>Chat</p>
			</div>
			<div class="minebot-container basis-0 px-4 py-2 cursor-pointer" class:selected={displayLogTab}
				on:click={()=> {displayChatTab=false;displayLogTab=true}} on:keydown={() => {}}>
				<p>Log</p>
			</div>
		</div>

		<div class="w-full bg-white shadow rounded py-1 px-1 grid grid-cols-1">
			<div class="overflow-y-auto h-25 text-left px-1 max-h-96" class:hidden={displayLogTab}>
				{#if chatHistory.length == 0}
				<p>No chat history yet.</p>
				{:else}
				{#each chatHistory as { timestamp, message }, i}
				<p>[{displayDateTime(timestamp)}] {message}</p>
				{/each}

				{/if}
			</div>

			<div class="overflow-y-auto h-25 text-left px-1 max-h-96" class:hidden={displayChatTab}>
				{#if logHistory.length == 0}
				<p>No log history yet.</p>
				{:else}
				{#each logHistory as { timestamp, message }, i}
				<p>[{displayDateTime(timestamp)}] {message}</p>
				{/each}

				{/if}
			</div>


			<form on:submit|preventDefault={sendCommand}>
				<div class="flex flex-row mt-1">
					<input type="text" class="mr-1" id="command"
						placeholder="Type your command here. Type 'help' for command list." bind:value={command}>
					<button class="minebot-button-primary" disabled={command=='' } type=submit>Send</button>
				</div>
			</form>
		</div>
	</div>

	<button class="minebot-button-primary" on:click={()=> success('Hello world!')}>EMIT TOAST</button>
	<SvelteToast {SvelteToastOptions} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.minebot-button {
		@apply transition;
		@apply duration-700;
		@apply font-bold;
		@apply py-2;
		@apply px-4;
		@apply rounded;
	}

	.minebot-button-primary {
		@apply minebot-button;
		@apply bg-orange-500;
		@apply text-white;
	}

	.minebot-button-primary:hover {
		@apply bg-orange-700;
	}

	.minebot-button-primary:disabled {
		@apply bg-gray-500;
	}

	input[type="text"] {
		@apply shadow;
		@aaply appearance-none;
		@apply border;
		@apply border-orange-400;
		@apply rounded;
		@apply w-full;
		@apply py-2;
		@apply px-3;
		@apply text-gray-700;
		@apply leading-tight;
	}

	input[type="text"]:focus {
		@apply outline-none;
		/* @apply shadow-outline; */
	}

	.minebot-container {
		@apply container;
		@apply bg-white;
		@apply shadow;
		@apply rounded;
	}

	.minebot-bot-item {
		@apply minebot-container;
		@apply px-4;
		@apply py-2;
		@apply text-left;
	}

	.minebot-bot-item.selected {
		@apply border;
		@apply border-orange-400;
	}

	.selected {
		@apply border;
		@apply border-orange-400;
	}
</style>