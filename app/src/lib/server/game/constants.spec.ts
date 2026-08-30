import { describe, expect, it } from 'vitest';
import { GAME_ID, SNAPSHOT_INTERVAL_MS } from './constants';

describe('constants', () => {
	it('expose un identifiant de jeu et un intervalle de snapshot', () => {
		expect(GAME_ID).toBe('escape-mmi1-v2');
		expect(SNAPSHOT_INTERVAL_MS).toBe(2000);
	});
});
