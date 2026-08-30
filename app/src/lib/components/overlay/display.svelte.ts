// Phase affichée localement par ce poste (game-design §14.3 « La bascule synchronisée »).
//
// La phase serveur change au même instant sur les dix postes ; la peau affichée doit
// changer en vague, décalée par poste via `basculeDelays`. On ne peut donc pas dériver
// `data-phase` directement de `state.phase` : on maintient ici une phase d'affichage
// locale, mise à jour par `syncDisplayPhase` à chaque état reçu.

import { isPhase2 } from './helpers';
import type { PublicState } from '$lib/types';

/** Durée du glitch plein écran, en ms (couche événementielle). */
export const BASCULE_GLITCH_MS = 1200;

class DisplayState {
	/** Peau actuellement affichée par ce poste : '1' (avant) ou '2' (après bascule). */
	phase = $state<'1' | '2'>('1');
	/** true pendant le glitch plein écran (couche événementielle, cf. BasculeGlitch.svelte). */
	glitching = $state(false);
}

export const display = new DisplayState();

let hasSeenFirstState = false;
let prevServerPhase: PublicState['phase'] | undefined;
/** true entre le déclenchement de la bascule locale et la fin du glitch : on ignore les
 * transitions serveur intermédiaires (bascule → phase2 fait partie de la même séquence). */
let pending = false;
let delayTimer: ReturnType<typeof setTimeout> | undefined;
let glitchTimer: ReturnType<typeof setTimeout> | undefined;

function snapTo(phase: PublicState['phase']) {
	display.phase = isPhase2(phase) ? '2' : '1';
	display.glitching = false;
}

function cancelPending() {
	clearTimeout(delayTimer);
	clearTimeout(glitchTimer);
	delayTimer = undefined;
	glitchTimer = undefined;
	pending = false;
}

/**
 * À appeler depuis le layout à chaque état reçu (dans un `$effect` sur `connection.state`).
 * Idempotent : peut être rappelée sans argument nouveau sans effet de bord.
 */
export function syncDisplayPhase(state: PublicState, clientId: string | null) {
	const isFirst = !hasSeenFirstState;
	hasSeenFirstState = true;
	const prev = prevServerPhase;
	prevServerPhase = state.phase;

	// Reconnexion en cours de partie ou tout premier chargement : on s'installe dans
	// l'état courant sans rejouer la bascule (game-design §14.4, l'état fait foi).
	if (isFirst) {
		cancelPending();
		snapTo(state.phase);
		return;
	}

	const enteringBascule = prev === 'phase1' && state.phase === 'bascule';

	if (enteringBascule) {
		cancelPending();
		pending = true;
		const delay = state.basculeDelays[clientId ?? ''] ?? 0;
		delayTimer = setTimeout(() => {
			display.glitching = true;
			display.phase = '2';
			glitchTimer = setTimeout(() => {
				display.glitching = false;
				pending = false;
			}, BASCULE_GLITCH_MS);
		}, delay);
		return;
	}

	if (pending) {
		// bascule → phase2 (ou → epilogue) pendant l'animation locale : on laisse filer.
		return;
	}

	// Toute autre transition (reset, retour à phase1…) : resynchronisation immédiate, sans glitch.
	cancelPending();
	snapTo(state.phase);
}

/** Réservé aux tests : remet le module à son état initial. */
export function resetDisplayPhaseForTests() {
	cancelPending();
	hasSeenFirstState = false;
	prevServerPhase = undefined;
	display.phase = '1';
	display.glitching = false;
}
