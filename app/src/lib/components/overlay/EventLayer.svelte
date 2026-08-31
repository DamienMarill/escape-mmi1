<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import type { LockId, LockStatus } from '$lib/types';
	import BasculeGlitch from './BasculeGlitch.svelte';
	import HintPanel from './HintPanel.svelte';

	let prevLocks: Record<LockId, LockStatus> | null = null;
	let flashing = $state(false);
	let flashTimeout: ReturnType<typeof setTimeout> | undefined;

	// Malus (fausse manœuvre SCAN/TERMINAL) : bannière rouge en haut de TOUS
	// les écrans. On ne réagit qu'à l'incrément de seq — un poste qui se
	// (re)connecte ne rejoue jamais un malus passé.
	let prevMalusSeq: number | null = null;
	let malusVisible = $state(false);
	let malusTimeout: ReturnType<typeof setTimeout> | undefined;

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

		const malusSeq = state.malus?.seq ?? 0;
		if (prevMalusSeq !== null && malusSeq > prevMalusSeq) {
			malusVisible = true;
			clearTimeout(malusTimeout);
			malusTimeout = setTimeout(() => (malusVisible = false), 5_000);
		}
		prevMalusSeq = malusSeq;
	});
</script>

<div class="event-layer">
	<div class="lock-flash" class:is-flashing={flashing}></div>
	<div
		class="malus-banner"
		class:is-visible={malusVisible}
		data-testid="malus-banner"
		aria-live="assertive"
	>
		⚠ FAUSSE MANŒUVRE — PÉNALITÉ : −1 MIN
	</div>
	<BasculeGlitch />
</div>

<HintPanel />
