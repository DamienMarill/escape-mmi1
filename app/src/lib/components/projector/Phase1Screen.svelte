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
{/if}
