import { describe, expect, it } from 'vitest';
import { COMPILATION_ERROR_INDEX, PARITE_ROWS } from '$lib/tasks-data';
import { Game } from './state';
import { validateTask } from './tasks';

describe('validateTask — validation serveur des minis', () => {
	it('COMPILATION : les 3 bonnes lignes ERROR', () => {
		expect(validateTask('compilation', { clicks: COMPILATION_ERROR_INDEX }).solved).toBe(true);
		expect(validateTask('compilation', { clicks: [0, 0, 0] }).solved).toBe(false);
		expect(validateTask('compilation', { clicks: [] }).solved).toBe(false);
		expect(validateTask('compilation', {}).solved).toBe(false);
	});

	it('MÉMOIRE : les 5 blocs placés', () => {
		expect(
			validateTask('memoire', { placed: ['seg-a', 'seg-b', 'seg-c', 'seg-d', 'seg-e'] }).solved
		).toBe(true);
		expect(validateTask('memoire', { placed: ['seg-a', 'seg-b'] }).solved).toBe(false);
		expect(validateTask('memoire', { placed: [] }).solved).toBe(false);
	});

	it('BRASSAGE : correspondance exacte du plan (1→D 2→A 3→F 4→B 5→E 6→C)', () => {
		const good = { 1: 'D', 2: 'A', 3: 'F', 4: 'B', 5: 'E', 6: 'C' };
		expect(validateTask('brassage', { connections: good }).solved).toBe(true);
		expect(validateTask('brassage', { connections: { ...good, 3: 'C', 6: 'F' } }).solved).toBe(
			false
		);
		expect(validateTask('brassage', { connections: { 1: 'D' } }).solved).toBe(false);
	});

	it('PARITÉ : seule la ligne au contrôle incohérent est acceptée', () => {
		const corrupt = PARITE_ROWS.findIndex(
			(r) => r.bits.reduce((a, b) => a + b, 0) % 2 !== r.control
		);
		expect(corrupt).toBeGreaterThanOrEqual(0);
		expect(validateTask('parite', { row: corrupt }).solved).toBe(true);
		expect(validateTask('parite', { row: (corrupt + 1) % PARITE_ROWS.length }).solved).toBe(false);
	});

	it('SYNCHRO : décalage cible ±2', () => {
		expect(validateTask('synchro', { offset: 7 }).solved).toBe(true);
		expect(validateTask('synchro', { offset: 5 }).solved).toBe(true);
		expect(validateTask('synchro', { offset: 9 }).solved).toBe(true);
		expect(validateTask('synchro', { offset: 4 }).solved).toBe(false);
		expect(validateTask('synchro', { offset: -7 }).solved).toBe(false);
	});

	it('SCAN : seule l’intruse B14-SRV-01 est acceptée', () => {
		expect(validateTask('scan', { machine: 'B14-SRV-01' }).solved).toBe(true);
		// L'autre suspecte (IP hors plage) est légitime
		expect(validateTask('scan', { machine: 'B14-PC-04' }).solved).toBe(false);
		expect(validateTask('scan', { machine: 'B14-PC-01' }).solved).toBe(false);
		expect(validateTask('scan', { machine: 'INCONNUE' }).solved).toBe(false);
	});

	it('SCAN : une machine légitime déclenche le malus, une requête forgée non', () => {
		expect(validateTask('scan', { machine: 'B14-PC-04' }).penalize).toBe(true);
		expect(validateTask('scan', { machine: 'INCONNUE' }).penalize).toBeUndefined();
	});
});

function makeGame(startAt = 1_000_000) {
	let now = startAt;
	const game = new Game({ now: () => now });
	game.apply({ type: 'mj/startPhase1' });
	return { game, tick: (ms: number) => (now += ms) };
}

describe('task/submit', () => {
	it('publie le segment uniquement après résolution', () => {
		const { game } = makeGame();
		expect(game.state.tasks.parite.segment).toBeNull();
		const res = game.apply({ type: 'task/submit', task: 'parite', payload: { row: 5 } });
		expect(res.ok).toBe(true);
		expect(game.state.tasks.parite).toEqual({ solved: true, segment: '0' });
	});

	it('refuse hors phase 1', () => {
		const game = new Game();
		const res = game.apply({ type: 'task/submit', task: 'parite', payload: { row: 5 } });
		expect(res.ok).toBe(false);
	});

	it('une mauvaise réponse ne change rien et reste rejouable', () => {
		const { game } = makeGame();
		const res = game.apply({
			type: 'task/submit',
			task: 'scan',
			payload: { machine: 'B14-PC-04' }
		});
		expect(res.ok).toBe(false);
		expect(game.state.tasks.scan.solved).toBe(false);
		const retry = game.apply({
			type: 'task/submit',
			task: 'scan',
			payload: { machine: 'B14-SRV-01' }
		});
		expect(retry.ok).toBe(true);
	});
});

describe('poste RÉSEAU', () => {
	// Réponses attendues : D→NULL(0) A→RELAY(7) F→MIRROR(C) B→BUFFER(D) E→ANYCAST(3) C→BROADCAST(F)
	const CORRECT = {
		D: 'NULL',
		A: 'RELAY',
		F: 'MIRROR',
		B: 'BUFFER',
		E: 'ANYCAST',
		C: 'BROADCAST'
	} as const;

	function fillEntries(game: Game, entries: Record<string, string>) {
		for (const [port, value] of Object.entries(entries)) {
			game.apply({ type: 'reseau/setEntry', port: port as 'A', value });
		}
	}

	it('la saisie est persistante', () => {
		const { game } = makeGame();
		game.apply({ type: 'reseau/setEntry', port: 'D', value: 'NULL' });
		game.apply({ type: 'reseau/submit' }); // incomplète → refusée
		expect(game.state.reseau.entries.D).toBe('NULL');
	});

	it('table correcte → cadenas γ ouvert', () => {
		const { game } = makeGame();
		fillEntries(game, CORRECT);
		const res = game.apply({ type: 'reseau/submit' });
		expect(res.ok).toBe(true);
		expect(game.state.locks.gamma).toBe('open');
		expect(game.state.epreuves.reseau.solved).toBe(true);
	});

	it('3 tentatives fausses → verrouillage 30 s, puis rejouable', () => {
		const { game, tick } = makeGame();
		fillEntries(game, { ...CORRECT, D: 'LOOPBACK' });
		for (let i = 0; i < 3; i++) {
			expect(game.apply({ type: 'reseau/submit' }).ok).toBe(false);
		}
		expect(game.state.reseau.lockedUntil).not.toBeNull();
		// Pendant le lockout, même une table correcte est refusée
		fillEntries(game, CORRECT);
		const locked = game.apply({ type: 'reseau/submit' });
		expect(locked.ok).toBe(false);
		expect(locked.ok === false && locked.error).toContain('RECALIBRAGE');

		tick(31_000);
		expect(game.apply({ type: 'reseau/submit' }).ok).toBe(true);
		expect(game.state.locks.gamma).toBe('open');
	});
});
