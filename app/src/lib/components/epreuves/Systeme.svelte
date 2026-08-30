<script lang="ts">
	// Poste SYSTÈME — explorateur de fichiers à cadenas (game-design §6 P3).
	// Le puzzle est un problème de quota de verrous, pas un secret : la règle
	// d'accès et l'arborescence sont affichées en permanence, prérequis ou non.
	// L'état des verrous est PARTAGÉ et PERSISTANT côté serveur (§14.4, §7 phase 2) :
	// aucun état local pour les cadenas eux-mêmes.
	import { connection } from '$lib/client/connection.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ACCESS_RULE, BASE_QUOTA, FS_TREE, TARGET_FILE, locksFor } from '$lib/systeme-data';
	import Folder from '@lucide/svelte/icons/folder';
	import FileIcon from '@lucide/svelte/icons/file';

	let pub = $derived(connection.state);
	let systeme = $derived(pub?.systeme ?? { locks: [] });
	let openLocks = $derived(new Set(systeme.locks));
	let solved = $derived(pub?.epreuves.systeme.solved ?? false);

	let imageSolved = $derived(pub?.epreuves.image.solved ?? false);
	let brassageSolved = $derived(pub?.tasks.brassage.solved ?? false);
	let pariteSolved = $derived(pub?.tasks.parite.solved ?? false);

	/** Quota côté client (game-design §6) : base + 1 par verrou supplémentaire accordé. */
	let quota = $derived(BASE_QUOTA + (brassageSolved ? 1 : 0) + (pariteSolved ? 1 : 0));
	let used = $derived(systeme.locks.length);

	let deps = $derived([
		{ key: 'schema', label: 'schéma cible', ok: imageSolved, source: 'poste IMAGE' },
		{
			key: 'brassage',
			label: 'verrou supplémentaire #1',
			ok: brassageSolved,
			source: 'un poste TÂCHE'
		},
		{
			key: 'parite',
			label: 'verrou supplémentaire #2',
			ok: pariteSolved,
			source: 'un poste TÂCHE'
		}
	]);
	let allDepsMet = $derived(deps.every((d) => d.ok));

	let feedback = $state<string | null>(null);
	let quotaShake = $state(false);
	let shakeTimeout: ReturnType<typeof setTimeout> | undefined;

	async function toggleLock(lock: string) {
		feedback = null;
		const res = await connection.act({ type: 'systeme/toggle', lock });
		if (!res.ok) {
			feedback = res.error ?? 'quota de verrous atteint — libère-en un ailleurs avant celui-ci';
			quotaShake = true;
			clearTimeout(shakeTimeout);
			shakeTimeout = setTimeout(() => (quotaShake = false), 400);
		}
	}

	async function openTarget() {
		feedback = null;
		const res = await connection.act({ type: 'systeme/openTarget' });
		if (!res.ok) feedback = res.error ?? 'accès refusé…';
	}
</script>

<div class="flex w-full max-w-6xl flex-col gap-6 p-6 font-mono" data-testid="epreuve-systeme">
	{#if !allDepsMet}
		<div
			class="border p-4 text-sm"
			style="border-color: var(--game-accent)"
			data-testid="systeme-deps"
		>
			<p class="mb-2 tracking-[0.2em] uppercase opacity-80">
				Épreuve système — configuration verrouillée
			</p>
			<ul class="space-y-1.5">
				{#each deps as dep, i (dep.key)}
					<li class="flex items-baseline gap-2" data-testid="systeme-dep-{dep.key}">
						<span class="opacity-50">{i === deps.length - 1 ? '└─' : '├─'}</span>
						<span class="shrink-0">{dep.label}</span>
						<span class="mx-1 flex-1 border-b border-dotted border-white/20"></span>
						{#if dep.ok}
							<span class="font-bold" style="color: var(--game-accent)">✓</span>
						{:else}
							<span class="shrink-0 opacity-80">MANQUANT · source : {dep.source}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="grid gap-6 lg:grid-cols-[1fr_2fr]">
		<aside class="space-y-6">
			<div>
				<h2 class="mb-1 text-xs tracking-[0.3em] uppercase opacity-60">Quota de verrous</h2>
				<p
					class="text-5xl font-bold xl:text-6xl"
					class:animate-shake={quotaShake}
					data-testid="systeme-quota"
				>
					VERROUS : {used} / {quota}
				</p>
			</div>
			<div class="border border-white/20 p-4 text-sm">
				<h2 class="mb-1 text-xs tracking-[0.3em] uppercase opacity-60">Règle d'accès</h2>
				<p class="opacity-90">{ACCESS_RULE}</p>
			</div>
			{#if feedback}
				<p class="text-sm opacity-80" data-testid="systeme-feedback">{feedback}</p>
			{/if}
		</aside>

		<section class="space-y-4">
			<h2 class="text-xs tracking-[0.3em] uppercase opacity-60">Arborescence</h2>
			<div class="border border-white/10">
				{#each FS_TREE as node (node.path)}
					{@const isTarget = node.path === TARGET_FILE}
					<div
						class="flex items-center gap-2 border-b border-white/5 px-2 py-1.5 last:border-b-0"
						style:padding-left="{0.75 + node.depth * 1.5}rem"
						style:background-color={isTarget
							? 'color-mix(in oklch, var(--game-accent) 15%, transparent)'
							: 'transparent'}
					>
						{#if node.kind === 'dir'}
							<Folder class="size-4 shrink-0 opacity-70" />
						{:else}
							<FileIcon class="size-4 shrink-0 opacity-70" />
						{/if}
						<span class="flex-1 truncate" class:font-bold={isTarget}>{node.name}</span>
						<div class="flex shrink-0 gap-1">
							{#each locksFor(node) as lock (lock)}
								{@const type = lock.slice(0, 1)}
								{@const open = openLocks.has(lock)}
								<button
									type="button"
									class="flex size-6 items-center justify-center rounded-full border text-[0.65rem] font-bold uppercase transition-colors"
									style:border-color={open ? 'var(--game-accent)' : 'rgba(255,255,255,0.3)'}
									style:color={open ? 'var(--game-accent)' : 'rgba(255,255,255,0.5)'}
									style:background-color={open
										? 'color-mix(in oklch, var(--game-accent) 20%, transparent)'
										: 'transparent'}
									aria-pressed={open}
									aria-label="{type === 'x' ? 'traverser' : 'lire'} {node.path}"
									data-testid="lock-{type}-{node.path}"
									onclick={() => toggleLock(lock)}
								>
									{type}
								</button>
							{/each}
						</div>
						{#if isTarget}
							<Button size="sm" onclick={openTarget} data-testid="systeme-open">OUVRIR</Button>
						{/if}
					</div>
				{/each}
			</div>

			{#if solved}
				<div
					class="border p-4"
					style="border-color: var(--game-accent)"
					data-testid="systeme-solved"
				>
					<p class="text-lg tracking-widest uppercase">
						Segment de validation β — session archivée 2019
					</p>
					<p class="mt-2 text-xl font-bold" style="color: var(--game-accent)">
						🔓 cadenas β ouvert
					</p>
				</div>
			{/if}
		</section>
	</div>
</div>

<style>
	@keyframes systeme-quota-shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-6px);
		}
		40% {
			transform: translateX(6px);
		}
		60% {
			transform: translateX(-4px);
		}
		80% {
			transform: translateX(4px);
		}
	}

	.animate-shake {
		animation: systeme-quota-shake 400ms ease-in-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.animate-shake {
			animation: none;
		}
	}
</style>
