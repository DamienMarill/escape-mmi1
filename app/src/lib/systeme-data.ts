// Données du poste SYSTÈME — partagées client/serveur.
// L'arborescence et les règles d'accès sont affichées ; le puzzle est un
// problème de ressource (quota de verrous), pas un secret.

export interface FsNode {
	path: string;
	name: string;
	kind: 'dir' | 'file';
	depth: number;
}

/** Arborescence fixe. La racine est toujours traversable (pas de verrou). */
export const FS_TREE: FsNode[] = [
	{ path: 'archives', name: 'archives/', kind: 'dir', depth: 0 },
	{ path: 'archives/sessions', name: 'sessions/', kind: 'dir', depth: 1 },
	{ path: 'archives/sessions/eval_mmi1.dat', name: 'eval_mmi1.dat', kind: 'file', depth: 2 },
	{ path: 'archives/sessions/eval_mmi0.dat', name: 'eval_mmi0.dat', kind: 'file', depth: 2 },
	{ path: 'archives/inventaire.txt', name: 'inventaire.txt', kind: 'file', depth: 1 },
	{ path: 'systeme', name: 'systeme/', kind: 'dir', depth: 0 },
	{ path: 'systeme/noyaux', name: 'noyaux/', kind: 'dir', depth: 1 },
	{ path: 'systeme/config.sys', name: 'config.sys', kind: 'file', depth: 1 },
	{ path: 'public', name: 'public/', kind: 'dir', depth: 0 },
	{ path: 'public/notes.txt', name: 'notes.txt', kind: 'file', depth: 1 }
];

/** Fichier cible de l'épreuve. */
export const TARGET_FILE = 'archives/sessions/eval_mmi1.dat';

/**
 * Règle d'accès, affichée en permanence à l'écran :
 * ouvrir un fichier exige TRAVERSER (x) chaque dossier du chemin,
 * LIRE (r) le dossier parent, et LIRE (r) le fichier lui-même.
 */
export const ACCESS_RULE =
	'Ouvrir un fichier exige : traverser (x) chaque dossier du chemin, lire (r) le dossier parent, lire (r) le fichier.';

/** Identifiants de verrous : `x:<path>` (traverser, dossiers) ou `r:<path>` (lire). */
export type LockKey = string;

/** Verrous disponibles sur un nœud. */
export function locksFor(node: FsNode): LockKey[] {
	return node.kind === 'dir' ? [`x:${node.path}`, `r:${node.path}`] : [`r:${node.path}`];
}

/** Les 4 verrous exactement requis pour ouvrir la cible (= le schéma des verrous). */
export const REQUIRED_LOCKS: LockKey[] = [
	'x:archives',
	'x:archives/sessions',
	'r:archives/sessions',
	`r:${TARGET_FILE}`
];

/** Quota de base ; BRASSAGE et PARITÉ accordent chacun +1 (game-design §6). */
export const BASE_QUOTA = 2;
export const MAX_QUOTA = 4;
