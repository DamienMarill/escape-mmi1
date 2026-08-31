<script lang="ts">
	// Poste RÉSEAU — table de routage à six segments (game-design §6).
	// Table de correspondance et ordre de branchement affichés EN PERMANENCE.
	// Saisie persistante côté serveur, anti-brute-force 3 essais / 30 s.
	import { connection } from '$lib/client/connection.svelte';
	import { Button } from '$lib/components/ui/button';
	import { BRANCH_ORDER, CORRESPONDENCE_TABLE } from '$lib/tasks-data';
	import type { PortId } from '$lib/types';

	let pub = $derived(connection.state);
	let reseau = $derived(pub?.reseau ?? { entries: {}, attempts: 0, lockedUntil: null });
	let gammaOpen = $derived(pub?.locks.gamma === 'open');

	let feedback = $state<string | null>(null);
	let nowMs = $state(Date.now());
	$effect(() => {
		const t = setInterval(() => (nowMs = Date.now()), 500);
		return () => clearInterval(t);
	});
	// Décalage horloge serveur pour afficher le compte à rebours de recalibrage
	let serverOffset = $derived(pub ? Date.now() - pub.serverNow : 0);
	let lockedForMs = $derived(
		reseau.lockedUntil !== null ? Math.max(0, reseau.lockedUntil + serverOffset - nowMs) : 0
	);
	let locked = $derived(lockedForMs > 0);

	/** Port obtenu = la tâche correspondante est résolue quelque part dans la salle. */
	let obtainedPorts = $derived(
		new Set(
			pub
				? Object.entries(pub.tasks)
						.filter(([, t]) => t.solved)
						.map(([id]) => {
							const map: Record<string, PortId> = {
								compilation: 'A',
								memoire: 'B',
								brassage: 'C',
								parite: 'D',
								synchro: 'E',
								scan: 'F'
							};
							return map[id];
						})
				: []
		)
	);

	async function setEntry(port: PortId, value: string) {
		feedback = null;
		await connection.act({ type: 'reseau/setEntry', port, value });
	}

	async function submit() {
		feedback = null;
		const res = await connection.act({ type: 'reseau/submit' });
		if (!res.ok) feedback = res.error ?? 'tentative non concluante';
	}

	const names = Object.values(CORRESPONDENCE_TABLE);

	/** Valeur hexa d'un nom de la table (lookup inverse, pour l'écran résolu). */
	function hexFor(name: string | undefined): string {
		return Object.entries(CORRESPONDENCE_TABLE).find(([, n]) => n === name)?.[0] ?? '?';
	}
</script>

{#if gammaOpen}
	<!-- Règle n°4 : rien ne disparaît. La table de correspondance reste affichée,
	     et chaque port montre SA VALEUR en très gros — c'est la table rétablie
	     qui donne le code du terminal en phase 2 (§9). -->
	<div class="flex flex-col items-center gap-6 p-8 text-center" data-testid="reseau-solved">
		<p class="font-mono text-3xl tracking-widest uppercase">Table de routage rétablie</p>
		<div class="flex flex-wrap justify-center gap-3 font-mono" data-testid="reseau-final-table">
			{#each BRANCH_ORDER as port (port)}
				<div class="border px-4 py-2" style="border-color: var(--game-accent)">
					<div class="text-xs opacity-60">port {port}</div>
					<div class="text-5xl font-bold" style="color: var(--game-accent)">
						{hexFor(reseau.entries[port])}
					</div>
					<div class="text-xs opacity-80">{reseau.entries[port]}</div>
				</div>
			{/each}
		</div>
		<p class="font-mono text-lg opacity-70">🔓 cadenas γ ouvert · liaison sortante disponible</p>
		<div class="font-mono text-sm opacity-70">
			<h2 class="mb-2 text-xs tracking-[0.3em] uppercase opacity-80">Table de correspondance</h2>
			<table class="border-collapse text-left" data-testid="correspondence-table">
				<tbody>
					{#each Object.entries(CORRESPONDENCE_TABLE) as [hex, name] (hex)}
						<tr class="border-b border-white/10">
							<td class="py-0.5 pr-4 font-bold">{hex}</td>
							<td>{name}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{:else}
	<div class="grid w-full max-w-6xl gap-8 p-6 lg:grid-cols-[1fr_2fr]">
		<!-- Documents affichés en permanence — jamais dans une modale (§6) -->
		<aside class="space-y-6 font-mono text-sm">
			<div>
				<h2 class="mb-2 text-xs tracking-[0.3em] uppercase opacity-60">Table de correspondance</h2>
				<table class="w-full border-collapse" data-testid="correspondence-table">
					<tbody>
						{#each Object.entries(CORRESPONDENCE_TABLE) as [hex, name] (hex)}
							<tr class="border-b border-white/10">
								<td class="py-0.5 pr-4 font-bold">{hex}</td>
								<td>{name}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div>
				<h2 class="mb-2 text-xs tracking-[0.3em] uppercase opacity-60">Ordre de branchement</h2>
				<div class="flex gap-2" data-testid="branch-order">
					{#each BRANCH_ORDER as port (port)}
						<span class="border border-white/30 px-3 py-1 font-bold">{port}</span>
					{/each}
				</div>
			</div>
		</aside>

		<section class="space-y-6">
			<h2 class="font-mono text-sm tracking-[0.3em] uppercase opacity-60">
				Table de routage — six segments
			</h2>
			<div class="grid grid-cols-2 gap-4 xl:grid-cols-3">
				{#each BRANCH_ORDER as port (port)}
					<div
						class="space-y-2 border p-3"
						style="border-color: {obtainedPorts.has(port)
							? 'var(--game-accent)'
							: 'rgba(255,255,255,0.15)'}"
					>
						<div class="flex items-baseline justify-between font-mono">
							<span class="text-lg font-bold">PORT {port}</span>
							<span class="text-xs opacity-60">
								{obtainedPorts.has(port) ? 'OBTENU' : 'EN ATTENTE'}
							</span>
						</div>
						<select
							class="w-full border border-white/20 bg-transparent p-2 font-mono text-sm"
							data-testid="entry-{port}"
							value={reseau.entries[port] ?? ''}
							disabled={locked}
							onchange={(e) => setEntry(port, e.currentTarget.value)}
						>
							<option value="" disabled>—</option>
							{#each names as name (name)}
								<option value={name}>{name}</option>
							{/each}
						</select>
					</div>
				{/each}
			</div>

			{#if locked}
				<p class="font-mono text-lg" data-testid="reseau-lockout">
					RECALIBRAGE DU LECTEUR… {Math.ceil(lockedForMs / 1000)} s
				</p>
			{:else}
				<Button size="lg" onclick={submit} data-testid="reseau-submit">RÉTABLIR LA TABLE</Button>
			{/if}
			{#if feedback}
				<p class="font-mono text-sm opacity-80" data-testid="reseau-feedback">{feedback}</p>
			{/if}
		</section>
	</div>
{/if}
