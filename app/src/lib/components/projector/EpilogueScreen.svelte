<script lang="ts">
	import type { PublicState } from '$lib/types';

	let { publicState }: { publicState: PublicState } = $props();

	function formatTime(t: number): string {
		return new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
	}

	let deletions = $derived(publicState.sessionHistory.filter((s) => s.ending === 'A').length);
	let protections = $derived(publicState.sessionHistory.filter((s) => s.ending === 'B').length);
</script>

{#if publicState.restitution}
	<div class="restitution-screen" data-testid="restitution">
		<p class="restitution-title">RESTITUTION — JOURNÉE DE RENTRÉE</p>
		<ul class="restitution-list">
			{#each publicState.sessionHistory as session, i (session.endedAt)}
				<li class="restitution-row">
					<span class="restitution-row__label">session {i + 1}</span>
					<span class="restitution-row__time">{formatTime(session.endedAt)}</span>
					<span class="restitution-row__outcome">
						{session.ending === 'A'
							? 'le groupe a supprimé le noyau'
							: 'le groupe a protégé le noyau'}
					</span>
				</li>
			{/each}
		</ul>
		<p class="restitution-tally">{deletions} suppressions · {protections} protections</p>
	</div>
{:else}
	<div class="epilogue-screen" data-ending={publicState.ending}>
		{#if publicState.ending === 'A'}
			<p class="epilogue-title cold">PROCÉDURE TERMINÉE</p>
		{:else if publicState.ending === 'B'}
			<p class="epilogue-title interrupted">PROCÉDURE INTERROMPUE</p>
		{:else}
			<p class="epilogue-title">FIN DE SESSION</p>
		{/if}
	</div>
{/if}

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

	.restitution-screen {
		display: flex;
		min-height: 100dvh;
		flex-direction: column;
		align-items: center;
		gap: 2.5rem;
		padding: clamp(2rem, 5vw, 5rem);
		font-family: var(--font-mono, monospace);
		text-align: center;
	}

	.restitution-title {
		font-size: clamp(2rem, 4.5vw, 3.5rem);
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}

	.restitution-list {
		display: flex;
		width: 100%;
		max-width: 60rem;
		flex-direction: column;
		gap: 1rem;
		list-style: none;
		padding: 0;
		margin: 0;
		overflow-y: auto;
	}

	.restitution-row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.75rem;
		font-size: clamp(1.1rem, 2.2vw, 1.75rem);
		border-bottom: 1px solid color-mix(in oklch, var(--game-fg) 20%, transparent);
		padding-bottom: 0.75rem;
	}

	.restitution-row__label {
		font-weight: 700;
		text-transform: uppercase;
		opacity: 0.8;
	}

	.restitution-row__time {
		opacity: 0.7;
	}

	.restitution-tally {
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		font-weight: 700;
		letter-spacing: 0.1em;
	}
</style>
