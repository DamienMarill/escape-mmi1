// Simulateur du séquenceur DEV — logique pure, partagée client/serveur.
// Le client s'en sert pour ANIMER le robot ; le serveur pour VALIDER.
// Rien de secret ici : la grille est affichée à l'écran, la déduction
// fait partie du puzzle (comme PARITÉ).

export type BlockId = 'avance' | 'tourne' | 'repete-avance' | 'si-mur-tourne';

/** Palette de base ; les deux autres blocs sont déblocables. */
export const BASE_BLOCKS: BlockId[] = ['avance', 'tourne'];
export const LOCKED_BLOCKS: { id: BlockId; label: string; source: string }[] = [
	{ id: 'repete-avance', label: 'RÉPÈTE ×3 — AVANCE', source: 'un poste TÂCHE' },
	{ id: 'si-mur-tourne', label: 'SI MUR — TOURNE', source: 'un poste TÂCHE' }
];

export const BLOCK_LABELS: Record<BlockId, string> = {
	avance: 'AVANCE',
	tourne: 'TOURNE',
	'repete-avance': 'RÉPÈTE ×3 — AVANCE',
	'si-mur-tourne': 'SI MUR — TOURNE'
};

export const MAX_SLOTS = 3;
export const ENERGY_BUDGET = 10;

/**
 * Grille 9×6. Couloirs est 7 → sud 3 → ouest 3 : les longueurs déjouent tout
 * programme sans SI MUR (tourner « au rythme » rate les virages) et tout
 * programme sans RÉPÈTE (budget d'énergie insuffisant). Vérifié par les tests.
 * `#` mur, `.` libre, `S` départ (face est), `T` cible.
 */
export const GRID = [
	'#########',
	'S.......#',
	'#######.#',
	'#######.#',
	'####T...#',
	'#########'
] as const;

export const GRID_W = 9;
export const GRID_H = 6;

export interface SimStep {
	x: number;
	y: number;
	/** 0=est 1=sud 2=ouest 3=nord */
	dir: number;
	block: BlockId;
}

export interface SimResult {
	success: boolean;
	/** 'target' | 'energy' | 'stuck' */
	outcome: 'target' | 'energy' | 'stuck';
	steps: SimStep[];
	ticksUsed: number;
}

function cellAt(x: number, y: number): string {
	if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return '#';
	return GRID[y][x];
}

function findCell(ch: string): { x: number; y: number } {
	for (let y = 0; y < GRID_H; y++) {
		const x = GRID[y].indexOf(ch);
		if (x >= 0) return { x, y };
	}
	throw new Error(`cellule ${ch} absente de la grille`);
}

const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

/**
 * Exécute le programme EN BOUCLE jusqu'à : cible atteinte, budget épuisé,
 * ou boucle stérile (un tour complet sans aucun mouvement ni rotation utile).
 * Chaque bloc exécuté coûte 1 tick — RÉPÈTE ×3 avance 3 cases pour 1 tick :
 * la boucle est plus EFFICACE, c'est la leçon du poste.
 */
export function simulate(program: BlockId[]): SimResult {
	const start = findCell('S');
	const target = findCell('T');
	let { x, y } = start;
	let dir = 0;
	const steps: SimStep[] = [];
	let ticks = 0;

	if (program.length === 0 || program.length > MAX_SLOTS)
		return { success: false, outcome: 'stuck', steps, ticksUsed: 0 };

	const tryForward = (): boolean => {
		const nx = x + DX[dir];
		const ny = y + DY[dir];
		if (cellAt(nx, ny) === '#') return false;
		x = nx;
		y = ny;
		return true;
	};
	const wallAhead = () => cellAt(x + DX[dir], y + DY[dir]) === '#';

	while (ticks < ENERGY_BUDGET) {
		let movedThisLoop = false;
		for (const block of program) {
			if (ticks >= ENERGY_BUDGET) break;
			ticks++;
			switch (block) {
				case 'avance':
					if (tryForward()) movedThisLoop = true;
					break;
				case 'repete-avance':
					for (let i = 0; i < 3; i++) if (tryForward()) movedThisLoop = true;
					break;
				case 'tourne':
					dir = (dir + 1) % 4;
					movedThisLoop = true;
					break;
				case 'si-mur-tourne':
					if (wallAhead()) {
						dir = (dir + 1) % 4;
						movedThisLoop = true;
					}
					break;
			}
			steps.push({ x, y, dir, block });
			if (x === target.x && y === target.y)
				return { success: true, outcome: 'target', steps, ticksUsed: ticks };
		}
		if (!movedThisLoop) return { success: false, outcome: 'stuck', steps, ticksUsed: ticks };
	}
	return { success: false, outcome: 'energy', steps, ticksUsed: ticks };
}
