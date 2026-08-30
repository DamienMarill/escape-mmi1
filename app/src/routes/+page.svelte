<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { ROLE_LABELS, isPhase2, roleKind } from '$lib/components/overlay/helpers';

	let state = $derived(connection.state);
	let me = $derived(connection.me);
	let postRole = $derived(me?.role && me.role !== 'projector' ? me.role : null);
	let sessionStarted = $derived(state !== null && state.phase !== 'idle');

	let headerTitle = $derived(
		isPhase2(state?.phase) ? "CONFINEMENT D'URGENCE" : "ÉVALUATION D'ENTRÉE — PROMOTION MMI1"
	);
</script>

<div class="flex min-h-dvh flex-col">
	<header class="border-b border-(--game-accent)/30 px-6 py-4">
		<h1 class="font-mono text-sm font-semibold tracking-[0.3em] uppercase">{headerTitle}</h1>
	</header>

	<main class="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
		{#if sessionStarted}
			{#if !postRole}
				<p class="font-mono text-sm tracking-widest uppercase opacity-70">
					En attente d'assignation
				</p>
				<p class="font-mono text-6xl font-bold tabular-nums">{connection.number ?? '—'}</p>
			{:else}
				<Badge
					variant={roleKind(postRole) === 'epreuve' ? 'default' : 'secondary'}
					class="tracking-widest uppercase"
				>
					{roleKind(postRole) === 'epreuve' ? 'Épreuve' : 'Tâche'}
				</Badge>
				<p class="font-mono text-2xl font-semibold tracking-wide uppercase">
					{ROLE_LABELS[postRole]}
				</p>

				{#if postRole === 'dev'}
					<p class="font-mono text-lg opacity-60">module DEV — en construction</p>
				{:else if postRole === 'image'}
					<p class="font-mono text-lg opacity-60">module IMAGE — en construction</p>
				{:else if postRole === 'systeme'}
					<p class="font-mono text-lg opacity-60">module SYSTÈME — en construction</p>
				{:else if postRole === 'reseau'}
					<p class="font-mono text-lg opacity-60">module RÉSEAU — en construction</p>
				{:else}
					<p class="font-mono text-lg opacity-60">
						module {ROLE_LABELS[postRole]} — en construction
					</p>
				{/if}
			{/if}
		{/if}
	</main>
</div>
