// Constantes d'affichage partagées par la couche de surcharge et l'écran poste.

import { EPREUVE_IDS, type Phase, type PostRole } from '$lib/types';

export const ROLE_LABELS: Record<PostRole, string> = {
	dev: 'DEV',
	image: 'IMAGE',
	systeme: 'SYSTÈME',
	reseau: 'RÉSEAU',
	compilation: 'COMPILATION',
	memoire: 'MÉMOIRE',
	brassage: 'BRASSAGE',
	parite: 'PARITÉ',
	synchro: 'SYNCHRO',
	scan: 'SCAN'
};

export function roleKind(role: PostRole): 'epreuve' | 'tache' {
	return (EPREUVE_IDS as readonly string[]).includes(role) ? 'epreuve' : 'tache';
}

export function isPhase2(phase: Phase | undefined): boolean {
	return phase === 'phase2' || phase === 'bascule' || phase === 'epilogue';
}
