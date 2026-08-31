import type { ExfilState } from '$lib/types';

/**
 * Progression du transfert sortant, entre 0 et 1.
 * Formule unique serveur/client : le serveur s'en sert pour déclencher la
 * Fin C, le client pour animer la barre en local — rien n'est poussé au tick.
 * `elapsedMs` est le temps de jeu courant (cf. `Game.elapsedMs()`).
 */
export function exfilProgress(exfil: ExfilState, elapsedMs: number): number {
	const at = exfil.frozenAtMs ?? elapsedMs;
	return Math.min(1, Math.max(0, (at - exfil.startedAtMs) / exfil.durationMs));
}
