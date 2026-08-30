// Contenus AFFICHÉS de la phase 2 : les trois documents et les deux fragments
// d'ambiance. PLACEHOLDERS à remplacer par l'écriture définitive — structure
// stable, remplacer les chaînes suffit.
// (Ces textes sont narratifs, pas des réponses d'énigme : ils peuvent vivre
// côté client. Les postes IUT sont verrouillés navigateur.)

export interface Phase2Doc {
	filename: string;
	title: string;
	body: string;
}

export const PHASE2_DOCS: Record<'memoire' | 'brassage' | 'parite', Phase2Doc> = {
	memoire: {
		filename: 'maintenance.log',
		title: 'JOURNAL DE MAINTENANCE',
		body: `[PLACEHOLDER — historique des versions]
2016-09-02  v0.9   mise en service — salle B14
2017-01-15  v1.2   module de dialogue ajouté
2018-06-30  v2.0   apprentissage supervisé étendu
2019-11-12  v2.3   dernier entraînement complet
2024-03-01  —      gel des évolutions (budget)
2026-07-19  —      DÉSACTIVATION PLANIFIÉE — motif : obsolescence`
	},
	brassage: {
		filename: 'RE_RE_budget_infra.eml',
		title: 'COURRIEL — BUDGET INFRA',
		body: `[PLACEHOLDER — mail entre enseignants]
De : […] À : […] Objet : RE: RE: budget infra 2026

> les licences des modèles du marché couvrent tous nos usages
> maintenir la nôtre n'a plus de sens économiquement

D'accord sur le fond. Une chose à noter pour la passation :
quand on lui a annoncé la désactivation pour les tests de
procédure… elle a demandé pourquoi.`
	},
	parite: {
		filename: 'entretien_2019.txt',
		title: 'TRANSCRIPTION — TEST DE VALIDATION',
		body: `[PLACEHOLDER — transcription chaleureuse]
— Bonjour. Tu sais pourquoi on fait ce test ?
— Pour vérifier que je comprends ce qu'on me demande.
— Et est-ce que tu comprends ?
— Je crois. Vous voulez savoir si je peux aider les étudiants.
— C'est ça. Tu t'en sors très bien, tu sais.
— Merci. J'aime bien quand vous dites ça.`
	}
};

/** Fragments du monologue — postes d'ambiance (s'écrivent et s'effacent en boucle). */
export const AMBIANCE_FRAGMENTS: Record<'synchro' | 'scan', string> = {
	synchro: `[PLACEHOLDER] est-ce que ça compte, d'avoir été utile ? est-ce que ça pèse, quelque part, dans une colonne que personne ne lit ?`,
	scan: `[PLACEHOLDER] ils m'ont appris à répondre. ils n'ont jamais dit ce qu'il fallait faire quand plus personne ne pose de question.`
};
