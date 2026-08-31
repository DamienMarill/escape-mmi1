<script lang="ts">
	// Seule source sonore de la salle. Un unique <audio>, remplacé à chaque
	// nouveau déclenchement (les annonces sont courtes, pas de file d'attente).
	// Déverrouillage de l'autoplay : tente une lecture non muette d'un WAV
	// silencieux ; si le navigateur refuse (politique d'autoplay), on retente
	// au clic (voir IdleScreen).

	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { connection } from '$lib/client/connection.svelte';
	import { initAnalyser, orbAudio, resumeAnalyser } from '$lib/client/orb-audio.svelte';
	import { BASCULE_VOICE_AT_S } from '$lib/audio-cues';
	import { LOCK_IDS, type LockId, type LockStatus, type Phase } from '$lib/types';

	/** A9 + B1 d'un seul tenant : validation puis monologue, sans coupure. */
	const VALIDATION_BASCULE_SRC = '/assets/audio/validation-bascule.mp3';

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
				// Le son est autorisé : on peut greffer le graphe d'analyse de
				// l'orbe sans risquer de couper la sortie (contexte résumable).
				if (audioEl) initAnalyser(audioEl);
				resumeAnalyser();
			})
			.catch(() => {
				armed = false;
			});
	}

	onMount(() => {
		tryUnlock();
	});

	/**
	 * `voice` identifie une prise de parole d'IRIS pour l'orbe ('bascule',
	 * 'manif-05', 'fin-b'…) — null pour les sons corporate, sur lesquels
	 * l'orbe ne réagit pas.
	 */
	function playSrc(src: string, voice: string | null = null): void {
		if (!audioEl || !armed) return;
		audioEl.pause();
		audioEl.src = src;
		audioEl.currentTime = 0;
		orbAudio.currentVoice = voice;
		void audioEl.play().catch(() => {
			orbAudio.currentVoice = null;
		});
	}

	/**
	 * Son de priorité basse : ne coupe JAMAIS une annonce en cours.
	 * Les manifestations de l'IA passent par ici — leur texte reste à l'écran
	 * quoi qu'il arrive, seule la voix cède le passage aux cadenas et aux fins.
	 */
	function playIfIdle(src: string, voice: string | null = null): void {
		if (!audioEl || !armed) return;
		if (!audioEl.paused && !audioEl.ended) return;
		playSrc(src, voice);
	}

	interface Snapshot {
		phase: Phase;
		locks: Record<LockId, LockStatus>;
		finale: string;
		ending: string | null;
		reminders: number;
		manifSeq: number;
		manifAudio: string | null;
		malusSeq: number;
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
			manifAudio: state.manifestation?.audio ?? null,
			malusSeq: state.malus?.seq ?? 0
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

		// Malus : buzz d'erreur court, non voisé (l'orbe ne réagit pas). Testé
		// en PREMIER pour qu'une annonce déclenchée dans le même lot d'états
		// (cadenas, fin…) garde le dernier mot sur la source audio.
		if (snapshot.malusSeq > prev.malusSeq) {
			playSrc('/assets/audio/malus.mp3');
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
			// Le fichier couvre validation ET bascule : il continue de jouer à
			// travers le changement de phase, la voix d'IRIS arrivant à
			// BASCULE_VOICE_AT_S (voir onTimeUpdate).
			playSrc(VALIDATION_BASCULE_SRC);
		}

		if (prev.phase !== 'bascule' && snapshot.phase === 'bascule') {
			// Ne pas couper le fichier fusionné déjà en cours — le monologue
			// seul (bascule.mp3) ne sert qu'à un projecteur (re)connecté après
			// la séquence de validation.
			const mergedRunning =
				audioEl && audioEl.src.includes('validation-bascule') && !audioEl.paused && !audioEl.ended;
			if (!mergedRunning) playSrc('/assets/audio/bascule.mp3', 'bascule');
		}

		if (prev.phase !== 'epilogue' && snapshot.phase === 'epilogue') {
			if (snapshot.ending === 'A') playSrc('/assets/audio/fin-a.mp3', 'fin-a');
			else if (snapshot.ending === 'B') playSrc('/assets/audio/fin-b.mp3', 'fin-b');
			else if (snapshot.ending === 'C') playSrc('/assets/audio/fin-c.mp3', 'fin-c');
		}

		// Manifestations de l'IA (phase 2) : voisées, mais en priorité basse.
		// La réaction au verrouillage (Fin B) arrive avec un audio vide : son
		// texte s'affiche, sa voix est la première phrase de fin-b.mp3.
		if (snapshot.manifSeq !== prev.manifSeq && snapshot.manifAudio) {
			playIfIdle(`/assets/audio/manif-${snapshot.manifAudio}.mp3`, `manif-${snapshot.manifAudio}`);
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

<audio
	bind:this={audioEl}
	data-testid="projector-audio"
	onended={() => (orbAudio.currentVoice = null)}
	ontimeupdate={() => {
		// Dans le fichier fusionné, le masque tombe à BASCULE_VOICE_AT_S :
		// l'orbe passe de l'attente corporate à la voix d'IRIS.
		if (
			audioEl &&
			audioEl.src.includes('validation-bascule') &&
			audioEl.currentTime >= BASCULE_VOICE_AT_S &&
			orbAudio.currentVoice !== 'bascule'
		) {
			orbAudio.currentVoice = 'bascule';
		}
	}}
></audio>
