<script lang="ts">
	// PARITÉ — contrôle d'intégrité mémoire : une ligne sur huit ne respecte pas
	// son bit de contrôle (impair = 1). Clic sur la ligne corrompue (game-design §7).
	import { connection } from '$lib/client/connection.svelte';
	import { PARITE_ROWS } from '$lib/tasks-data';
	import TaskSolved from './TaskSolved.svelte';

	const ROW_TEMPLATE = 'grid-cols-[3.5rem_repeat(8,2.75rem)_auto]';
	const BIT_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7];

	let solved = $derived(connection.state?.tasks.parite.solved ?? false);

	let feedback = $state<string | null>(null);
	let shakeRow = $state<number | null>(null);
	let pending = $state(false);

	function address(row: number) {
		return '0x' + (row * 8).toString(16).toUpperCase().padStart(2, '0');
	}

	async function submitRow(row: number) {
		if (pending) return;
		pending = true;
		feedback = null;
		const res = await connection.act({ type: 'task/submit', task: 'parite', payload: { row } });
		pending = false;
		if (!res.ok) {
			feedback = res.error ?? 'tentative non concluante — réessayer';
			shakeRow = row;
			setTimeout(() => {
				if (shakeRow === row) shakeRow = null;
			}, 400);
		}
	}
</script>

{#if solved}
	<TaskSolved task="parite" />
{:else}
	<div class="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 font-mono" data-testid="task-parite">
		<div class="space-y-2">
			<h2 class="text-xs tracking-[0.3em] uppercase opacity-60">
				Contrôle de parité — vidage mémoire
			</h2>
			<p class="text-lg">
				Le bit de contrôle vaut <strong>1</strong> si la ligne contient un nombre
				<strong>impair</strong> de 1. Une ligne est corrompue : cliquez-la.
			</p>
		</div>

		<div>
			<div
				class="grid {ROW_TEMPLATE} gap-1 px-3 pb-1 text-[10px] tracking-widest uppercase opacity-40"
			>
				<span></span>
				{#each BIT_INDEXES as bitIndex (bitIndex)}
					<span class="text-center">b{bitIndex}</span>
				{/each}
				<span class="pl-3">ctrl</span>
			</div>

			<div class="overflow-hidden border" style="border-color: rgba(255, 255, 255, 0.15)">
				{#each PARITE_ROWS as row, index (index)}
					<button
						type="button"
						class="parite-row grid {ROW_TEMPLATE} w-full items-center gap-1 border-b px-3 py-3 text-left last:border-b-0 hover:bg-white/5"
						class:parite-row--shake={shakeRow === index}
						style="border-color: rgba(255, 255, 255, 0.1)"
						data-testid="parite-row-{index}"
						onclick={() => submitRow(index)}
					>
						<span class="text-xs opacity-50">{address(index)}</span>
						{#each row.bits as bit, bitIndex (bitIndex)}
							<span
								class="mx-auto flex h-8 w-8 items-center justify-center border text-sm"
								style="border-color: rgba(255, 255, 255, 0.15)"
							>
								{bit}
							</span>
						{/each}
						<span
							class="ml-3 flex h-8 w-10 items-center justify-center border-2 text-sm font-bold"
							style="border-color: var(--game-accent)"
						>
							{row.control}
						</span>
					</button>
				{/each}
			</div>
		</div>

		{#if feedback}
			<p class="text-sm opacity-80" data-testid="parite-feedback">{feedback}</p>
		{/if}
	</div>
{/if}

<style>
	.parite-row--shake {
		animation: parite-shake 400ms ease;
	}

	@keyframes parite-shake {
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

	@media (prefers-reduced-motion: reduce) {
		.parite-row--shake {
			animation: none;
		}
	}
</style>
