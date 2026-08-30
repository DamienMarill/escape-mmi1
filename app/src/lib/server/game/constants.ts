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
