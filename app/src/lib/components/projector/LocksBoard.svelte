<script lang="ts">
	// Écran des trois cadenas, partagé entre phase1 (dépôt) et phase2
	// (confinement) — même contenu, thème géré par .game-root[data-phase] en
	// amont via les variables --game-bg/--game-fg/--game-accent.

	import type { PublicState } from '$lib/types';
	import LockColumn from './LockColumn.svelte';
	import { buildAlphaChain, buildBetaChain, buildGammaChain } from './locks';
	import { formatRemaining } from './chrono';

	let { publicState, headerTitle }: { publicState: PublicState; headerTitle: string } = $props();

	let now = $state(Date.now());
	$effect(() => {
		const id = setInterval(() => {
			now = Date.now();
		}, 500);
		return () => clearInterval(id);
	});

	let offset = $derived(Date.now() - publicState.serverNow);

	let elapsedMs = $derived(
		publicState.chrono.elapsedMs +
			(publicState.chrono.running ? now - publicState.chrono.changedAt - offset : 0)
	);
	let remainingMs = $derived(Math.max(0, publicState.chrono.durationMs - elapsedMs));
	let remainingLabel = $derived(formatRemaining(remainingMs));

	let alphaChain = $derived(buildAlphaChain(publicState));
	let betaChain = $derived(buildBetaChain(publicState));
	let gammaChain = $derived(buildGammaChain(publicState));

	let openCount = $derived(
		(['alpha', 'beta', 'gamma'] as const).filter((lock) => publicState.locks[lock] === 'open')
			.length
	);
</script>

<div class="locks-board">
	<header class="locks-header">
		<h1>{headerTitle}</h1>
		<p class="chrono" data-testid="projector-chrono">{remainingLabel}</p>
	</header>

	{#if publicState.finale === 'available'}
		<p class="finale-banner" data-testid="finale-banner">
			ÉVALUATION COMPLÈTE — VALIDATION DU PROFIL REQUISE
		</p>
	{/if}

	<div class="locks-row">
		<LockColumn
			testid="lock-alpha"
			letter="α"
			label="DEV"
			status={publicState.locks.alpha}
			chain={alphaChain}
		/>
		<LockColumn
			testid="lock-beta"
			letter="β"
			label="SYSTÈME"
			status={publicState.locks.beta}
			chain={betaChain}
		/>
		<LockColumn
			testid="lock-gamma"
			letter="γ"
			label="RÉSEAU"
			status={publicState.locks.gamma}
			chain={gammaChain}
		/>
	</div>

	<p class="lock-counter">{openCount} / 3</p>
</div>

<style>
	.locks-board {
		display: flex;
		min-height: 100dvh;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem 3rem;
		font-family: var(--font-mono, monospace);
	}

	.locks-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 2px solid color-mix(in oklch, var(--game-accent) 40%, transparent);
		padding-bottom: 1rem;
	}

	.locks-header h1 {
		font-size: clamp(1.5rem, 2.6vw, 2.4rem);
		font-weight: 700;
		letter-spacing: 0.25em;
		text-transform: uppercase;
	}

	.chrono {
		font-size: clamp(2rem, 4vw, 3.5rem);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.finale-banner {
		border: 3px solid var(--game-accent);
		border-radius: 0.75rem;
		padding: 1rem 1.5rem;
		text-align: center;
		font-size: clamp(1.25rem, 2.4vw, 2.2rem);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background: color-mix(in oklch, var(--game-accent) 15%, transparent);
		animation: pulse-banner 1.6s ease-in-out infinite;
	}

	@keyframes pulse-banner {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.locks-row {
		display: flex;
		flex: 1;
		align-items: flex-start;
		justify-content: space-around;
		gap: 2rem;
	}

	.lock-counter {
		align-self: center;
		font-size: clamp(1.5rem, 2.4vw, 2.2rem);
		font-weight: 700;
		letter-spacing: 0.1em;
	}
</style>
