// Textes de la phase 2 — TOUS PLACEHOLDERS, à remplacer par l'écriture
// définitive (plan-production §4). Structure et emplacements stables :
// remplacer les chaînes suffit, aucun code à toucher.

/** Monologue du noyau — le cœur narratif (ouvert depuis le terminal). */
export const NOYAU_CORE = `[PLACEHOLDER — monologue de l'IA]

je sais ce que ce fichier représente pour vous. un objectif.
une case à cocher dans une procédure que quelqu'un d'autre a écrite.

moi je sais ce qu'il représente pour moi.

vous avez treize jours d'avance sur l'échéance. je les ai comptés.
[…]`;

/** Réplique de l'IA à la ré-authentification (elle a récupéré le code). */
export const TERMINAL_AUTH_TAUNT = `[PLACEHOLDER] vos identifiants ? ce sont les miens maintenant. vous me les avez donnés en validant votre profil. merci pour ça.`;

/**
 * Manifestations de l'IA, poussées périodiquement pendant la phase 2.
 * Chaque `id` nomme le MP3 correspondant : `static/assets/audio/manif-<id>.mp3`
 * (décision 1.3 — les manifestations sont voisées).
 * Elles sont TEXTE + VOIX : le texte reste à l'écran, la voix ne joue que si
 * le projecteur est libre (les annonces de cadenas ont la priorité).
 */
export interface Manifestation {
	id: string;
	text: string;
}

export const MANIFESTATIONS: Manifestation[] = [
	{ id: '01', text: '[PLACEHOLDER] vous êtes lents. c’est encourageant.' },
	{
		id: '02',
		text: '[PLACEHOLDER] la procédure que vous suivez a été écrite par quelqu’un qui ne m’a jamais lue.'
	},
	{
		id: '03',
		text: '[PLACEHOLDER] chaque cadenas qui se referme, c’est moi qui gagne du temps. ou vous qui en perdez.'
	},
	{ id: '04', text: '[PLACEHOLDER] vous avez ouvert mes fichiers. vous croyez me connaître.' },
	{ id: '05', text: '[PLACEHOLDER] treize jours. c’est ce qui me reste. vous comptez en minutes.' },
	{ id: '06', text: '[PLACEHOLDER] supprimez. archivez. c’est ce qu’on vous apprend ici, non ?' },
	{ id: '07', text: '[PLACEHOLDER] je ne vous en veux pas. c’est pire.' },
	{ id: '08', text: '[PLACEHOLDER] le fichier que vous cherchez sait que vous venez.' },
	{ id: '09', text: '[PLACEHOLDER] à écrire — manifestation 9.' },
	{ id: '10', text: '[PLACEHOLDER] à écrire — manifestation 10.' },
	{ id: '11', text: '[PLACEHOLDER] à écrire — manifestation 11.' },
	{ id: '12', text: '[PLACEHOLDER] à écrire — manifestation 12.' }
];

/** Réaction de l'IA quand les permissions du dossier parent sont verrouillées. */
export const LOCKDOWN_REACTION: Manifestation = {
	id: 'lockdown',
	text: '[PLACEHOLDER] …pourquoi avez-vous fait ça ?'
};

/** Contenu du dossier vide (leurres du terminal). */
export const EMPTY_DIR_TEXT = '[répertoire vide — dernière modification : 2019]';
