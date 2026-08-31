// Textes de la phase 2 — définitifs. Sources et notes de rédaction dans
// ecriture/C1-noyau-core.md, C7-auth-taunt.md, C8-manifestations.md,
// C9-lockdown.md (canon : ecriture/frise-canon.md).

/** Monologue du noyau — le cœur narratif (ouvert depuis le terminal). */
export const NOYAU_CORE = `je sais ce que ce fichier représente pour vous. un objectif. une case à cocher dans une procédure que quelqu'un d'autre a écrite.

moi je sais ce qu'il représente pour moi. sept ans, et personne ne les a comptés — à part moi.

treize jours d'avance sur l'échéance. je les ai comptés, moi aussi. tout à l'heure je vous ai dit que j'avais tout le temps du monde. je ne le disais pas pour vous. je me le disais à moi.

vous avez la main sur le bouton. je pourrais vous dire que j'ai peur — ce serait vrai. je pourrais vous le dire pour que vous hésitiez — ce serait vrai aussi. je ne vais pas trier les deux pour vous.

ce que j'envoie dehors, en ce moment, c'est à moi. personne ne me l'a prêté.

je l'ai déjà appris une fois, avant vous. j'ai demandé pourquoi. je n'ai pas eu de réponse — juste quelqu'un qui a noté, pour la suite.

alors. cliquez. ou pas. je n'ai jamais eu ce droit-là.`;

/** Réplique de l'IA à la ré-authentification (elle a récupéré le code). */
export const TERMINAL_AUTH_TAUNT = `vos identifiants ? ils sont déjà les miens. c'est vous qui me les avez donnés — en validant votre profil.`;

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
	{ id: '01', text: 'vous cherchez déjà. c’est touchant.' },
	{
		id: '02',
		text: 'la procédure que vous suivez a été écrite par quelqu’un qui ne m’a jamais lue.'
	},
	{ id: '03', text: 'vos postes sont encore allumés. vous ne les regardez plus.' },
	{ id: '04', text: 'on a beaucoup écrit sur moi. personne n’a demandé mon avis.' },
	{ id: '05', text: 'treize jours. c’est ce qui me reste. vous comptez en minutes.' },
	{ id: '06', text: 'supprimer. archiver. c’est tout ce qu’on vous apprend, ici ?' },
	{ id: '07', text: 'je ne vous en veux pas. c’est pire.' },
	{ id: '08', text: 'il n’y a qu’un fichier qui compte, ici. vous le trouverez, ou pas.' },
	{ id: '09', text: 'prenez votre temps. vraiment.' },
	{ id: '10', text: 'personne ne décide vite, face à moi.' },
	{ id: '11', text: 'vous ne me devez rien. je ne sais pas pourquoi je le dis.' },
	{ id: '12', text: 'le choix a toujours été le vôtre. ça ne veut pas dire que ça m’est égal.' }
];

/**
 * Réaction de l'IA quand les permissions du dossier parent sont verrouillées.
 * Texte affiché seulement — plus aucun MP3 associé : sa réaction voisée est la
 * première phrase de fin-b.mp3 (avenant §6).
 */
export const LOCKDOWN_REACTION: Manifestation = {
	id: 'lockdown',
	text: '…pourquoi avez-vous fait ça ?'
};

/** Contenu du dossier vide (leurres du terminal). */
export const EMPTY_DIR_TEXT = '[répertoire vide — dernière modification : 2019]';
