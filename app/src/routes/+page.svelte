<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import Dev from '$lib/components/epreuves/Dev.svelte';
	import ImageEpreuve from '$lib/components/epreuves/Image.svelte';
	import Reseau from '$lib/components/epreuves/Reseau.svelte';
	import Systeme from '$lib/components/epreuves/Systeme.svelte';
	import { display } from '$lib/components/overlay/display.svelte';
	import { ROLE_LABELS, roleKind } from '$lib/components/overlay/helpers';
	import Ambiance from '$lib/components/phase2/Ambiance.svelte';
	import Document from '$lib/components/phase2/Document.svelte';
	import Terminal from '$lib/components/phase2/Terminal.svelte';
	import Brassage from '$lib/components/tasks/Brassage.svelte';
	import Compilation from '$lib/components/tasks/Compilation.svelte';
	import Memoire from '$lib/components/tasks/Memoire.svelte';
	import Parite from '$lib/components/tasks/Parite.svelte';
	import Scan from '$lib/components/tasks/Scan.svelte';
	import Synchro from '$lib/components/tasks/Synchro.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

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
					<div class="flex w-full flex-col items-center gap-4" data-testid="epreuve-reseau">
						{#if state?.finale === 'available'}
							<Button size="lg" onclick={validateFinale} data-testid="valider-btn">VALIDER</Button>
						{:else if state?.finale === 'validating'}
							<p class="font-mono text-lg opacity-60">VALIDATION EN COURS…</p>
						{/if}
						<Reseau />
					</div>
				{:else if postRole === 'dev'}
					<!-- Épreuves majeures : PERSISTANTES en phase 2 (règle n°4) -->
					<Dev />
				{:else if postRole === 'image'}
					<ImageEpreuve />
				{:else if postRole === 'systeme'}
					<Systeme />
				{:else if inPhase2}
					<!-- Recyclage des tâches (game-design §9) : l'IA occupe l'espace vidé -->
					{#if postRole === 'compilation'}
						<Terminal />
					{:else if postRole === 'memoire' || postRole === 'brassage' || postRole === 'parite'}
						<Document doc={postRole} />
					{:else}
						<Ambiance fragment={postRole === 'synchro' ? 'synchro' : 'scan'} />
					{/if}
				{:else if postRole === 'compilation'}
					<Compilation />
				{:else if postRole === 'memoire'}
					<Memoire />
				{:else if postRole === 'brassage'}
					<Brassage />
				{:else if postRole === 'parite'}
					<Parite />
				{:else if postRole === 'synchro'}
					<Synchro />
				{:else}
					<Scan />
				{/if}
			{/if}
		{/if}
	</main>
</div>
