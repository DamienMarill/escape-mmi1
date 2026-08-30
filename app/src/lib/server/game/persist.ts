// Snapshot JSON sur disque toutes les 2 s pour survivre à un crash (§14).
// Pas une base de données : un seul fichier, réécrit en entier.

import fs from 'node:fs';
import path from 'node:path';
import { SNAPSHOT_INTERVAL_MS } from './constants';
import type { Game } from './state';

const DATA_DIR = process.env.GAME_DATA_DIR ?? path.resolve('data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'session.json');

export function loadSnapshot(): { state?: unknown; salle?: unknown } | null {
	try {
		return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf-8'));
	} catch {
		return null;
	}
}

export function startSnapshotLoop(game: Game): () => void {
	let dirty = false;
	const unsubscribe = game.subscribe(() => {
		dirty = true;
	});
	const timer = setInterval(() => {
		if (!dirty) return;
		dirty = false;
		try {
			fs.mkdirSync(DATA_DIR, { recursive: true });
			const tmp = SNAPSHOT_FILE + '.tmp';
			fs.writeFileSync(tmp, JSON.stringify(game.toJSON()));
			fs.renameSync(tmp, SNAPSHOT_FILE);
		} catch (err) {
			console.error('[snapshot] échec d’écriture :', err);
		}
	}, SNAPSHOT_INTERVAL_MS);
	timer.unref?.();
	return () => {
		clearInterval(timer);
		unsubscribe();
	};
}
