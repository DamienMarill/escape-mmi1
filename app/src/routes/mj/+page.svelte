<script lang="ts">
	import { browser } from '$app/environment';
	import { connection } from '$lib/client/connection.svelte';
	import PostesPanel from '$lib/components/mj/postes-panel.svelte';
	import SessionPanel from '$lib/components/mj/session-panel.svelte';
	import ChronoPanel from '$lib/components/mj/chrono-panel.svelte';
	import GraphePanel from '$lib/components/mj/graphe-panel.svelte';
	import SoupapesPanel from '$lib/components/mj/soupapes-panel.svelte';
	import CalmModePanel from '$lib/components/mj/calm-mode-panel.svelte';
	import JournalPanel from '$lib/components/mj/journal-panel.svelte';

	let publicState = $derived(connection.state);

	let serverUrl = $derived(browser ? window.location.origin : '');

	/** Fait défiler jusqu'au formulaire d'indice du poste, depuis le panneau Postes (§5). */
	function focusHint(clientId: string) {
		requestAnimationFrame(() => {
			document.getElementById(`hint-${clientId}`)?.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
			document.getElementById(`hint-text-${clientId}`)?.focus();
		});
	}
</script>

<svelte:head>
	<title>Console MJ — Escape MMI1</title>
</svelte:head>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<header
		class="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-2"
	>
		<h1 class="font-mono text-lg font-bold tracking-tight">Console MJ</h1>
		<span class="font-mono text-xs text-neutral-400">{serverUrl}</span>
	</header>

	{#if !publicState}
		<p class="p-8 text-neutral-400">Chargement de l'état…</p>
	{:else}
		<div class="grid grid-cols-1 gap-3 p-3 xl:grid-cols-2 2xl:grid-cols-3">
			<PostesPanel {publicState} onIndice={focusHint} />
			<SessionPanel {publicState} />
			<ChronoPanel {publicState} />
			<GraphePanel {publicState} />
			<SoupapesPanel {publicState} />
			<CalmModePanel {publicState} />
			<JournalPanel {publicState} />
		</div>
	{/if}
</div>
