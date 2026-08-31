<script lang="ts">
	// Séquence purement visuelle accompagnant finale === 'validating' — grille
	// de 4 paliers de 5 s (fiche A9). Le serveur bascule seul quand IRIS prend
	// la parole (VALIDATION_SEQUENCE_MS) ; on ne pilote rien ici.
	// `timeOverride` (secondes) : mode piloté par la régie (/regie), sans timer.

	import { onMount } from 'svelte';

	const STEPS = [
		{ text: 'ANALYSE DES RÉSULTATS…', big: false },
		{ text: 'ÉVALUATION CONFORME', big: false },
		{ text: 'PROFIL ÉTUDIANT ENREGISTRÉ', big: false },
		{ text: 'AUTORISATION SORTANTE ACCORDÉE', big: true }
	] as const;

	let { timeOverride = null }: { timeOverride?: number | null } = $props();

	let internalStep = $state(0);
	let step = $derived(
		timeOverride === null
			? internalStep
			: Math.min(Math.max(0, Math.floor(timeOverride / 5)), STEPS.length - 1)
	);

	onMount(() => {
		if (timeOverride !== null) return;
		const id = setInterval(() => {
			internalStep = Math.min(internalStep + 1, STEPS.length - 1);
		}, 5000);
		return () => clearInterval(id);
	});
</script>

<div class="validating-screen">
	<div class="validating-progress">
		{#each STEPS.keys() as i (i)}
			<div class="progress-bar" class:filled={i <= step}></div>
		{/each}
	</div>
	<p class="validating-text" class:big={STEPS[step].big}>{STEPS[step].text}</p>
</div>

<style>
	.validating-screen {
		display: flex;
		min-height: 100dvh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3rem;
		font-family: var(--font-mono, monospace);
		text-align: center;
	}

	.validating-progress {
		display: flex;
		gap: 1rem;
		width: min(60vw, 40rem);
	}

	.progress-bar {
		flex: 1;
		height: 0.75rem;
		border-radius: 0.5rem;
		background: color-mix(in oklch, var(--game-fg) 15%, transparent);
		overflow: hidden;
	}

	.progress-bar.filled {
		background: var(--game-accent);
	}

	.validating-text {
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}

	.validating-text.big {
		font-size: clamp(2.5rem, 5vw, 4.5rem);
	}
</style>
