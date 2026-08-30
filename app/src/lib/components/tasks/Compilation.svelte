<script lang="ts">
	// Tâche COMPILATION — chasse à l'erreur dans 3 passes de logs de build.
	// Les lignes défilent seules (aucune saisie clavier) ; on clique la ligne
	// ERROR de la passe en cours. Indices déductibles à l'écran (niveau affiché).
	import { connection } from '$lib/client/connection.svelte';
	import { COMPILATION_WAVES } from '$lib/tasks-data';
	import TaskSolved from './TaskSolved.svelte';

	const REVEAL_MS = [700, 500, 350];

	let waveIndex = $state(0);
	let visibleCount = $state(0);
	let clicks = $state<number[]>([]);
	let shakingIndex = $state<number | null>(null);
	let isolatedMsg = $state(false);
	let submitting = $state(false);
	let submitError = $state<string | null>(null);
	let logEl = $state<HTMLDivElement | undefined>();

	let solved = $derived(connection.state?.tasks.compilation.solved ?? false);
	let currentWave = $derived(COMPILATION_WAVES[waveIndex] ?? []);
	let visibleLines = $derived(currentWave.slice(0, visibleCount));

	// Révèle les lignes de la passe courante une par une.
	$effect(() => {
		const wave = COMPILATION_WAVES[waveIndex];
		if (!wave) return;
		visibleCount = 0;
		const delay = REVEAL_MS[waveIndex] ?? 350;
		const timer = setInterval(() => {
			visibleCount += 1;
			if (visibleCount >= wave.length) clearInterval(timer);
		}, delay);
		return () => clearInterval(timer);
	});

	// Défilement automatique vers le bas à chaque nouvelle ligne.
	$effect(() => {
		if (visibleLines.length >= 0 && logEl) logEl.scrollTop = logEl.scrollHeight;
	});

	function triggerShake(index: number) {
		shakingIndex = null;
		requestAnimationFrame(() => (shakingIndex = index));
	}

	async function submit(finalClicks: number[]) {
		submitting = true;
		submitError = null;
		const res = await connection.act({
			type: 'task/submit',
			task: 'compilation',
			payload: { clicks: finalClicks }
		});
		submitting = false;
		if (!res.ok) {
			submitError = res.error ?? 'passe rejetée, on relance une compilation propre';
			clicks = [];
			waveIndex = 0;
		}
	}

	function clickLine(index: number) {
		if (submitting || index >= visibleCount) return;
		const line = currentWave[index];
		if (!line) return;
		if (line.level !== 'ERROR') {
			triggerShake(index);
			return;
		}
		const nextClicks = [...clicks, index];
		clicks = nextClicks;
		if (waveIndex < COMPILATION_WAVES.length - 1) {
			isolatedMsg = true;
			setTimeout(() => (isolatedMsg = false), 900);
			waveIndex += 1;
		} else {
			submit(nextClicks);
		}
	}
</script>

{#if solved}
	<TaskSolved task="compilation" />
{:else}
	<div
		class="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6 font-mono"
		data-testid="task-compilation"
	>
		<p class="text-center text-sm tracking-wide opacity-80">
			Trois passes de compilation. Isolez la ligne ERROR de chaque passe.
		</p>

		<p
			class="text-center text-xs tracking-[0.3em] uppercase opacity-60"
			data-testid="wave-progress"
		>
			Passe {waveIndex + 1}/{COMPILATION_WAVES.length}
		</p>

		<div
			bind:this={logEl}
			class="h-72 overflow-y-auto border p-3 text-sm leading-relaxed"
			style="border-color: var(--game-accent); background-color: color-mix(in oklch, var(--game-bg) 60%, black)"
			data-testid="log-panel"
		>
			{#each visibleLines as line, i (i)}
				<button
					type="button"
					class="log-line block w-full cursor-pointer border-0 bg-transparent px-1 py-0.5 text-left"
					class:shake={shakingIndex === i}
					disabled={submitting}
					onclick={() => clickLine(i)}
					data-testid="log-line-{waveIndex}-{i}"
				>
					<span
						class="mr-2 font-bold"
						class:opacity-40={line.level === 'INFO'}
						class:text-yellow-400={line.level === 'WARN'}
						class:text-red-400={line.level === 'ERROR'}
					>
						{line.level}
					</span><span class:opacity-70={line.level === 'INFO'}>{line.text}</span>
				</button>
			{/each}
		</div>

		{#if isolatedMsg}
			<p class="text-center text-sm opacity-80" data-testid="isolated-feedback">erreur isolée ✓</p>
		{/if}

		{#if submitError}
			<p class="text-center text-sm opacity-80" data-testid="compilation-feedback">
				{submitError}
			</p>
		{/if}
	</div>
{/if}

<style>
	.log-line:focus-visible {
		outline: 1px solid var(--game-accent);
	}

	.shake {
		animation: log-line-shake 300ms ease;
	}

	@keyframes log-line-shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-4px);
		}
		40% {
			transform: translateX(4px);
		}
		60% {
			transform: translateX(-3px);
		}
		80% {
			transform: translateX(3px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shake {
			animation: none;
		}
	}
</style>
