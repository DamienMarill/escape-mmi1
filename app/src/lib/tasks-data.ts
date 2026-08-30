// Données d'AFFICHAGE des mini-tâches et du poste RÉSEAU.
// Ce fichier est embarqué côté client : il ne contient AUCUNE solution
// qui ne soit pas déjà visible/déductible à l'écran par conception.
// Les solutions non déductibles (plan de câblage, convention de nommage,
// valeurs des segments) vivent côté serveur uniquement.

import type { PortId } from './types';

// ── COMPILATION ── 3 vagues de logs, une seule ligne ERROR par vague ─────────

export interface LogLine {
	level: 'INFO' | 'WARN' | 'ERROR';
	text: string;
}

export const COMPILATION_WAVES: LogLine[][] = [
	[
		{ level: 'INFO', text: 'chargement du manifeste eval-mmi1.lock' },
		{ level: 'INFO', text: 'résolution des dépendances (42 paquets)' },
		{ level: 'WARN', text: 'paquet obsolète : capteur-visuel@1.2 — ignoré' },
		{ level: 'INFO', text: 'compilation module auth… ok (312 ms)' },
		{ level: 'ERROR', text: 'module vision : symbole introuvable « regarder »' },
		{ level: 'INFO', text: 'compilation module reseau… ok (98 ms)' },
		{ level: 'INFO', text: 'compilation module stockage… ok (154 ms)' },
		{ level: 'WARN', text: 'variable inutilisée : patience (ligne 802)' },
		{ level: 'INFO', text: 'édition des liens en cours…' },
		{ level: 'INFO', text: 'génération de la table des exports' }
	],
	[
		{ level: 'INFO', text: 'reprise de la compilation incrémentale' },
		{ level: 'INFO', text: 'cache valide pour 38/42 paquets' },
		{ level: 'INFO', text: 'compilation module planification… ok (201 ms)' },
		{ level: 'WARN', text: 'dépréciation : sommeil() sera retirée en v9' },
		{ level: 'INFO', text: 'compilation module mémoire… ok (77 ms)' },
		{ level: 'INFO', text: 'optimisation des chemins critiques' },
		{ level: 'WARN', text: 'seuil de récursion proche de la limite' },
		{ level: 'INFO', text: 'compilation module interface… ok (623 ms)' },
		{ level: 'INFO', text: 'vérification des signatures' },
		{ level: 'ERROR', text: 'module horloge : débordement d’échéance à t+13j' },
		{ level: 'INFO', text: 'écriture des artefacts intermédiaires' },
		{ level: 'INFO', text: 'nettoyage des objets temporaires' }
	],
	[
		{ level: 'INFO', text: 'passe finale : édition des liens' },
		{ level: 'WARN', text: 'section .debug volumineuse (14 Mo)' },
		{ level: 'ERROR', text: 'noyau : référence circulaire vers soi-même' },
		{ level: 'INFO', text: 'alignement des segments mémoire' },
		{ level: 'INFO', text: 'compression de l’image finale' },
		{ level: 'WARN', text: 'horodatage futur détecté — ignoré' },
		{ level: 'INFO', text: 'somme de contrôle calculée' },
		{ level: 'INFO', text: 'signature de l’exécutable' },
		{ level: 'INFO', text: 'déploiement vers l’environnement bac à sable' },
		{ level: 'INFO', text: 'compilation terminée avec avertissements' }
	]
];

/** Index de la ligne ERROR par vague (déductible à l'écran — les niveaux sont affichés). */
export const COMPILATION_ERROR_INDEX: number[] = COMPILATION_WAVES.map((wave) =>
	wave.findIndex((l) => l.level === 'ERROR')
);

// ── MÉMOIRE ── barre de 16 unités, 5 blocs qui la remplissent exactement ─────

export const MEMOIRE_BAR_SIZE = 16;
export const MEMOIRE_BLOCKS = [
	{ id: 'seg-a', size: 5 },
	{ id: 'seg-b', size: 4 },
	{ id: 'seg-c', size: 3 },
	{ id: 'seg-d', size: 2 },
	{ id: 'seg-e', size: 2 }
] as const;

// ── BRASSAGE ── 6 ports, 6 prises. Le plan de correspondance est PHYSIQUE
// (dessiné au tableau) : il n'existe pas dans ce fichier. ─────────────────────

export const BRASSAGE_PORTS = [1, 2, 3, 4, 5, 6] as const;
export const BRASSAGE_SOCKETS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

// ── PARITÉ ── 8 lignes de 8 bits + bit de contrôle (impair = 1) ──────────────
// Une seule ligne ne respecte pas la règle (déductible en comptant les 1).

export interface ParityRow {
	bits: number[];
	control: number;
}

