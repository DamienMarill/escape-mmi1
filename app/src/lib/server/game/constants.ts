// Contenu figé du jeu — un seul état initial, zéro tirage (game-design §11).
// Ce fichier ne doit JAMAIS être importé depuis du code client :
// il vit sous lib/server/, SvelteKit interdit l'import côté client.

import { BASCULE_VOICE_AT_S, VALIDATION_BASCULE_DURATION_S } from '$lib/audio-cues';

export const GAME_ID = 'escape-mmi1-v2';
export const SNAPSHOT_INTERVAL_MS = 2_000;

/** Durée nominale d'une session (chrono projeté). */
export const SESSION_DURATION_MS = 30 * 60_000;

/**
 * Clé d'accès à la console MJ (LAN de salle uniquement — pas un secret fort,
 * juste de quoi empêcher un joueur curieux de taper /mj).
 * Surchargée par la variable d'environnement MJ_KEY si présente.
 */
export const DEFAULT_MJ_KEY = 'brassens';

/** Étalement de la bascule : chaque poste reçoit un délai aléatoire dans cette fenêtre. */
export const BASCULE_STAGGER_MS = 2_500;

/**
 * Facteur d'échelle des séquences chronométrées (TIME_SCALE env).
 * Uniquement pour les tests e2e — jamais en production.
 */
const SCALE = Number(process.env.TIME_SCALE ?? '1');
export const TIME_SCALE = SCALE;

/**
 * Durée de la séquence bureaucratique après le clic VALIDER, et durée de la
 * bascule (non interactif). Les deux sont CALÉES SUR L'AUDIO : le fichier
 * validation-bascule.mp3 enchaîne A9 et B1 sans coupure, le serveur passe en
 * `bascule` quand IRIS prend la parole, et en phase 2 à la fin du monologue
 * (+2 s de battement — B1 §7.1). Ajuster $lib/audio-cues.ts, pas ici.
 */
export const VALIDATION_SEQUENCE_MS = Math.round(BASCULE_VOICE_AT_S * 1000) * SCALE;
export const BASCULE_DURATION_MS =
	Math.round((VALIDATION_BASCULE_DURATION_S - BASCULE_VOICE_AT_S + 2) * 1000) * SCALE;

/**
 * Fraction du temps restant (à l'entrée en phase 2) au bout de laquelle le
 * transfert sortant d'IRIS se termine — Fin C. 1 = exactement à la fin de la
 * session ; baisser (ex. 0.95) pour laisser un battement d'épilogue.
 */
export const EXFIL_FRACTION = 1;

/**
 * Valeurs hexadécimales des six segments (une par port — game-design §5).
 * SECRET : ne jamais exposer au client avant résolution de la tâche.
 */
export const SEGMENT_VALUES: Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F', string> = {
	A: '7',
	B: 'D',
	C: 'F',
	D: '0',
	E: '3',
	F: 'C'
};

/** Verrouillage anti-brute-force du poste RÉSEAU après 3 tentatives. */
export const RESEAU_LOCKOUT_MS = 30_000 * SCALE;
export const RESEAU_MAX_ATTEMPTS = 3;

/**
 * Malus des énigmes à choix fermé brute-forçables (SCAN, répertoires du
 * TERMINAL) : chaque fausse manœuvre coûte 1 minute — retirée au chrono en
 * phase 1, ajoutée au transfert d'IRIS en phase 2 (le seul timer qui compte
 * alors). NON scalé pour le chrono (temps réel), scalé côté exfiltration
 * dans le reducer, comme la durée du transfert elle-même.
 */
export const MALUS_MS = 60_000;
/** Fenêtre d'absorption : un double-clic nerveux ne compte qu'un malus. */
export const MALUS_DEBOUNCE_MS = 3_000;

/** Intervalle entre deux manifestations de l'IA en phase 2. */
export const MANIFESTATION_INTERVAL_MS = 75_000 * SCALE;

/**
 * Filet automatique (game-design §12.3) : si une tâche à support physique
 * stagne au-delà de ce délai, le projecteur rappelle le document non numérisé.
 * Descendre à 3 min si le playtest montre que les groupes ne se lèvent pas.
 */
export const PHYSICAL_REMINDER_MS = 4 * 60_000 * SCALE;
