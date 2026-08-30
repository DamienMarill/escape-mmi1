import { describe, expect, it } from 'vitest';
import { simulate, type BlockId } from './dev-sim';

describe('simulateur DEV', () => {
	it('la solution nominale [RÉPÈTE, SI MUR] atteint la cible dans le budget', () => {
		const r = simulate(['repete-avance', 'si-mur-tourne']);
		expect(r.success).toBe(true);
		expect(r.ticksUsed).toBeLessThanOrEqual(10);
	});

	it('les variantes utilisant les deux blocs débloqués fonctionnent aussi', () => {
		expect(simulate(['repete-avance', 'avance', 'si-mur-tourne']).success).toBe(true);
		expect(simulate(['repete-avance', 'repete-avance', 'si-mur-tourne']).success).toBe(true);
	});

	it('IMPOSSIBLE sans RÉPÈTE ×3 (budget d’énergie insuffisant)', () => {
		const programs: BlockId[][] = [
			['avance', 'si-mur-tourne'],
			['avance', 'avance', 'si-mur-tourne'],
			['avance', 'tourne'],
			['avance', 'avance', 'tourne']
		];
		for (const p of programs) {
			const r = simulate(p);
			expect(r.success, `programme ${p.join(',')} ne devrait pas réussir`).toBe(false);
		}
	});

	it('IMPOSSIBLE sans SI MUR (tourner au rythme rate les virages)', () => {
		const programs: BlockId[][] = [
			['repete-avance', 'tourne'],
			['repete-avance', 'repete-avance', 'tourne'],
			['repete-avance', 'tourne', 'repete-avance'],
			['tourne', 'repete-avance'],
			['repete-avance', 'tourne', 'tourne'],
			['repete-avance', 'tourne', 'avance'],
			['repete-avance', 'avance', 'tourne'],
			['avance', 'repete-avance', 'tourne']
		];
		for (const p of programs) {
			const r = simulate(p);
			expect(r.success, `programme ${p.join(',')} ne devrait pas réussir`).toBe(false);
		}
	});

	it('EXHAUSTIF : aucun programme sans les deux blocs verrouillés ne réussit', () => {
		// Tous les programmes de 1 à 3 slots sur la palette de base + un seul des deux blocs
		const pools: BlockId[][] = [
			['avance', 'tourne'], // aucun bloc débloqué
			['avance', 'tourne', 'repete-avance'], // sans SI MUR
			['avance', 'tourne', 'si-mur-tourne'] // sans RÉPÈTE
		];
		for (const pool of pools) {
			const all: BlockId[][] = [];
			for (const a of pool) {
				all.push([a]);
				for (const b of pool) {
					all.push([a, b]);
					for (const c of pool) all.push([a, b, c]);
				}
			}
			for (const p of all) {
				expect(simulate(p).success, `programme ${p.join(',')} (pool sans bloc requis)`).toBe(false);
			}
		}
	});

	it('programme vide ou trop long → échec', () => {
		expect(simulate([]).success).toBe(false);
		expect(simulate(['avance', 'avance', 'avance', 'avance'] as BlockId[]).success).toBe(false);
	});

	it('boucle stérile détectée (pas de gel)', () => {
		const r = simulate(['avance']);
		// avance seule finit bloquée contre un mur → stuck ou energy, jamais infini
		expect(r.success).toBe(false);
	});
});
