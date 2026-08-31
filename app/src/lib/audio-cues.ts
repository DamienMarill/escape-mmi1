// Timecodes du fichier fusionné validation-bascule.mp3 (A9 + B1 d'un seul
// tenant — la séquence de validation enchaîne sans coupure sur le monologue).
// C'EST ICI QU'ON AJUSTE si le montage audio change : les constantes serveur
// (durées des phases validating et bascule) et le changement d'état de l'orbe
// (voix 1 corporate → voix 2 IRIS) en dérivent.
//
// Valeurs mesurées sur le montage du 31/08/2026 (silence de 3 s entre les
// deux voix : 21,8 s → 24,8 s ; durée totale 121,35 s).

/**
 * L'instant où IRIS prend la parole (fin du sas de silence après A9).
 * - le serveur passe en phase `bascule` à ce timecode (l'orbe apparaît
 *   au moment exact où elle parle) ;
 * - l'orbe passe du silence corporate à la voix d'IRIS.
 */
export const BASCULE_VOICE_AT_S = 24.8;

/** Durée totale du fichier fusionné (fin du monologue). */
export const VALIDATION_BASCULE_DURATION_S = 121.4;

/**
 * Volume des musiques d'ambiance (0–1) — volontairement bas : le lit musical
 * ne doit jamais concurrencer les annonces ni la voix d'IRIS. À ajuster ici.
 */
export const AMBIENT_VOLUME = 0.15;
