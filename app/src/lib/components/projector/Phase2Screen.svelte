<script lang="ts">
	import type { PublicState } from '$lib/types';
	import LocksBoard from './LocksBoard.svelte';

	let { publicState }: { publicState: PublicState } = $props();
</script>

<LocksBoard {publicState} headerTitle="CONFINEMENT D'URGENCE" />
