<script lang="ts">
	import type { PublicState } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';

	let { publicState }: { publicState: PublicState } = $props();

	let entries = $derived([...publicState.journal].reverse());

	function formatTime(t: number): string {
		return new Date(t).toLocaleTimeString('fr-FR', { hour12: false });
	}
</script>

<Card.Root class="xl:col-span-2">
	<Card.Header>
		<Card.Title>Journal</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="h-64 space-y-1 overflow-y-auto pr-1 font-mono text-sm">
			{#each entries as entry, i (i)}
				<p><span class="text-neutral-500">{formatTime(entry.t)}</span> {entry.msg}</p>
			{/each}
			{#if entries.length === 0}
				<p class="text-neutral-500">Aucun événement pour l'instant.</p>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
