<script lang="ts">
	// Mini-tâche BRASSAGE — câblage du panneau (game-design §7).
	// Le plan de correspondance port ↔ prise est PHYSIQUE (tableau de la salle) :
	// aucune solution ici, seule l'interaction de câblage.
	import { Button } from '$lib/components/ui/button';
	import { connection } from '$lib/client/connection.svelte';
	import { BRASSAGE_PORTS, BRASSAGE_SOCKETS } from '$lib/tasks-data';
	import TaskSolved from './TaskSolved.svelte';

	type Socket = (typeof BRASSAGE_SOCKETS)[number];

	let solved = $derived(connection.state?.tasks.brassage.solved ?? false);

	/** Clé = numéro de port, valeur = lettre de prise. */
	let connections = $state<Partial<Record<number, Socket>>>({});
	let selectedPort = $state<number | null>(null);
	let feedback = $state<string | null>(null);
	let submitting = $state(false);

	/** Une couleur distincte par port, pour suivre le câble d'un coup d'œil. */
	const PORT_COLORS = [
		'oklch(0.75 0.19 25)',
		'oklch(0.8 0.16 95)',
		'oklch(0.78 0.16 150)',
		'oklch(0.78 0.13 210)',
		'oklch(0.72 0.17 290)',
		'oklch(0.75 0.19 345)'
	];
	function colorForPort(port: number) {
		return PORT_COLORS[port - 1];
	}

	function portForSocket(letter: Socket): number | null {
		for (const [port, l] of Object.entries(connections)) {
			if (l === letter) return Number(port);
		}
		return null;
	}

	function selectPort(port: number) {
		feedback = null;
		selectedPort = selectedPort === port ? null : port;
	}

	function selectSocket(letter: Socket) {
		if (selectedPort === null) return;
		feedback = null;
		const thief = selectedPort;
		// La prise choisie est volée à un éventuel port déjà branché dessus.
		for (const [port, l] of Object.entries(connections)) {
			if (l === letter && Number(port) !== thief) delete connections[Number(port)];
		}
		connections[thief] = letter;
		selectedPort = null;
	}

	let allWired = $derived(BRASSAGE_PORTS.every((p) => connections[p] !== undefined));

	// Géométrie du schéma — coordonnées calculées, aucune mesure DOM nécessaire.
	const ITEM = 48;
	const GAP = 16;
	const TRACK = 200;
	const PANEL_WIDTH = ITEM + TRACK + ITEM;
	const PANEL_HEIGHT = BRASSAGE_PORTS.length * ITEM + (BRASSAGE_PORTS.length - 1) * GAP;
	function rowY(index: number) {
		return index * (ITEM + GAP) + ITEM / 2;
	}

	let cables = $derived(
		Object.entries(connections).map(([port, letter]) => ({
			port: Number(port),
			y1: rowY(Number(port) - 1),
			y2: rowY(BRASSAGE_SOCKETS.indexOf(letter as Socket))
		}))
	);

	async function submit() {
		feedback = null;
		submitting = true;
		const payload = { connections: { ...connections } };
		const res = await connection.act({ type: 'task/submit', task: 'brassage', payload });
		submitting = false;
		if (!res.ok) feedback = res.error ?? 'câblage incorrect — recompte les branchements';
	}
</script>

<div
	class="flex w-full max-w-md flex-col items-center gap-6 p-6 font-mono"
	data-testid="task-brassage"
>
	{#if solved}
		<TaskSolved task="brassage" />
	{:else}
		<p class="text-center text-xs tracking-[0.3em] uppercase opacity-60">
			plan de câblage — non numérisé · affiché en salle
		</p>

		<p class="text-sm opacity-80" data-testid="brassage-hint">
			{#if selectedPort !== null}
				port {selectedPort} sélectionné — clique la prise voulue
			{:else}
				clique un port, puis la prise à y relier
			{/if}
		</p>

		<div class="relative" style="width: {PANEL_WIDTH}px; height: {PANEL_HEIGHT}px">
			<svg
				class="pointer-events-none absolute top-0 left-0"
				width={PANEL_WIDTH}
				height={PANEL_HEIGHT}
				viewBox="0 0 {PANEL_WIDTH} {PANEL_HEIGHT}"
			>
				{#each cables as cable (cable.port)}
					<line
						x1={ITEM}
						y1={cable.y1}
						x2={ITEM + TRACK}
						y2={cable.y2}
						stroke={colorForPort(cable.port)}
						stroke-width="3"
						stroke-linecap="round"
					/>
				{/each}
			</svg>

			<div class="absolute top-0 left-0 flex flex-col" style="gap: {GAP}px">
				{#each BRASSAGE_PORTS as port (port)}
					{@const wired = connections[port]}
					<button
						type="button"
						class="flex h-12 w-12 flex-col items-center justify-center rounded-md border-2 bg-black/20 text-lg font-bold transition-transform hover:opacity-90"
						style:border-color={wired ? colorForPort(port) : 'rgba(255,255,255,0.25)'}
						style:box-shadow={selectedPort === port ? '0 0 0 3px var(--game-accent)' : 'none'}
						style:transform={selectedPort === port ? 'scale(1.08)' : 'scale(1)'}
						aria-pressed={selectedPort === port}
						data-testid="brassage-port-{port}"
						onclick={() => selectPort(port)}
					>
						{port}
						{#if wired}
							<span class="text-[0.6rem] font-normal opacity-70">→ {wired}</span>
						{/if}
					</button>
				{/each}
			</div>

			<div class="absolute top-0 right-0 flex flex-col" style="gap: {GAP}px">
				{#each BRASSAGE_SOCKETS as letter (letter)}
					{@const wiredPort = portForSocket(letter)}
					<button
						type="button"
						class="flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 bg-black/20 text-lg font-bold transition-transform hover:opacity-90"
						style:border-color={wiredPort ? colorForPort(wiredPort) : 'rgba(255,255,255,0.25)'}
						data-testid="brassage-socket-{letter}"
						onclick={() => selectSocket(letter)}
					>
						{letter}
						{#if wiredPort}
							<span class="text-[0.6rem] font-normal opacity-70">← {wiredPort}</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<Button
			size="lg"
			disabled={!allWired || submitting}
			onclick={submit}
			data-testid="brassage-submit"
		>
			VÉRIFIER LE CÂBLAGE
		</Button>

		{#if feedback}
			<p class="text-sm opacity-80" data-testid="brassage-feedback">{feedback}</p>
		{/if}
	{/if}
</div>
