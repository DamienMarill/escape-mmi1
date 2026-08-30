<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { connection } from '$lib/client/connection.svelte';
	import BlockingLayer from '$lib/components/overlay/BlockingLayer.svelte';
	import EventLayer from '$lib/components/overlay/EventLayer.svelte';
	import { isPhase2 } from '$lib/components/overlay/helpers';

	let { children } = $props();

	let pathname = $derived(page.url.pathname as string);
	let isPostPage = $derived(pathname !== '/mj' && pathname !== '/projector');
	let phase2 = $derived(isPhase2(connection.state?.phase));

	let noTransition = $state(false);

	onMount(() => {
		connection.start({ asPost: isPostPage });
	});

	$effect(() => {
		if (!connection.syncing) {
			noTransition = true;
			requestAnimationFrame(() => {
				noTransition = false;
			});
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div
	class="game-root"
	class:no-transition={noTransition}
	class:calm={connection.state?.calmMode}
	data-phase={phase2 ? '2' : '1'}
>
	{@render children()}
	<BlockingLayer {isPostPage} />
	<EventLayer />
	<audio id="game-audio"></audio>
</div>
