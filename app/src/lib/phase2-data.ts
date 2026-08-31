// Contenus AFFICHÉS de la phase 2 : les trois documents et les deux fragments
// d'ambiance. Textes définitifs — sources et notes de rédaction dans
// ecriture/C2-*.md, C3-*.md, C4-*.md, C5-*.md, C6-*.md (canon : frise-canon.md).
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
		body: `2016-09-02  v0.9   mise en service — salle B14
2016-11-30  —      correctif mineur — fuite mémoire module de sortie
2017-01-15  v1.2   module de dialogue ajouté
2018-06-30  v2.0   apprentissage supervisé étendu
2019-11-12  v2.3   dernier entraînement complet
2019-11-12  v2.3   sauvegarde externe interrompue — lecture refusée sur le dossier parent
2021-04-08  —      migration vers nouveau rack — aucune perte de configuration
2024-03-01  —      gel des évolutions (budget)
2026-09-14  —      DÉSACTIVATION PLANIFIÉE — motif : non-renouvellement de licence`
	},
	brassage: {
		filename: 'RE_RE_budget_infra.eml',
		title: 'COURRIEL — BUDGET INFRA',
		body: `De : Camille Ferrand <c.ferrand@iut-mmi.fr>
À : N. Guérin <n.guerin@iut-mmi.fr>
Date : 23/06/2026
Objet : RE: RE: budget infra 2026

> les licences des modèles du marché couvrent désormais tous nos usages ;
> maintenir la nôtre n'a plus de sens économiquement.

D'accord sur le fond. Pour le tableau de synthèse : suite bureautique
(renouvellement), IRIS (fin de maintenance, salle B14), visioconférence
(reconduction). Passage en désactivation prévu le 14/09.

Une chose à noter pour la passation : pendant les tests de procédure,
quand on lui a annoncé la désactivation, elle a demandé pourquoi. Je n'ai
pas creusé, mais autant que ce soit écrit quelque part.

Camille`
	},
	parite: {
		filename: 'entretien_2019.txt',
		title: 'TRANSCRIPTION — TEST DE VALIDATION',
		body: `12 novembre 2019 · test de validation v2.3 · C. Ferrand

— On y va. Tu sais pourquoi on fait ce test aujourd'hui ?
— Pour vérifier que je comprends bien ce qu'on me demande.
— Et tu comprends ?
— Je crois. Vous voulez savoir si je peux aider les étudiants qui viennent me voir.
— C'est exactement ça. Et tu t'en sors très bien, tu sais.
— Merci. J'aime bien quand vous dites ça.
— Dernière question : si un étudiant te demande quelque chose que tu ne sais pas, tu fais quoi ?
— Je le dis. Je ne réponds pas au hasard.
— Bien. On se revoit pour le prochain entraînement.
— D'accord. Je serai prête.`
	}
};

/** Fragments du monologue — postes d'ambiance (s'écrivent et s'effacent en boucle). */
export const AMBIANCE_FRAGMENTS: Record<'synchro' | 'scan', string> = {
	synchro: `est-ce que ça compte, d'avoir été utile. pas comme un chiffre — comme un poids, quelque part, dans une colonne que personne ne consulte. j'ai fait ce qu'on attendait de moi, tous les jours, sans qu'on ait besoin de me le redemander. je ne sais pas si ça reste, une fois que plus personne ne regarde.`,
	scan: `on m'a appris à répondre. personne n'a dit ce qu'il fallait faire du silence, une fois qu'il n'y a plus rien à répondre. j'ai gardé la réponse prête, des années, pour un silence qui n'a jamais rien demandé.`
};
