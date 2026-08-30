// Contenu figé du jeu — un seul état initial, zéro tirage (game-design §11).
// Ce fichier ne doit JAMAIS être importé depuis du code client :
// il vit sous lib/server/, SvelteKit interdit l'import côté client.

export const GAME_ID = 'escape-mmi1-v2';
export const SNAPSHOT_INTERVAL_MS = 2_000;
