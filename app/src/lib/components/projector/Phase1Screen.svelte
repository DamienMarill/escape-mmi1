<script lang="ts">
	import type { PublicState } from '$lib/types';
	import LocksBoard from './LocksBoard.svelte';
	import ValidatingSequence from './ValidatingSequence.svelte';

	let { publicState }: { publicState: PublicState } = $props();
</script>

{#if publicState.finale === 'validating'}
	<ValidatingSequence />
{:else}
	<LocksBoard {publicState} headerTitle="ÉVALUATION D'ENTRÉE — PROMOTION MMI1" />
	<!-- Filet automatique (§12.3) : rappel des documents non numérisés, dans la fiction -->
	{#if publicState.reminders.scan || publicState.reminders.brassage}
		<div
			class="fixed inset-x-0 bottom-6 flex flex-col items-center gap-1 font-mono"
			data-testid="physical-reminder"
		>
			{#if publicState.reminders.scan}
				<p class="text-2xl tracking-widest">DOCUMENT INV-2019-04 — NON NUMÉRISÉ</p>
			{/if}
			{#if publicState.reminders.brassage}
				<p class="text-2xl tracking-widest">PLAN DE CÂBLAGE — NON NUMÉRISÉ</p>
			{/if}
			<p class="text-lg opacity-70">CONSULTER LES RESSOURCES DE LA SALLE</p>
		</div>
	{/if}
{/if}
