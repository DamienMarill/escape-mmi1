<script lang="ts">
	// SCAN — détection d'intrusion réseau (game-design §7 / Cluedo réseau).
	// La plage et les machines sont affichées en clair ; la convention de
	// nommage qui tranche entre les deux suspectes n'existe QUE sur une fiche
	// physique (document INV-2019-04) glissée dans un manga de la salle.
	import { connection } from '$lib/client/connection.svelte';
	import { SCAN_MACHINES, SCAN_RANGE } from '$lib/tasks-data';
	import TaskSolved from './TaskSolved.svelte';

	let solved = $derived(connection.state?.tasks.scan.solved ?? false);

	let feedback = $state<string | null>(null);
	let shakingRow = $state<string | null>(null);

	async function selectMachine(name: string) {
		feedback = null;
		const res = await connection.act({
			type: 'task/submit',
			task: 'scan',
			payload: { machine: name }
		});
		if (!res.ok) {
			feedback = res.error ?? 'tentative non concluante — réessayer';
			shakingRow = name;
			setTimeout(() => {
				if (shakingRow === name) shakingRow = null;
			}, 400);
		}
	}

	function onRowKeydown(event: KeyboardEvent, name: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			selectMachine(name);
		}
	}
</script>

<div
	class="flex w-full max-w-4xl flex-col gap-6 p-6 font-mono"
	data-testid="task-scan"
	style="color: var(--game-fg)"
>
	{#if solved}
		<TaskSolved task="scan" />
	{:else}
		<header class="space-y-1">
			<p class="text-xs tracking-[0.3em] uppercase opacity-60">
				scan terminé — plage autorisée : de {SCAN_RANGE.from} à {SCAN_RANGE.to}
			</p>
			<p class="text-lg">Une de ces machines n'a rien à faire là. Identifiez-la.</p>
		</header>

		<p
			class="border border-dashed px-4 py-2 text-xs tracking-widest uppercase opacity-70"
			style="border-color: var(--game-fg)"
			data-testid="scan-doc-pointer"
		>
			convention de nommage — non numérisée · document INV-2019-04
		</p>

		<table class="w-full border-collapse text-left text-sm">
			<thead>
				<tr class="border-b" style="border-color: var(--game-accent)">
					<th class="py-2 pr-4 font-normal tracking-widest uppercase opacity-60">Nom</th>
					<th class="py-2 pr-4 font-normal tracking-widest uppercase opacity-60">IP</th>
					<th class="py-2 pr-4 font-normal tracking-widest uppercase opacity-60">Statut</th>
					<th class="py-2 font-normal tracking-widest uppercase opacity-60">Ping</th>
				</tr>
			</thead>
			<tbody>
				{#each SCAN_MACHINES as machine (machine.name)}
					<tr
						class="scan-row cursor-pointer border-b border-white/10 transition-colors hover:bg-white/10"
						class:shake={shakingRow === machine.name}
						role="button"
						tabindex="0"
						data-testid="scan-machine-{machine.name}"
						onclick={() => selectMachine(machine.name)}
						onkeydown={(e) => onRowKeydown(e, machine.name)}
					>
						<td class="py-2 pr-4">{machine.name}</td>
						<td class="py-2 pr-4 opacity-80">{machine.ip}</td>
						<td class="py-2 pr-4">
							<span class={machine.status === 'ONLINE' ? 'text-emerald-400' : 'opacity-40'}>
								{machine.status}
							</span>
						</td>
						<td class="py-2 opacity-80">{machine.ping}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		{#if feedback}
			<p class="text-sm opacity-80" data-testid="scan-feedback">{feedback}</p>
		{/if}
	{/if}
</div>

<style>
	@keyframes shake {
		10%,
		90% {
			transform: translateX(-1px);
		}
		20%,
		80% {
			transform: translateX(2px);
		}
		30%,
		50%,
		70% {
			transform: translateX(-4px);
		}
		40%,
		60% {
			transform: translateX(4px);
		}
	}

	.shake {
		animation: shake 0.4s ease-in-out;
	}
</style>
