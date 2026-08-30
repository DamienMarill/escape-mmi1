<script lang="ts">
	let { armed, onArm }: { armed: boolean; onArm: () => void } = $props();
</script>

<div class="idle-screen">
	<p class="idle-kicker">ÉVALUATION D'ENTRÉE — PROMOTION MMI1</p>
	<p class="idle-status">en attente de lancement</p>
	{#if !armed}
		<button type="button" class="arm-button" onclick={onArm}> ACTIVER LE PROJECTEUR </button>
	{/if}
</div>

<style>
	.idle-screen {
		display: flex;
		min-height: 100dvh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		text-align: center;
		font-family: var(--font-mono, monospace);
	}

	.idle-kicker {
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		font-weight: 700;
		letter-spacing: 0.3em;
		text-transform: uppercase;
	}

	.idle-status {
		font-size: clamp(1rem, 1.6vw, 1.5rem);
		letter-spacing: 0.2em;
		text-transform: uppercase;
		opacity: 0.6;
	}

	.arm-button {
		border: 2px solid var(--game-accent, oklch(0.62 0.14 240));
		border-radius: 1rem;
		padding: 1.5rem 3rem;
		font-family: inherit;
		font-size: clamp(1.25rem, 2.2vw, 2rem);
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: inherit;
		background: color-mix(in oklch, var(--game-accent, oklch(0.62 0.14 240)) 15%, transparent);
		cursor: pointer;
	}

	.arm-button:hover {
		background: color-mix(in oklch, var(--game-accent, oklch(0.62 0.14 240)) 30%, transparent);
	}
</style>
