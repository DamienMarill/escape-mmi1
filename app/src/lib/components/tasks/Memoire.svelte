<script lang="ts">
	// Poste DEV — mini-tâche MÉMOIRE : allocation statique de 5 blocs dans une
	// barre de 16 unités (game-design §7). Remplissage exact garanti par
	// construction (5+4+3+2+2 = 16) : aucun état d'échec possible.
	import { connection } from '$lib/client/connection.svelte';
	import { Button } from '$lib/components/ui/button';
	import { MEMOIRE_BAR_SIZE, MEMOIRE_BLOCKS } from '$lib/tasks-data';
	import TaskSolved from './TaskSolved.svelte';

	type MemBlock = (typeof MEMOIRE_BLOCKS)[number];

	const BLOCK_BY_ID = new Map<string, MemBlock>(MEMOIRE_BLOCKS.map((b) => [b.id, b]));

	const BLOCK_COLORS: Record<string, string> = {
		'seg-a': 'oklch(0.7 0.16 30)',
		'seg-b': 'oklch(0.72 0.16 130)',
		'seg-c': 'oklch(0.72 0.14 230)',
		'seg-d': 'oklch(0.74 0.16 300)',
		'seg-e': 'oklch(0.78 0.15 90)'
	};

	/** Graduations d'adresses affichées sous la barre (0x00 → 0x10). */
	const ADDRESS_TICKS = Array.from({ length: MEMOIRE_BAR_SIZE / 4 + 1 }, (_, i) => i * 4);

	let solved = $derived(connection.state?.tasks.memoire.solved ?? false);

	/** Ids des blocs, dans leur ordre de placement (gauche → droite dans la barre). */
	let placedOrder = $state<string[]>([]);
	let attempted = $state(false);
	let submitting = $state(false);
	let feedback = $state<string | null>(null);

	let reserve = $derived(MEMOIRE_BLOCKS.filter((b) => !placedOrder.includes(b.id)));

	let placedBlocks = $derived(
		placedOrder.map((id) => BLOCK_BY_ID.get(id)).filter((b): b is MemBlock => b !== undefined)
	);

	let isComplete = $derived(placedOrder.length === MEMOIRE_BLOCKS.length);

	function place(id: string) {
		if (submitting || placedOrder.includes(id)) return;
		feedback = null;
		placedOrder = [...placedOrder, id];
	}

	function unplace(id: string) {
		if (submitting) return;
		feedback = null;
		attempted = false;
		placedOrder = placedOrder.filter((x) => x !== id);
	}

	async function submit() {
		submitting = true;
		const res = await connection.act({
			type: 'task/submit',
			task: 'memoire',
			payload: { placed: placedOrder }
		});
		submitting = false;
		feedback = res.ok ? null : (res.error ?? "L'allocation n'a pas pu être envoyée, réessayez.");
	}

	$effect(() => {
		if (isComplete && !attempted) {
			attempted = true;
			void submit();
		}
	});
</script>

{#if solved}
	<TaskSolved task="memoire" />
{:else}
	<div
		class="flex w-full max-w-3xl flex-col items-center gap-8 p-6 text-center"
		data-testid="task-memoire"
	>
		<p class="font-mono text-lg tracking-wide">
			Allouez les 5 blocs dans la barre mémoire.<br />Sans dépassement, sans trou.
		</p>

		<div class="w-full space-y-1">
			<div
				class="flex h-16 w-full border border-white/25"
				style="background-image: repeating-linear-gradient(
					to right,
					transparent 0,
					transparent calc(100% / {MEMOIRE_BAR_SIZE} - 1px),
					rgba(255, 255, 255, 0.15) calc(100% / {MEMOIRE_BAR_SIZE} - 1px),
					rgba(255, 255, 255, 0.15) calc(100% / {MEMOIRE_BAR_SIZE})
				);"
				data-testid="mem-bar"
			>
				{#each placedBlocks as block (block.id)}
					<button
						type="button"
						class="flex h-full items-center justify-center border-r border-black/20 font-mono text-sm font-bold text-black/80 transition-opacity hover:opacity-80"
						style="width: {(block.size / MEMOIRE_BAR_SIZE) * 100}%; background-color: {BLOCK_COLORS[
							block.id
						]};"
						data-testid="mem-block-{block.id}"
						onclick={() => unplace(block.id)}
					>
						{block.size}u
					</button>
				{/each}
			</div>
			<div class="flex justify-between font-mono text-[0.65rem] opacity-50">
				{#each ADDRESS_TICKS as addr (addr)}
					<span>0x{addr.toString(16).padStart(2, '0')}</span>
				{/each}
			</div>
		</div>

		<div class="flex flex-wrap items-end justify-center gap-3" data-testid="mem-reserve">
			{#each reserve as block (block.id)}
				<button
					type="button"
					class="flex h-14 items-center justify-center border border-white/30 font-mono text-sm font-bold text-black/80 transition-transform hover:-translate-y-1"
					style="width: {block.size * 2.5}rem; background-color: {BLOCK_COLORS[block.id]};"
					data-testid="mem-block-{block.id}"
					onclick={() => place(block.id)}
				>
					{block.size}u
				</button>
			{/each}
		</div>

		{#if feedback}
			<div class="space-y-3 font-mono text-sm opacity-80" data-testid="mem-feedback">
				<p>{feedback}</p>
				<Button size="sm" onclick={submit} data-testid="mem-retry">Réessayer</Button>
			</div>
		{/if}
	</div>
{/if}
