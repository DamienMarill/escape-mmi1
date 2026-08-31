// Types partagés client/serveur. AUCUNE donnée secrète ici :
// tout ce que ce fichier décrit transite vers les navigateurs joueurs.

export const TASK_IDS = [
	'compilation',
	'memoire',
	'brassage',
	'parite',
	'synchro',
	'scan'
] as const;
export type TaskId = (typeof TASK_IDS)[number];

export const EPREUVE_IDS = ['dev', 'image', 'systeme', 'reseau'] as const;
export type EpreuveId = (typeof EPREUVE_IDS)[number];

export const POST_ROLES = [...EPREUVE_IDS, ...TASK_IDS] as const;
export type PostRole = (typeof POST_ROLES)[number];

/** Rôle assignable à un client : un des 10 postes joueurs, ou le vidéoprojecteur. */
export type Role = PostRole | 'projector';

export type Phase = 'idle' | 'intro' | 'phase1' | 'bascule' | 'phase2' | 'epilogue';

export const LOCK_IDS = ['alpha', 'beta', 'gamma'] as const;
export type LockId = (typeof LOCK_IDS)[number];
/** locked → open (phase 1) → reclosed (phase 2, les cadenas se referment). */
export type LockStatus = 'locked' | 'open' | 'reclosed';

export const PORT_IDS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type PortId = (typeof PORT_IDS)[number];

/** Chaque tâche produit le segment d'un port (game-design §5). */
export const TASK_PORT: Record<TaskId, PortId> = {
	compilation: 'A',
	memoire: 'B',
	brassage: 'C',
	parite: 'D',
	synchro: 'E',
	scan: 'F'
};

export interface PostInfo {
	/** Numéro affiché en grand sur l'écran d'identification. */
	number: number;
	role: Role | null;
	connected: boolean;
	/** Le bouton ACTIVER CE POSTE a été cliqué pendant cette session. */
	activated: boolean;
	/** Verrouillage manuel par le MJ (couche bloquante). */
	lockedByMj: boolean;
}

export interface HintMsg {
	text: string;
	level: number;
	/** seq au moment de l'envoi — permet au client de distinguer un nouvel indice. */
	seq: number;
}

export interface ChronoState {
	running: boolean;
	/** Temps écoulé cumulé au moment du dernier changement d'état du chrono. */
	elapsedMs: number;
	/** Horodatage serveur du dernier changement (start/pause/ajustement). */
	changedAt: number;
	durationMs: number;
}

export interface TaskPublicState {
	solved: boolean;
	/** Valeur hexa du segment — présente UNIQUEMENT une fois la tâche résolue. */
	segment: string | null;
}

