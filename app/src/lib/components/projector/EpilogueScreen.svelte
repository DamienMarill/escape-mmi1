<script lang="ts">
	import type { PublicState } from '$lib/types';

	let { publicState }: { publicState: PublicState } = $props();
</script>

<div class="epilogue-screen" data-ending={publicState.ending}>
	{#if publicState.ending === 'A'}
		<p class="epilogue-title cold">PROCÉDURE TERMINÉE</p>
	{:else if publicState.ending === 'B'}
		<p class="epilogue-title interrupted">PROCÉDURE INTERROMPUE</p>
	{:else}
		<p class="epilogue-title">FIN DE SESSION</p>
	{/if}
</div>

<style>
	.epilogue-screen {
		display: flex;
		min-height: 100dvh;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono, monospace);
		text-align: center;
	}

	.epilogue-title {
		font-size: clamp(2.5rem, 5.5vw, 5rem);
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	.epilogue-title.cold {
		color: color-mix(in oklch, var(--game-fg) 80%, transparent);
	}

	.epilogue-title.interrupted {
		color: var(--game-accent);
	}
</style>
