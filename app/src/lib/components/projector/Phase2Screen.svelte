<script lang="ts">
	// Panneau de transfert de la phase 2 — le chrono déguisé (avenant §4.1).
	// La barre est animée en local à partir de `chrono` + `exfil` : le serveur
	// ne pousse que les trois valeurs, jamais la progression.

	import type { PublicState } from '$lib/types';
	import { CORE_SYMBOL } from '$lib/types';
	import { exfilProgress } from '$lib/exfil';
	import { orbAudio } from '$lib/client/orb-audio.svelte';
	import Orb from './Orb.svelte';

	let { publicState }: { publicState: PublicState } = $props();

	// L'orbe est la présence continue de la phase 2 : elle respire entre deux
	// manifestations et prend la couleur de celle qui parle.
	let orbMood = $derived(
		orbAudio.currentVoice?.startsWith('manif-') ? orbAudio.currentVoice : 'idle-phase2'
	);

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

	let frozen = $derived(publicState.exfil?.frozenAtMs != null);
	let progress = $derived(publicState.exfil ? exfilProgress(publicState.exfil, elapsedMs) : 0);
	let percent = $derived(Math.floor(progress * 100));

	// Le symbole du répertoire est un verrou de connaissance (poste DEV) : il
	// n'apparaît au projecteur qu'une fois le dossier ouvert au terminal.
	let sourcePath = $derived(
		publicState.terminal.stage === 'core'
			? `/sandbox/${CORE_SYMBOL}/noyau.core`
			: '/sandbox/·/noyau.core'
	);
</script>

<div class="exfil-board">
	<header class="exfil-header">
		<h1>CONFINEMENT D'URGENCE</h1>
	</header>

	<div class="orb-presence">
		<Orb mood={orbMood} size="clamp(8rem, 26vh, 15rem)" />
	</div>

	<div class="exfil-panel" data-testid="exfil-panel" data-frozen={frozen}>
		<div class="exfil-title-row">
			<h2>{frozen ? 'TRANSFERT INTERROMPU' : 'TRANSFERT SORTANT'}</h2>
			<p class="exfil-percent" data-testid="exfil-percent">{percent}&nbsp;%</p>
		</div>

		<div
			class="exfil-bar"
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={percent}
		>
			<div class="exfil-fill" style:width="{progress * 100}%"></div>
		</div>

		<dl class="exfil-meta">
			<div>
				<dt>source</dt>
				<dd>{sourcePath}</dd>
			</div>
			<div>
				<dt>destination</dt>
				<dd>—</dd>
			</div>
		</dl>
	</div>
</div>

<style>
	.exfil-board {
		display: flex;
		min-height: 100dvh;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem 3rem;
		font-family: var(--font-mono, monospace);
	}

	.exfil-header {
		border-bottom: 2px solid color-mix(in oklch, var(--game-accent) 40%, transparent);
		padding-bottom: 1rem;
	}

	.exfil-header h1 {
		font-size: clamp(1.5rem, 2.6vw, 2.4rem);
		font-weight: 700;
		letter-spacing: 0.25em;
		text-transform: uppercase;
	}

	.orb-presence {
		display: flex;
		justify-content: center;
		padding-top: clamp(0.5rem, 3vh, 2rem);
	}

	.exfil-panel {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		gap: 2rem;
		max-width: 72rem;
		width: 100%;
		margin-inline: auto;
	}

	.exfil-title-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.exfil-title-row h2 {
		font-size: clamp(1.4rem, 2.4vw, 2.2rem);
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.exfil-panel[data-frozen='true'] .exfil-title-row h2 {
		color: var(--game-accent);
	}

	.exfil-percent {
		font-size: clamp(2rem, 4vw, 3.5rem);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	/* Progression continue et lente, aucun clignotement (§14) : le seul
	   mouvement est le remplissage, lissé entre deux mises à jour. */
	.exfil-bar {
		height: clamp(1.5rem, 3vh, 2.5rem);
		border: 2px solid color-mix(in oklch, var(--game-accent) 60%, transparent);
		border-radius: 0.375rem;
		overflow: hidden;
		background: color-mix(in oklch, var(--game-accent) 8%, transparent);
	}

	.exfil-fill {
		height: 100%;
		background: var(--game-accent);
		transition: width 0.5s linear;
	}

	.exfil-panel[data-frozen='true'] .exfil-fill {
		transition: none;
	}

	.exfil-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: clamp(1rem, 1.6vw, 1.5rem);
	}

	.exfil-meta div {
		display: flex;
		gap: 1rem;
	}

	.exfil-meta dt {
		min-width: 8ch;
		opacity: 0.7;
	}

	.exfil-meta dt::after {
		content: ' :';
	}
</style>
