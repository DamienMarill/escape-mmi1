// Singleton du jeu : une partie par serveur (un serveur par salle).
// Restauré depuis le snapshot disque au démarrage s'il existe.

import type { PublicState } from '$lib/types';
import { loadSnapshot, startSnapshotLoop } from './persist';
import { Game, type SalleData } from './state';

function createGame(): Game {
	const snapshot = loadSnapshot();
	const game = new Game({
		state: (snapshot?.state as PublicState) ?? undefined,
		salle: (snapshot?.salle as SalleData) ?? undefined
	});
	startSnapshotLoop(game);
	return game;
}

// En dev, le module peut être rechargé par HMR : on accroche le singleton au globalThis.
const g = globalThis as unknown as { __game?: Game };
export const game: Game = (g.__game ??= createGame());
