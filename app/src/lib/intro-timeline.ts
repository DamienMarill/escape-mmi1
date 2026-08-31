// Timeline de la séquence d'introduction (remplace intro.mp4).
// C'EST ICI QU'ON CALE LE MONTAGE SUR L'AUDIO : chaque cue a un timecode `at`
// en secondes dans /assets/audio/intro.mp3 — ajuster les valeurs à l'oreille
// après génération de la voix (script : ecriture/A1-video-intro.md §4).
// Timecodes pré-calés sur les silences mesurés du montage A1 du 31/08/2026
// (ffmpeg silencedetect) — première passe automatique, à AFFINER À L'OREILLE.
//
// Montage AU CUT, un plan par segment (A1 §6). Les sous-titres reprennent le
// texte nu (§7) — les consignes doivent rester lisibles SANS le son.

/** Visuels disponibles (rendus par IntroSequence.svelte). */
export type IntroVisual =
	| 'logo' // logo IRIS plein cadre
	| 'salle' // salle vue de dessus, les 10 postes s'allument
	| 'epreuves' // 3 cadenas fermés + cadran 30 min (plan 2)
	| 'consigne-ressources'
	| 'consigne-hauteur'
	| 'consigne-plein-ecran'
	| 'consigne-cable'
	| 'consigne-console'
	| 'cloture'; // logo + ÉVALUATION D'ENTRÉE — PROMOTION MMI1

export interface IntroCue {
	/** Timecode en secondes dans intro.mp3 — À AJUSTER sur l'audio généré. */
	at: number;
	visual: IntroVisual;
	/** Sous-titre affiché jusqu'au cue suivant (vide = pas de sous-titre). */
	subtitle?: string;
}

export const INTRO_CUES: IntroCue[] = [
	// ── Segment 1 — accueil (≈ 0:00 → 0:14) ────────────────────────────────
	{
		at: 0,
		visual: 'logo',
		subtitle: 'Bienvenue. Merci d’être là — votre participation nous est précieuse.'
	},
	{
		at: 5,
		visual: 'logo',
		subtitle: 'Vous participez aujourd’hui à l’évaluation d’entrée de la promotion MMI1.'
	},
	{
		at: 10,
		visual: 'logo',
		subtitle:
			'Cette évaluation est opérée par IRIS, Interface de Recherche et d’Information Scolaire.'
	},
	// ── Segment 2 — le cadre (≈ 0:14 → 0:36) ───────────────────────────────
	{
		at: 17,
		visual: 'salle',
		subtitle: 'Elle se déroule en trois épreuves, réparties sur l’ensemble des postes de la salle.'
	},
	{ at: 20, visual: 'salle', subtitle: 'Vous disposez de trente minutes.' },
	{
		at: 23.5,
		visual: 'epreuves',
		subtitle:
			'Il n’y a ni note, ni classement, ni bonne réponse attendue : nous observons seulement la façon dont vous procédez.'
	},
	{ at: 30.5, visual: 'epreuves', subtitle: 'Vous ne pouvez pas échouer.' },
	// ── Segment 3 — les consignes (≈ 0:36 → 1:16) ──────────────────────────
	{ at: 33, visual: 'consigne-ressources', subtitle: 'Avant de commencer, quelques consignes.' },
	{
		at: 35,
		visual: 'consigne-ressources',
		subtitle:
			'L’ensemble des ressources de la salle est à votre disposition. Certains documents n’ont pas été numérisés.'
	},
	{
		at: 41.5,
		visual: 'consigne-hauteur',
		subtitle:
			'Tous les éléments nécessaires se trouvent à hauteur de regard. Il n’est jamais nécessaire de vous baisser, de chercher sous le mobilier, ni d’y monter.'
	},
	{
		at: 50,
		visual: 'consigne-plein-ecran',
		subtitle:
			'Les postes sont configurés en affichage plein écran. Merci de ne pas quitter cet affichage, et de ne pas changer de page.'
	},
	{ at: 57, visual: 'consigne-cable', subtitle: 'Aucun câble ne doit être débranché.' },
	{
		at: 60,
		visual: 'consigne-console',
		subtitle:
			'Enfin, l’ordinateur relié au vidéoprojecteur est une console d’administration. Elle ne fait pas partie de l’évaluation. Merci de ne pas y toucher.'
	},
	// ── Segment 4 — clôture (≈ 1:16 → 1:32) ────────────────────────────────
	{
		at: 69,
		visual: 'cloture',
		subtitle:
			'Votre poste vous indiquera à tout moment ce dont il a besoin, et où le trouver. Un superviseur est présent dans la salle.'
	},
	{ at: 75.9, visual: 'cloture', subtitle: 'L’évaluation va commencer.' },
	{
		at: 78.1,
		visual: 'cloture',
		subtitle: 'Merci d’être là. Votre participation nous est précieuse.'
	}
];

/**
 * Durée totale en mode horloge (audio bloqué ou introuvable) : la séquence se
 * termine seule à ce timecode. En mode audio, c'est la fin du MP3 qui conclut.
 */
export const INTRO_FALLBACK_DURATION_S = 83;

/** Cue active pour un temps donné (la dernière dont le `at` est dépassé). */
export function cueAt(seconds: number): IntroCue {
	let current = INTRO_CUES[0];
	for (const cue of INTRO_CUES) {
		if (cue.at <= seconds) current = cue;
		else break;
	}
	return current;
}
