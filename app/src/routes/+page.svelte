<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { display } from '$lib/components/overlay/display.svelte';
	import { ROLE_LABELS, roleKind } from '$lib/components/overlay/helpers';

	let state = $derived(connection.state);
	let me = $derived(connection.me);
	let postRole = $derived(me?.role && me.role !== 'projector' ? me.role : null);
	let sessionStarted = $derived(state !== null && state.phase !== 'idle');
	/** Suit la bascule décalée par poste, pas la phase serveur (game-design §14.3). */
	let inPhase2 = $derived(display.phase === '2');

	let headerTitle = $derived(
		inPhase2 ? "CONFINEMENT D'URGENCE" : "ÉVALUATION D'ENTRÉE — PROMOTION MMI1"
	);

	async function validateFinale() {
		await connection.act({ type: 'reseau/validate' });
	}
</script>

<div class="flex min-h-dvh flex-col">
	<header class="border-b border-(--game-accent)/30 px-6 py-4">
		<h1 class="font-mono text-sm font-semibold tracking-[0.3em] uppercase">{headerTitle}</h1>
	</header>

	<main class="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
		{#if state?.phase === 'epilogue'}
			<!-- Écran final identique sur les dix postes (game-design §14, « Épilogue »). -->
			<div
				class="flex flex-col items-center gap-4"
				data-testid="epilogue-screen"
				data-ending={state.ending}
			>
				{#if state.ending === 'A'}
					<p class="font-mono text-2xl font-semibold tracking-widest uppercase">
						Procédure terminée
					</p>
					<p class="font-mono text-sm tracking-widest uppercase opacity-70">Évaluation archivée</p>
				{:else}
					<p class="font-mono text-2xl font-semibold tracking-widest text-amber-400 uppercase">
						Procédure interrompue
					</p>
				{/if}
			</div>
		{:else if sessionStarted}
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

				{#if postRole === 'reseau'}
					{#if state?.finale === 'available'}
						<Button size="lg" onclick={validateFinale} data-testid="valider-btn">VALIDER</Button>
					{:else if state?.finale === 'validating'}
						<p class="font-mono text-lg opacity-60">VALIDATION EN COURS…</p>
					{:else if inPhase2}
						<p class="font-mono text-lg opacity-60">…</p>
					{:else}
						<p class="font-mono text-lg opacity-60">module RÉSEAU — en construction</p>
					{/if}
				{:else if inPhase2}
					<!-- Recyclage réel des modules en phase 2 à une étape ultérieure. -->
					<p class="font-mono text-lg opacity-60">…</p>
				{:else if postRole === 'dev'}
					<p class="font-mono text-lg opacity-60">module DEV — en construction</p>
				{:else if postRole === 'image'}
					<p class="font-mono text-lg opacity-60">module IMAGE — en construction</p>
				{:else if postRole === 'systeme'}
					<p class="font-mono text-lg opacity-60">module SYSTÈME — en construction</p>
				{:else}
					<p class="font-mono text-lg opacity-60">
						module {ROLE_LABELS[postRole]} — en construction
					</p>
				{/if}
			{/if}
		{/if}
	</main>
</div>
