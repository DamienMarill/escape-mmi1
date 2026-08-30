// Construction des chaînes de dépendances affichées sous chaque cadenas du
// vidéoprojecteur (game-design §8). Un ChainLink par maillon, résolu ou non.

import { PORT_IDS, TASK_PORT, type PortId, type PublicState, type TaskId } from '$lib/types';

export interface ChainLink {
	label: string;
	resolved: boolean;
	/** Segment révélé par la soupape MJ : mis en évidence à l'écran. */
	highlighted?: boolean;
}

const PORT_TASK: Record<PortId, TaskId> = Object.fromEntries(
	(Object.entries(TASK_PORT) as [TaskId, PortId][]).map(([task, port]) => [port, task])
) as Record<PortId, TaskId>;

export function buildAlphaChain(state: PublicState): ChainLink[] {
	return [
		{ label: 'tâche A', resolved: state.tasks.compilation.solved },
		{ label: 'tâche B', resolved: state.tasks.memoire.solved },
		{ label: 'SÉQUENCEUR', resolved: state.epreuves.dev.solved }
	];
}

export function buildBetaChain(state: PublicState): ChainLink[] {
	return [
		{ label: 'tâche C', resolved: state.tasks.brassage.solved },
		{ label: 'tâche D', resolved: state.tasks.parite.solved },
		{ label: 'tâche E', resolved: state.tasks.synchro.solved },
		{ label: 'tâche F', resolved: state.tasks.scan.solved },
		{ label: 'TRAITEMENT', resolved: state.epreuves.image.solved },
		{ label: 'ARBORESCENCE', resolved: state.epreuves.systeme.solved }
	];
}

export function buildGammaChain(state: PublicState): ChainLink[] {
	return PORT_IDS.map((port) => {
		const task = PORT_TASK[port];
		const obtained = state.tasks[task].solved;
		const revealedValue = state.revealedSegments[port];
		const label = revealedValue
			? `PORT ${port} : ${revealedValue} (révélé)`
			: obtained
				? `PORT ${port} — OBTENU`
				: `PORT ${port}`;
		return { label, resolved: obtained, highlighted: Boolean(revealedValue) };
	});
}