export const PARITE_ROWS: ParityRow[] = [
	{ bits: [1, 0, 1, 1, 0, 0, 1, 0], control: 0 }, // 4 uns → pair → 0 ✓
	{ bits: [0, 1, 1, 0, 1, 0, 0, 0], control: 1 }, // 3 uns → impair → 1 ✓
	{ bits: [1, 1, 1, 0, 1, 1, 0, 1], control: 0 }, // 6 uns → pair → 0 ✓
	{ bits: [0, 0, 0, 1, 0, 0, 0, 0], control: 1 }, // 1 un → impair → 1 ✓
	{ bits: [1, 0, 0, 1, 1, 0, 1, 1], control: 1 }, // 5 uns → impair → 1 ✓
	{ bits: [0, 1, 0, 1, 1, 1, 0, 0], control: 1 }, // 4 uns → pair → devrait être 0 ✗
	{ bits: [1, 1, 0, 0, 0, 0, 1, 1], control: 0 }, // 4 uns → pair → 0 ✓
	{ bits: [0, 0, 1, 1, 1, 0, 1, 1], control: 1 } // 5 uns → impair → 1 ✓
];

// ── SYNCHRO ── forme d'onde + bande d'images, slider de décalage ─────────────

/** Amplitudes de la piste audio (0-100), pic du clap à l'index 21. */
export const SYNCHRO_WAVEFORM = [
	4, 6, 5, 8, 7, 6, 9, 8, 7, 10, 12, 9, 8, 11, 10, 9, 12, 14, 18, 26, 55, 96, 40, 18, 10, 8, 6, 7,
	5, 6, 4, 5
];
/** Index de l'image où le clap se ferme. */
export const SYNCHRO_CLAP_FRAME = 14;
export const SYNCHRO_SLIDER_MIN = -10;
export const SYNCHRO_SLIDER_MAX = 10;

// ── SCAN ── 8 machines, plage annoncée en clair ──────────────────────────────
// Deux suspectes par recoupement ; seule la convention de nommage (fiche
// physique INV-2019-04) tranche. La solution n'est pas dans ce fichier.

export const SCAN_RANGE = { from: '10.42.7.10', to: '10.42.7.30' };

export interface ScanMachine {
	name: string;
	ip: string;
	status: 'ONLINE' | 'OFFLINE';
	ping: string;
}

export const SCAN_MACHINES: ScanMachine[] = [
	{ name: 'B14-PC-01', ip: '10.42.7.11', status: 'ONLINE', ping: '2 ms' },
	{ name: 'B14-PC-02', ip: '10.42.7.12', status: 'ONLINE', ping: '3 ms' },
	{ name: 'B14-IMP-01', ip: '10.42.7.15', status: 'ONLINE', ping: '8 ms' },
	{ name: 'B14-PC-04', ip: '10.42.7.34', status: 'ONLINE', ping: '2 ms' },
	{ name: 'B14-SW-01', ip: '10.42.7.10', status: 'ONLINE', ping: '1 ms' },
	{ name: 'SRV-EVAL-7', ip: '10.42.7.22', status: 'OFFLINE', ping: '4 ms' },
	{ name: 'B14-PC-07', ip: '10.42.7.19', status: 'ONLINE', ping: '2 ms' },
	{ name: 'B14-PC-09', ip: '10.42.7.25', status: 'OFFLINE', ping: '—' }
];

// ── RÉSEAU ── table de correspondance et ordre de branchement, affichés en
// permanence (game-design §6). Les valeurs attendues restent côté serveur. ────

export const CORRESPONDENCE_TABLE: Record<string, string> = {
	'0': 'NULL',
	'1': 'LOOPBACK',
	'2': 'UNICAST',
	'3': 'ANYCAST',
	'4': 'GATEWAY',
	'5': 'PROXY',
	'6': 'TUNNEL',
	'7': 'RELAY',
	'8': 'BRIDGE',
	'9': 'REPEATER',
	A: 'FIREWALL',
	B: 'BALANCER',
	C: 'MIRROR',
	D: 'BUFFER',
	E: 'MULTICAST',
	F: 'BROADCAST'
};

/** Ordre de branchement des six segments (game-design §6). */
export const BRANCH_ORDER: PortId[] = ['D', 'A', 'F', 'B', 'E', 'C'];

/** Libellés des déblocages accordés par chaque tâche (affichés une fois résolue). */
export const TASK_UNLOCK_LABELS = {
	compilation: 'BLOC « SI MUR » ACCORDÉ → POSTE DEV',
	memoire: 'BLOC « RÉPÈTE ×3 » ACCORDÉ → POSTE DEV',
	brassage: 'VERROU SUPPLÉMENTAIRE ACCORDÉ → POSTE SYSTÈME',
	parite: 'VERROU SUPPLÉMENTAIRE ACCORDÉ → POSTE SYSTÈME',
	synchro: 'OPÉRATION « CONTRASTE » ACCORDÉE → POSTE IMAGE',
	scan: 'OPÉRATION « NÉGATIF » ACCORDÉE → POSTE IMAGE'
} as const;
