<script lang="ts">
	// Seule source sonore de la salle. Un unique <audio>, remplacé à chaque
	// nouveau déclenchement (les annonces sont courtes, pas de file d'attente).
	// Déverrouillage de l'autoplay : tente une lecture non muette d'un WAV
	// silencieux ; si le navigateur refuse (politique d'autoplay), on retente
	// au clic (voir IdleScreen).

	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { connection } from '$lib/client/connection.svelte';
	import { LOCK_IDS, type LockId, type LockStatus, type Phase } from '$lib/types';

	let { armed = $bindable(false) }: { armed?: boolean } = $props();

	let audioEl: HTMLAudioElement | undefined = $state();

	// WAV silencieux (0.1 s, 8 bits mono) — sert uniquement à tester/obtenir
	// l'autorisation de lecture sonore du navigateur.
	const SILENT_WAV =
		'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

	export function tryUnlock(): void {
		if (!audioEl) return;
		audioEl.muted = false;
		audioEl.src = SILENT_WAV;
		audioEl
			.play()
			.then(() => {
				armed = true;
				audioEl?.pause();
			})
			.catch(() => {
				armed = false;
			});
	}

	onMount(() => {
		tryUnlock();
	});

	function playSrc(src: string): void {
		if (!audioEl || !armed) return;
		audioEl.pause();
		audioEl.src = src;
		audioEl.currentTime = 0;
		void audioEl.play().catch(() => {});
	}

	/**
	 * Son de priorité basse : ne coupe JAMAIS une annonce en cours.
	 * Les manifestations de l'IA passent par ici — leur texte reste à l'écran
	 * quoi qu'il arrive, seule la voix cède le passage aux cadenas et aux fins.
	 */
	function playIfIdle(src: string): void {
		if (!audioEl || !armed) return;
		if (!audioEl.paused && !audioEl.ended) return;
		playSrc(src);
	}

	interface Snapshot {
		phase: Phase;
		locks: Record<LockId, LockStatus>;
		finale: string;
		ending: string | null;
		reminders: number;
		manifSeq: number;
		manifAudio: string | null;
	}

	let prev: Snapshot | null = null;
	const MILESTONES = [
		['10', 10 * 60_000],
		['5', 5 * 60_000],
		['2', 2 * 60_000]
	] as const;
	type MilestoneKey = (typeof MILESTONES)[number][0];
	const playedMilestones = new SvelteSet<MilestoneKey>();

	function remainingMsFor(state: NonNullable<typeof connection.state>, offset: number): number {
		const elapsed =
			state.chrono.elapsedMs +
			(state.chrono.running ? Date.now() - state.chrono.changedAt - offset : 0);
		return state.chrono.durationMs - elapsed;
	}

	$effect(() => {
		const state = connection.state;
		if (!state) return;

		const offset = Date.now() - state.serverNow;

		const snapshot: Snapshot = {
			phase: state.phase,
			locks: { ...state.locks },
			finale: state.finale,
			ending: state.ending,
			reminders: Object.keys(state.reminders).length,
			manifSeq: state.manifestation?.seq ?? 0,
			manifAudio: state.manifestation?.audio ?? null
		};

		if (!prev) {
			// Première synchro (reconnexion incluse) : on ne joue rien, on
			// initialise seulement la référence et les jalons déjà franchis.
			if (state.phase === 'phase1' && state.chrono.durationMs > 0) {
				const remaining = remainingMsFor(state, offset);
				for (const [key, ms] of MILESTONES) {
					if (remaining <= ms) playedMilestones.add(key);
				}
			}
			prev = snapshot;
			return;
		}

		for (const lock of LOCK_IDS) {
			if (prev.locks[lock] !== snapshot.locks[lock] && snapshot.locks[lock] === 'open') {
				playSrc(`/assets/audio/cadenas-${lock}.mp3`);
			}
		}

		if (snapshot.reminders > prev.reminders) {
			playSrc('/assets/audio/rappel-document.mp3');
		}

		if (prev.finale !== 'validating' && snapshot.finale === 'validating') {
			playSrc('/assets/audio/validation.mp3');
		}

		if (prev.phase !== 'bascule' && snapshot.phase === 'bascule') {
			playSrc('/assets/audio/bascule.mp3');
		}

		if (prev.phase !== 'epilogue' && snapshot.phase === 'epilogue') {
			if (snapshot.ending === 'A') playSrc('/assets/audio/fin-a.mp3');
			else if (snapshot.ending === 'B') playSrc('/assets/audio/fin-b.mp3');
			else if (snapshot.ending === 'C') playSrc('/assets/audio/fin-c.mp3');
		}

		// Manifestations de l'IA (phase 2) : voisées, mais en priorité basse.
		// La réaction au verrouillage (Fin B) arrive avec un audio vide : son
		// texte s'affiche, sa voix est la première phrase de fin-b.mp3.
		if (snapshot.manifSeq !== prev.manifSeq && snapshot.manifAudio) {
			playIfIdle(`/assets/audio/manif-${snapshot.manifAudio}.mp3`);
		}

		if (snapshot.phase === 'phase1') {
			const remaining = remainingMsFor(state, offset);
			for (const [key, ms] of MILESTONES) {
				if (remaining <= ms && !playedMilestones.has(key)) {
					playedMilestones.add(key);
					playSrc(`/assets/audio/jalon-${key}min.mp3`);
				}
			}
		}

		prev = snapshot;
	});
</script>

<audio bind:this={audioEl} data-testid="projector-audio"></audio>