export interface PublicState {
	seq: number;
	serverNow: number;
	phase: Phase;
	calmMode: boolean;
	chrono: ChronoState;
	/** Clé = clientId. */
	posts: Record<string, PostInfo>;
	locks: Record<LockId, LockStatus>;
	tasks: Record<TaskId, TaskPublicState>;
	epreuves: Record<EpreuveId, { solved: boolean }>;
	finale: 'none' | 'available' | 'validating' | 'done';
	ending: 'A' | 'B' | null;
	/** Horodatage serveur du lancement de la vidéo d'intro. */
	introStartedAt: number | null;
	/** Horodatage serveur du clic VALIDER (début de la séquence bureaucratique). */
	finaleValidatedAt: number | null;
	/** Horodatage serveur de l'entrée en bascule. */
	basculeAt: number | null;
	/** Horodatage serveur de l'entrée en phase 2. */
	phase2At: number | null;
	/** Horaires programmés de refermeture des cadenas en phase 2. */
	relockAt: Partial<Record<LockId, number>>;
	/** Valeurs des segments révélés au projecteur (soupape MJ uniquement). */
	revealedSegments: Partial<Record<PortId, string>>;
	/** Poste RÉSEAU : saisie persistante, tentatives, verrouillage anti-brute-force. */
	reseau: {
		entries: Partial<Record<PortId, string>>;
		attempts: number;
		lockedUntil: number | null;
	};
	/** Poste SYSTÈME : verrous ouverts (`x:<path>` / `r:<path>`), persistants. */
	systeme: { locks: string[] };
	/** Poste DEV : nombre d'échecs consécutifs (pour le message du 3e échec). */
	devFails: number;
	/** Terminal d'urgence (phase 2, poste COMPILATION recyclé). */
	terminal: {
		stage: 'auth' | 'browse' | 'core';
		/** Réplique de l'IA après la ré-authentification. */
		authTaunt: string | null;
		/** Le monologue, envoyé uniquement après terminal/readCore. */
		coreContent: string | null;
		/** Permissions du dossier parent du noyau — true = OUVERT. Le fusil de Tchekhov. */
		parentLocks: { x: boolean; r: boolean };
	};
	/** Manifestation courante de l'IA (phase 2), poussée par le serveur. */
	manifestation: { text: string; audio: string; seq: number } | null;
	/** Écran de restitution de fin de journée (projecteur). */
	restitution: boolean;
	/** Fins des sessions de la journée (survit aux resets) — pour la restitution. */
	sessionHistory: { endedAt: number; ending: 'A' | 'B' }[];
	/** Filet automatique : rappels « document non numérisé » actifs au projecteur. */
	reminders: Partial<Record<'brassage' | 'scan', boolean>>;
	/** Délai d'animation de bascule par clientId (ms), poussé au moment de la bascule. */
	basculeDelays: Record<string, number>;
	/** Indice MJ actif par clientId. */
	hints: Record<string, HintMsg | null>;
	/** Soupape MJ : segments révélés au projecteur. */
	revealedPorts: PortId[];
	journal: { t: number; msg: string }[];
}

export type MjAction =
	| { type: 'mj/assignRole'; clientId: string; role: Role | null }
	| { type: 'mj/distributeRoles' }
	| { type: 'mj/startPhase1' }
	| { type: 'mj/reset' }
	| { type: 'mj/chronoStart' }
	| { type: 'mj/chronoPause' }
	| { type: 'mj/chronoAdd'; ms: number }
	| { type: 'mj/cheatOpenLock'; lock: LockId }
	| { type: 'mj/lockPost'; clientId: string; locked: boolean }
	| { type: 'mj/forgetPost'; clientId: string }
	| { type: 'mj/revealSegment'; port: PortId }
	| { type: 'mj/sendHint'; clientId: string; text: string; level: number }
	| { type: 'mj/clearHint'; clientId: string }
	| { type: 'mj/setCalmMode'; on: boolean }
	| { type: 'mj/startIntro' }
	| { type: 'mj/showRestitution'; on: boolean };

/** Symboles des dossiers de la sandbox (terminal phase 2) — ◆ est celui du robot. */
export const TERMINAL_SYMBOLS = ['▲', '●', '◆', '■', '✦'] as const;
export const CORE_SYMBOL = '◆';

export type PostAction =
	| { type: 'post/activate'; clientId: string }
	| { type: 'projector/introEnded' }
	| { type: 'reseau/validate' }
	| { type: 'task/submit'; task: TaskId; payload: unknown }
	| { type: 'reseau/setEntry'; port: PortId; value: string }
	| { type: 'reseau/submit' }
	| { type: 'dev/submit'; program: string[] }
	| { type: 'image/submit'; ops: string[] }
	| { type: 'systeme/toggle'; lock: string }
	| { type: 'systeme/openTarget' }
	| { type: 'terminal/auth'; code: string }
	| { type: 'terminal/openDir'; symbol: string }
	| { type: 'terminal/readCore' }
	| { type: 'terminal/back' }
	| { type: 'terminal/toggleParentLock'; perm: 'x' | 'r' }
	| { type: 'terminal/delete' };

export type Action = MjAction | PostAction;

/** true si l'action exige la clé MJ. */
export function isMjAction(action: Action): action is MjAction {
	return action.type.startsWith('mj/');
}
