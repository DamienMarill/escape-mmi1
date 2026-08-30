<script lang="ts">
	// Poste IMAGE — mini-tâche SYNCHRO : caler le pic sonore de la piste audio
	// (fixe, en haut) sur l'image où le clap se referme, en décalant la bande
	// de vignettes (en bas) via un slider. Purement gestuel, aucune saisie
	// texte, aucun son (les postes sont muets — game-design §7).
	import { connection } from '$lib/client/connection.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		SYNCHRO_CLAP_FRAME,
		SYNCHRO_SLIDER_MAX,
		SYNCHRO_SLIDER_MIN,
		SYNCHRO_WAVEFORM
	} from '$lib/tasks-data';
	import TaskSolved from './TaskSolved.svelte';

	let solved = $derived(connection.state?.tasks.synchro.solved ?? false);

	let offset = $state(0);
	let feedback = $state<string | null>(null);
	let submitting = $state(false);

	const frameCount = SYNCHRO_WAVEFORM.length;
	/** Index du pic sonore — repère fixe autour duquel on cale la bande d'images. */
	const peakIndex = SYNCHRO_WAVEFORM.reduce(
		(best, v, i) => (v > SYNCHRO_WAVEFORM[best] ? i : best),
		0
	);
	const markerPercent = ((peakIndex + 0.5) / frameCount) * 100;
	const frameIndices = [...Array(frameCount).keys()];

	let stripShiftPercent = $derived((offset / frameCount) * 100);
	let offsetLabel = $derived(offset > 0 ? `+${offset}` : `${offset}`);

	async function submit() {
		feedback = null;
		submitting = true;
		const res = await connection.act({
			type: 'task/submit',
			task: 'synchro',
			payload: { offset }
		});
		submitting = false;
		if (!res.ok) {
			feedback = res.error ?? 'tentative non concluante — réessayer';
		}
	}
</script>

{#if solved}
	<TaskSolved task="synchro" />
{:else}
	<div
		class="flex w-full max-w-4xl flex-col items-center gap-8 p-6 text-center"
		data-testid="task-synchro"
	>
		<div>
			<h2 class="font-mono text-sm tracking-[0.3em] uppercase opacity-60">Table de montage</h2>
			<p class="mt-2 font-mono text-lg">Alignez le pic sonore sur l'image où le clap se referme.</p>
		</div>

		<div class="track-area" aria-hidden="true">
			<div class="track-row waveform-row">
				{#each SYNCHRO_WAVEFORM as v, i (i)}
					<div class="bar" style="height: {v}%"></div>
				{/each}
			</div>

			<div class="marker" style="left: {markerPercent}%"></div>

			<div class="filmstrip-viewport">
				<div class="track-row filmstrip-row" style="transform: translateX({stripShiftPercent}%)">
					{#each frameIndices as i (i)}
						<div class="frame">
							{#if i === SYNCHRO_CLAP_FRAME}
								<svg viewBox="0 0 24 24" class="clap is-closed">
									<rect x="2" y="11" width="20" height="9" rx="1" />
									<rect x="2" y="6" width="20" height="4" rx="1" />
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" class="clap">
									<rect x="2" y="11" width="20" height="9" rx="1" />
									<path d="M2 9 L12 3 L22 9" />
								</svg>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="flex w-full flex-col items-center gap-3">
			<p class="font-mono text-4xl font-bold" data-testid="synchro-offset">{offsetLabel}</p>
			<input
				type="range"
				min={SYNCHRO_SLIDER_MIN}
				max={SYNCHRO_SLIDER_MAX}
				step="1"
				bind:value={offset}
				class="synchro-range"
				aria-label="Décalage image/son"
				data-testid="synchro-slider"
			/>
		</div>

		<Button size="lg" onclick={submit} disabled={submitting} data-testid="synchro-submit">
			CALER
		</Button>

		{#if feedback}
			<p class="font-mono text-sm opacity-80" data-testid="synchro-feedback">{feedback}</p>
		{/if}
	</div>
{/if}

<style>
	.track-area {
		position: relative;
		width: 100%;
		border: 1px solid color-mix(in oklch, var(--game-fg) 20%, transparent);
		background: color-mix(in oklch, var(--game-bg) 60%, black);
	}

	.track-row {
		display: flex;
		width: 100%;
	}

	.waveform-row {
		align-items: flex-end;
		height: 6rem;
		gap: 2px;
		padding: 0.5rem;
		border-bottom: 1px dashed color-mix(in oklch, var(--game-fg) 25%, transparent);
	}

	.bar {
		flex: 1 1 0;
		min-width: 2px;
		border-radius: 2px 2px 0 0;
		background: var(--game-accent);
	}

	.filmstrip-viewport {
		overflow: hidden;
		width: 100%;
		height: 4.5rem;
	}

	.filmstrip-row {
		height: 100%;
		transition: transform 100ms ease-out;
	}

	.frame {
		flex: 1 1 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 1px solid color-mix(in oklch, var(--game-fg) 10%, transparent);
		background: color-mix(in oklch, var(--game-fg) 5%, transparent);
	}

	.clap {
		width: 65%;
		height: 65%;
		color: var(--game-fg);
		opacity: 0.45;
	}

	.clap rect {
		fill: currentColor;
	}

	.clap path {
		fill: none;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.clap.is-closed {
		color: var(--game-accent);
		opacity: 1;
	}

	.marker {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--game-accent);
		box-shadow: 0 0 8px var(--game-accent);
		pointer-events: none;
	}

	.synchro-range {
		width: 100%;
		max-width: 32rem;
		height: 3rem;
		cursor: pointer;
		accent-color: var(--game-accent);
	}

	.synchro-range::-webkit-slider-thumb {
		width: 2.5rem;
		height: 2.5rem;
	}

	.synchro-range::-moz-range-thumb {
		width: 2.5rem;
		height: 2.5rem;
	}
</style>
