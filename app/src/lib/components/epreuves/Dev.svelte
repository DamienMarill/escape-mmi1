<script lang="ts">
	// Poste DEV — séquenceur (game-design §6 P1). Grille visuelle, palette de
	// blocs, exécution animée en local (simulate()) ; la validation qui compte
	// reste serveur (dev/submit). Dépendance nommée affichée en permanence
	// sous les blocs verrouillés (règle impérative §5).
	import { connection } from '$lib/client/connection.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		BASE_BLOCKS,
		BLOCK_LABELS,
		ENERGY_BUDGET,
		GRID,
		GRID_H,
		GRID_W,
		LOCKED_BLOCKS,
		MAX_SLOTS,
		simulate,
		type BlockId
	} from '$lib/dev-sim';
	// Source unique du symbole : le terminal de phase 2 lit la MÊME constante.
	// Un littéral dupliqué ici rendrait la phase 2 insoluble sans rien casser
	// de visible en phase 1.
	import { CORE_SYMBOL } from '$lib/types';

	const ALL_BLOCKS: BlockId[] = [...BASE_BLOCKS, 'repete-avance', 'si-mur-tourne'];
	/** Rotation à appliquer à un glyphe pointant nativement le nord (0=est 1=sud 2=ouest 3=nord). */
	const ROT_FROM_NORTH = [90, 180, 270, 0];
	const ROWS = Array.from({ length: GRID_H }, (_, i) => i);
	const COLS = Array.from({ length: GRID_W }, (_, i) => i);
	const SLOT_INDICES = Array.from({ length: MAX_SLOTS }, (_, i) => i);

	function findCell(ch: string): { x: number; y: number } {
		for (let y = 0; y < GRID_H; y++) {
			const x = GRID[y].indexOf(ch);
			if (x >= 0) return { x, y };
		}
		return { x: 0, y: 0 };
	}
	const START = findCell('S');
	const TARGET = findCell('T');

	let program = $state<BlockId[]>([]);
	let animating = $state(false);
	let robot = $state({ x: START.x, y: START.y, dir: 0 });
	let energy = $state(ENERGY_BUDGET);
	let feedback = $state<string | null>(null);

	let solved = $derived(connection.state?.epreuves.dev.solved ?? false);
	let repeteUnlocked = $derived(connection.state?.tasks.memoire.solved ?? false);
	let siMurUnlocked = $derived(connection.state?.tasks.compilation.solved ?? false);
	let lockedRemaining = $derived(
		LOCKED_BLOCKS.filter((b) => (b.id === 'repete-avance' ? !repeteUnlocked : !siMurUnlocked))
	);

	// Le robot doit apparaître sur la cible dès l'affichage si l'épreuve est
	// déjà résolue (rechargement de page) — persistance, règle n°4.
	// ATTENTION : ne rien LIRE de `robot` ici — un effet qui lit et écrit la
	// même rune se re-déclenche à l'infini et gèle le thread.
	$effect(() => {
		if (solved) robot = { x: TARGET.x, y: TARGET.y, dir: 2 };
	});

	function isUnlocked(block: BlockId): boolean {
		if (block === 'repete-avance') return repeteUnlocked;
		if (block === 'si-mur-tourne') return siMurUnlocked;
		return true;
	}

	function addBlock(block: BlockId) {
		if (animating || solved || !isUnlocked(block) || program.length >= MAX_SLOTS) return;
		program = [...program, block];
	}

	function removeSlot(index: number) {
		if (animating || solved) return;
		program = program.filter((_, i) => i !== index);
	}

	function reset() {
		if (animating) return;
		program = [];
		feedback = null;
		robot = { x: START.x, y: START.y, dir: 0 };
		energy = ENERGY_BUDGET;
	}

	function sleep(ms: number) {
		return new Promise<void>((r) => setTimeout(r, ms));
	}

	async function run() {
		if (animating || solved || program.length === 0) return;
		animating = true;
		feedback = null;
		const result = simulate(program);
		robot = { x: START.x, y: START.y, dir: 0 };
		energy = ENERGY_BUDGET;

		for (const step of result.steps) {
			await sleep(250);
			robot = { x: step.x, y: step.y, dir: step.dir };
			energy -= 1;
		}
		animating = false;

		if (!result.success) {
			feedback = result.outcome === 'energy' ? 'énergie épuisée' : 'le robot tourne en rond';
		}

		// La validation qui compte est serveur ; on l'envoie dans tous les cas
		// (le serveur compte les échecs consécutifs, cf. game-design §6).
		const res = await connection.act({ type: 'dev/submit', program });
		if (!res.ok && res.error) feedback = res.error;
	}
</script>

