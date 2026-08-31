<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { connection } from '$lib/client/connection.svelte';
	import { keepScreenAwake } from '$lib/client/wake-lock';
	import BlockingLayer from '$lib/components/overlay/BlockingLayer.svelte';
	import { display, syncDisplayPhase } from '$lib/components/overlay/display.svelte';
	import EventLayer from '$lib/components/overlay/EventLayer.svelte';
	import Manifestation from '$lib/components/phase2/Manifestation.svelte';

	let { children } = $props();

	let pathname = $derived(page.url.pathname as string);
	let isPostPage = $derived(
		pathname !== '/mj' && pathname !== '/projector' && pathname !== '/regie'
	);

	let noTransition = $state(false);

	onMount(() => {
		connection.start({ asPost: isPostPage });
		// Aucun écran de la salle ne doit partir en veille pendant une session.
		return keepScreenAwake();
	});

	$effect(() => {
		if (!connection.syncing) {
			noTransition = true;
			requestAnimationFrame(() => {
				noTransition = false;
			});
		}
	});

	// Décale l'affichage de la bascule par poste (game-design §14.3) : la phase serveur
	// change au même instant sur les dix postes, la peau affichée change en vague.
	$effect(() => {
		const state = connection.state;
		if (!state) return;
		syncDisplayPhase(state, connection.clientId);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div
	class="game-root"
	class:no-transition={noTransition}
	class:calm={connection.state?.calmMode}
	data-phase={display.phase}
	data-testid="game-root"
>
	{@render children()}
	<BlockingLayer {isPostPage} />
	<EventLayer />
	<Manifestation />
	<audio id="game-audio"></audio>
</div>
