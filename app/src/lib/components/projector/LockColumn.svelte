<script lang="ts">
	import type { LockStatus } from '$lib/types';
	import type { ChainLink } from './locks';

	let {
		testid,
		letter,
		label,
		status,
		chain
	}: {
		testid: string;
		letter: string;
		label: string;
		status: LockStatus;
		chain: ChainLink[];
	} = $props();
</script>

<div class="lock-column" data-testid={testid} data-status={status}>
	<div class="lock-icon-wrap" data-status={status}>
		<svg viewBox="0 0 100 120" aria-hidden="true">
			<g class="shackle">
				<path d="M 30 55 V 35 A 20 20 0 0 1 70 35 V 55" />
			</g>
			<rect class="body" x="15" y="55" width="70" height="55" rx="10" />
		</svg>
	</div>
	<p class="lock-letter">{letter}</p>
	<p class="lock-label">{label}</p>
	<ul class="chain-list">
		{#each chain as link, i (i)}
			<li class="chain-link" class:resolved={link.resolved} class:highlighted={link.highlighted}>
				<span class="chain-dot">{link.resolved ? '●' : '○'}</span>
				<span class="chain-text">{link.label}</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.lock-column {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		font-family: var(--font-mono, monospace);
		text-align: center;
	}

	.lock-icon-wrap {
		width: clamp(5rem, 9vw, 8rem);
		height: clamp(6rem, 10.8vw, 9.6rem);
	}

	.lock-icon-wrap svg {
		width: 100%;
		height: 100%;
	}

	.lock-icon-wrap .shackle {
		fill: none;
		stroke: var(--lock-stroke, oklch(0.6 0.02 250));
		stroke-width: 10;
		stroke-linecap: round;
		transform-box: fill-box;
		transform-origin: 30% 100%;
		transition: transform 300ms ease;
	}

	.lock-icon-wrap .body {
		fill: var(--lock-body, oklch(0.5 0.02 250));
		transition: fill 300ms ease;
	}

	.lock-icon-wrap[data-status='locked'] {
		--lock-stroke: oklch(0.7 0.02 250);
		--lock-body: oklch(0.5 0.02 250);
	}

	.lock-icon-wrap[data-status='open'] {
		--lock-stroke: oklch(0.75 0.18 145);
		--lock-body: oklch(0.62 0.18 145);
	}

	.lock-icon-wrap[data-status='open'] .shackle {
		transform: rotate(-50deg);
	}

	.lock-letter {
		font-size: clamp(2rem, 3.2vw, 3rem);
		font-weight: 700;
	}

	.lock-label {
		font-size: clamp(1rem, 1.4vw, 1.4rem);
		letter-spacing: 0.2em;
		text-transform: uppercase;
		opacity: 0.75;
	}

	.chain-list {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		width: 100%;
		max-width: 22rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.chain-link {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.6rem;
		font-size: clamp(0.9rem, 1.15vw, 1.2rem);
		opacity: 0.55;
	}

	.chain-link.resolved {
		opacity: 1;
	}

	.chain-dot {
		font-size: 0.8em;
	}

	.chain-link.highlighted {
		color: oklch(0.8 0.16 90);
		font-weight: 700;
		opacity: 1;
	}
</style>
