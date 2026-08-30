// Contenu figé du jeu — un seul état initial, zéro tirage (game-design §11).
// Ce fichier ne doit JAMAIS être importé depuis du code client :
// il vit sous lib/server/, SvelteKit interdit l'import côté client.

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

/** Durée de la séquence bureaucratique après le clic VALIDER. */
export const VALIDATION_SEQUENCE_MS = 20_000 * SCALE;

/** Durée de la bascule (non interactif, ~90 s — game-design §4). */
export const BASCULE_DURATION_MS = 90_000 * SCALE;

/**
 * Fermeture des cadenas en phase 2 : fractions du temps restant au moment
 * de l'entrée en phase 2. Le troisième refermé déclenche la Fin A par défaut.
 */
export const RELOCK_FRACTIONS: Record<'alpha' | 'beta' | 'gamma', number> = {
	alpha: 0.45,
	beta: 0.75,
	gamma: 1
};

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

/** Intervalle entre deux manifestations de l'IA en phase 2. */
export const MANIFESTATION_INTERVAL_MS = 75_000 * SCALE;

/**
 * Filet automatique (game-design §12.3) : si une tâche à support physique
 * stagne au-delà de ce délai, le projecteur rappelle le document non numérisé.
 * Descendre à 3 min si le playtest montre que les groupes ne se lèvent pas.
 */
export const PHYSICAL_REMINDER_MS = 4 * 60_000 * SCALE;
