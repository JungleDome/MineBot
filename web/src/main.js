import App from './App.svelte';
//import App from './Dashboard.svelte';

const app = new App({
	target: document.getElementById('app'),
	props: {
		name: 'world'
	}
});

export default app;