{#snippet grid()}
	<div
		class="relative grid gap-0.5"
		style="grid-template-columns: repeat({GRID_W}, 2.5rem); grid-template-rows: repeat({GRID_H}, 2.5rem);"
		data-testid="dev-grid"
	>
		{#each ROWS as y (y)}
			{#each COLS as x (x)}
				{@const ch = GRID[y][x]}
				<div
					class="flex items-center justify-center border text-lg"
					style="grid-column: {x + 1}; grid-row: {y +
						1}; border-color: rgba(255,255,255,0.08); background-color: {ch === '#'
						? 'rgba(0,0,0,0.5)'
						: 'rgba(255,255,255,0.06)'};"
				>
					{#if ch === 'T'}
						<span
							class:animate-pulse={solved}
							style="color: var(--game-accent); opacity: {solved ? 1 : 0.25}"
							data-testid="dev-symbol"
						>
							{CORE_SYMBOL}
						</span>
					{/if}
				</div>
			{/each}
		{/each}
		{#if !solved}
			<div
				class="pointer-events-none flex items-center justify-center text-2xl"
				style="grid-column: {robot.x + 1}; grid-row: {robot.y + 1}; transform: rotate({ROT_FROM_NORTH[
					robot.dir
				]}deg); color: var(--game-accent); transition: transform 150ms ease;"
				data-testid="dev-robot"
			>
				▲
			</div>
		{/if}
	</div>
{/snippet}

<div
	class="flex w-full max-w-6xl flex-col items-center gap-8 p-6 font-mono"
	style="background-color: var(--game-bg); color: var(--game-fg)"
	data-testid="epreuve-dev"
>
	{#if solved}
		<div class="flex flex-col items-center gap-6 text-center" data-testid="dev-solved">
			{@render grid()}
			<div class="flex flex-col items-center gap-2">
				<p class="text-xs tracking-[0.3em] uppercase opacity-60">Symbole déposé</p>
				<p
					class="leading-none"
					style="font-size: 7rem; color: var(--game-accent)"
					data-testid="dev-symbol-large"
				>
					{CORE_SYMBOL}
				</p>
			</div>
			<p class="text-xl tracking-widest uppercase">🔓 cadenas α ouvert</p>
		</div>
	{:else}
		<div class="grid w-full gap-8 lg:grid-cols-[1fr_2fr]">
			<aside class="space-y-6">
				<div>
					<h2 class="mb-2 text-xs tracking-[0.3em] uppercase opacity-60">Blocs disponibles</h2>
					<div class="flex flex-wrap gap-2" data-testid="dev-palette">
						{#each ALL_BLOCKS as block (block)}
							<Button
								variant="outline"
								disabled={!isUnlocked(block) || animating || program.length >= MAX_SLOTS}
								onclick={() => addBlock(block)}
								data-testid="dev-block-{block}"
							>
								{BLOCK_LABELS[block]}
							</Button>
						{/each}
					</div>
				</div>

				{#if lockedRemaining.length > 0}
					<div
						class="border-l-2 py-1 pl-3 text-sm opacity-80"
						style="border-color: var(--game-accent)"
						data-testid="dev-locked-info"
					>
						<p>
							{lockedRemaining.length} instruction{lockedRemaining.length > 1 ? 's' : ''} verrouillée{lockedRemaining.length >
							1
								? 's'
								: ''}
						</p>
						{#each lockedRemaining as b, i (b.id)}
							<p>
								{i === lockedRemaining.length - 1 ? '└─' : '├─'}
								{b.label} ....... source : {b.source}
							</p>
						{/each}
					</div>
				{/if}

				<div>
					<h2 class="mb-2 text-xs tracking-[0.3em] uppercase opacity-60">Séquence</h2>
					<div class="flex gap-2" data-testid="dev-slots">
						{#each SLOT_INDICES as i (i)}
							{#if program[i]}
								<button
									type="button"
									class="border px-3 py-2 text-left text-sm"
									style="border-color: var(--game-accent)"
									disabled={animating}
									onclick={() => removeSlot(i)}
									data-testid="dev-slot-{i}"
								>
									{BLOCK_LABELS[program[i]]}
								</button>
							{:else}
								<div
									class="border px-3 py-2 text-sm opacity-40"
									style="border-color: rgba(255,255,255,0.2)"
									data-testid="dev-slot-{i}"
								>
									—
								</div>
							{/if}
						{/each}
					</div>
					<p class="mt-2 text-xs opacity-60">
						le programme se répète en boucle · budget : {ENERGY_BUDGET} unités d'énergie
					</p>
				</div>

				<div class="flex gap-3">
					<Button
						size="lg"
						disabled={animating || program.length === 0}
						onclick={run}
						data-testid="dev-run"
					>
						LANCER
					</Button>
					<Button
						variant="outline"
						size="lg"
						disabled={animating}
						onclick={reset}
						data-testid="dev-reset"
					>
						RÉINITIALISER
					</Button>
				</div>

				<p class="text-sm opacity-80" data-testid="dev-energy">
					énergie : {energy} / {ENERGY_BUDGET}
				</p>

				{#if feedback}
					<p
						class="border px-3 py-2 text-sm"
						style="border-color: var(--game-accent)"
						data-testid="dev-feedback"
					>
						{feedback}
					</p>
				{/if}
			</aside>

			<section class="flex items-center justify-center">
				{@render grid()}
			</section>
		</div>
	{/if}
</div>
