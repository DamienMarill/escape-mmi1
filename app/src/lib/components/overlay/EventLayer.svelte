<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import type { LockId, LockStatus } from '$lib/types';
	import BasculeGlitch from './BasculeGlitch.svelte';
	import HintPanel from './HintPanel.svelte';

	let prevLocks: Record<LockId, LockStatus> | null = null;
	let flashing = $state(false);
	let flashTimeout: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const state = connection.state;
		if (!state) return;
		if (prevLocks) {
			const justOpened = (Object.entries(state.locks) as [LockId, LockStatus][]).some(
				([lock, status]) => status === 'open' && prevLocks![lock] === 'locked'
			);
			if (justOpened) {
				flashing = true;
				clearTimeout(flashTimeout);
				flashTimeout = setTimeout(() => (flashing = false), 900);
			}
		}
		prevLocks = { ...state.locks };
	});
</script>

<div class="event-layer">
	<div class="lock-flash" class:is-flashing={flashing}></div>
	<BasculeGlitch />
</div>

<HintPanel />
