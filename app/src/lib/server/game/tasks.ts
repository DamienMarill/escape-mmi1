// Validation serveur des six mini-tâches. Les solutions non déductibles
// de l'écran (plan de câblage, machine intruse) vivent ICI et nulle part
// ailleurs. Échec = message doux, jamais de pénalité (game-design §7).

import {
	COMPILATION_ERROR_INDEX,
	MEMOIRE_BAR_SIZE,
	MEMOIRE_BLOCKS,
	PARITE_ROWS,
	SCAN_MACHINES,
	SYNCHRO_CLAP_FRAME,
	SYNCHRO_WAVEFORM
} from '$lib/tasks-data';
import type { TaskId } from '$lib/types';

/**
 * Plan de câblage de la baie (game-design §12.2) — dessiné au tableau,
 * masqué par un battant. SECRET serveur : jamais dans le bundle client.
 */
const BRASSAGE_PLAN: Record<number, string> = {
	1: 'D',
	2: 'A',
	3: 'F',
	4: 'B',
	5: 'E',
	6: 'C'
};

/** Nom de la machine intruse de SCAN (viole la convention INV-2019-04). */
const SCAN_INTRUDER_NAME = 'SRV-EVAL-7';

/** Index de la ligne corrompue de PARITÉ (contrôle incohérent avec les bits). */
const PARITE_CORRUPT_ROW = PARITE_ROWS.findIndex(
	(row) => row.bits.reduce((a, b) => a + b, 0) % 2 !== row.control
);

/** Décalage attendu par SYNCHRO : pic audio aligné sur l'image du clap. */
const SYNCHRO_TARGET = SYNCHRO_WAVEFORM.indexOf(Math.max(...SYNCHRO_WAVEFORM)) - SYNCHRO_CLAP_FRAME;
const SYNCHRO_TOLERANCE = 2;

export interface TaskResult {
	solved: boolean;
	/** Message d'échec doux, dans la fiction — jamais culpabilisant. */
	message?: string;
}

type Validator = (payload: unknown) => TaskResult;

const fail = (message: string): TaskResult => ({ solved: false, message });

const validators: Record<TaskId, Validator> = {
	compilation(payload) {
		const p = payload as { clicks?: number[] };
		const clicks = p?.clicks;
		if (!Array.isArray(clicks) || clicks.length !== COMPILATION_ERROR_INDEX.length)
			return fail('analyse incomplète — reprendre le flux de logs');
		const allFound = COMPILATION_ERROR_INDEX.every((idx, wave) => clicks[wave] === idx);
		return allFound ? { solved: true } : fail('erreur non isolée — relancer la passe');
	},

	memoire(payload) {
		const p = payload as { placed?: string[] };
		if (!Array.isArray(p?.placed)) return fail('allocation incomplète');
		const ids = new Set(p.placed);
		const allPlaced = MEMOIRE_BLOCKS.every((b) => ids.has(b.id));
		const total = MEMOIRE_BLOCKS.filter((b) => ids.has(b.id)).reduce((a, b) => a + b.size, 0);
		return allPlaced && total === MEMOIRE_BAR_SIZE && ids.size === MEMOIRE_BLOCKS.length
			? { solved: true }
			: fail('fragmentation détectée — réorganiser les blocs');
	},

	brassage(payload) {
		const p = payload as { connections?: Record<string, string> };
		if (!p?.connections) return fail('câblage incomplet');
		const ok = Object.entries(BRASSAGE_PLAN).every(
			([port, socket]) => p.connections![port] === socket
		);
		const complete = Object.keys(BRASSAGE_PLAN).every((port) => p.connections![port]);
		if (!complete) return fail('câblage incomplet — des ports restent libres');
		return ok ? { solved: true } : fail('correspondance invalide — consulter le plan de câblage');
	},

	parite(payload) {
		const p = payload as { row?: number };
		return p?.row === PARITE_CORRUPT_ROW
			? { solved: true }
			: fail('cette ligne est intègre — vérifier les bits de contrôle');
	},

	synchro(payload) {
		const p = payload as { offset?: number };
		if (typeof p?.offset !== 'number') return fail('décalage non défini');
		return Math.abs(p.offset - SYNCHRO_TARGET) <= SYNCHRO_TOLERANCE
			? { solved: true }
			: fail('pistes désynchronisées — affiner le calage');
	},

	scan(payload) {
		const p = payload as { machine?: string };
		if (!p?.machine || !SCAN_MACHINES.some((m) => m.name === p.machine))
			return fail('machine inconnue');
		return p.machine === SCAN_INTRUDER_NAME
			? { solved: true }
			: fail('machine légitime — recouper avec la documentation');
	}
};

export function validateTask(task: TaskId, payload: unknown): TaskResult {
	return validators[task](payload);
}
