import { describe, expect, it } from 'vitest';
import { REQUIRED_LOCKS } from '$lib/systeme-data';
import { Game } from './state';

function makeGame() {
	let now = 1_000_000;
	const game = new Game({ now: () => now });
	game.apply({ type: 'mj/startPhase1' });
	return { game, tick: (ms: number) => (now += ms) };
}

function solveTask(
	game: Game,
	task: 'compilation' | 'memoire' | 'brassage' | 'parite' | 'synchro' | 'scan'
) {
	const payloads: Record<string, unknown> = {
		compilation: { clicks: [4, 9, 2] },
		memoire: { placed: ['seg-a', 'seg-b', 'seg-c', 'seg-d', 'seg-e'] },
		brassage: { connections: { 1: 'D', 2: 'A', 3: 'F', 4: 'B', 5: 'E', 6: 'C' } },
		parite: { row: 5 },
		synchro: { offset: 7 },
		scan: { machine: 'B14-SRV-01' }
	};
	const res = game.apply({ type: 'task/submit', task, payload: payloads[task] });
	expect(res.ok).toBe(true);
}

describe('épreuve DEV', () => {
	it('refuse les blocs verrouillés tant que leurs tâches ne sont pas résolues', () => {
		const { game } = makeGame();
		const res = game.apply({
			type: 'dev/submit',
			program: ['repete-avance', 'si-mur-tourne']
		});
		expect(res.ok).toBe(false);
	});

	it('solution correcte avec blocs débloqués → cadenas α', () => {
		const { game } = makeGame();
		solveTask(game, 'compilation');
		solveTask(game, 'memoire');
		const res = game.apply({
			type: 'dev/submit',
			program: ['repete-avance', 'si-mur-tourne']
		});
		expect(res.ok).toBe(true);
		expect(game.state.epreuves.dev.solved).toBe(true);
		expect(game.state.locks.alpha).toBe('open');
	});

	it('3 échecs consécutifs → message « séquence trop coûteuse »', () => {
		const { game } = makeGame();
		solveTask(game, 'compilation');
		solveTask(game, 'memoire');
		let last = '';
		for (let i = 0; i < 3; i++) {
			const res = game.apply({ type: 'dev/submit', program: ['avance', 'si-mur-tourne'] });
			expect(res.ok).toBe(false);
			if (!res.ok) last = res.error;
		}
		expect(last).toContain('trop coûteuse');
		// Une réussite remet le compteur à zéro
		game.apply({ type: 'dev/submit', program: ['repete-avance', 'si-mur-tourne'] });
		expect(game.state.devFails).toBe(0);
	});
});

describe('épreuve IMAGE', () => {
	it('refuse les opérations verrouillées sans leurs tâches', () => {
		const { game } = makeGame();
		const res = game.apply({
			type: 'image/submit',
			ops: ['superposition', 'negatif', 'contraste']
		});
		expect(res.ok).toBe(false);
	});

	it('la séquence correcte restaure, une séquence désordonnée non', () => {
		const { game } = makeGame();
		solveTask(game, 'scan');
		solveTask(game, 'synchro');
		const bad = game.apply({
			type: 'image/submit',
			ops: ['negatif', 'superposition', 'contraste']
		});
		expect(bad.ok).toBe(false);
		const good = game.apply({
			type: 'image/submit',
			ops: ['superposition', 'negatif', 'contraste']
		});
		expect(good.ok).toBe(true);
		expect(game.state.epreuves.image.solved).toBe(true);
		// IMAGE ne porte pas de cadenas — elle est le premier étage de β
		expect(game.state.locks.beta).toBe('locked');
	});

	it('la luminosité dans la séquence fait échouer (piège)', () => {
		const { game } = makeGame();
		solveTask(game, 'scan');
		solveTask(game, 'synchro');
		const res = game.apply({
			type: 'image/submit',
			ops: ['luminosite', 'superposition', 'negatif', 'contraste']
		});
		expect(res.ok).toBe(false);
	});
});

describe('épreuve SYSTÈME', () => {
	it('quota de base 2, +1 par tâche BRASSAGE/PARITÉ', () => {
		const { game } = makeGame();
		expect(game.apply({ type: 'systeme/toggle', lock: 'x:archives' }).ok).toBe(true);
		expect(game.apply({ type: 'systeme/toggle', lock: 'x:archives/sessions' }).ok).toBe(true);
		// 3e verrou refusé à quota 2
		const refused = game.apply({ type: 'systeme/toggle', lock: 'r:archives/sessions' });
		expect(refused.ok).toBe(false);

		solveTask(game, 'brassage');
		expect(game.apply({ type: 'systeme/toggle', lock: 'r:archives/sessions' }).ok).toBe(true);
		solveTask(game, 'parite');
		expect(
			game.apply({ type: 'systeme/toggle', lock: 'r:archives/sessions/eval_mmi1.dat' }).ok
		).toBe(true);
	});

	it('refermer un verrou libère le quota', () => {
		const { game } = makeGame();
		game.apply({ type: 'systeme/toggle', lock: 'x:archives' });
		game.apply({ type: 'systeme/toggle', lock: 'x:systeme' });
		expect(game.apply({ type: 'systeme/toggle', lock: 'r:public' }).ok).toBe(false);
		game.apply({ type: 'systeme/toggle', lock: 'x:systeme' }); // referme
		expect(game.apply({ type: 'systeme/toggle', lock: 'r:public' }).ok).toBe(true);
	});

	it('la configuration exacte ouvre la cible → cadenas β', () => {
		const { game } = makeGame();
		solveTask(game, 'brassage');
		solveTask(game, 'parite');
		// Mauvaise config d'abord
		game.apply({ type: 'systeme/toggle', lock: 'x:archives' });
		game.apply({ type: 'systeme/toggle', lock: 'r:archives' });
		expect(game.apply({ type: 'systeme/openTarget' }).ok).toBe(false);
		game.apply({ type: 'systeme/toggle', lock: 'r:archives' }); // referme

		for (const lock of REQUIRED_LOCKS) {
			if (!game.state.systeme.locks.includes(lock)) {
				expect(game.apply({ type: 'systeme/toggle', lock }).ok).toBe(true);
			}
		}
		expect(game.apply({ type: 'systeme/openTarget' }).ok).toBe(true);
		expect(game.state.locks.beta).toBe('open');
	});
});

describe('chaîne complète phase 1 → finale disponible', () => {
	it('6 tâches + 4 épreuves → 3 cadenas → finale', () => {
		const { game } = makeGame();
		for (const t of ['compilation', 'memoire', 'brassage', 'parite', 'synchro', 'scan'] as const) {
			solveTask(game, t);
		}
		game.apply({ type: 'dev/submit', program: ['repete-avance', 'si-mur-tourne'] });
		game.apply({ type: 'image/submit', ops: ['superposition', 'negatif', 'contraste'] });
		for (const lock of REQUIRED_LOCKS) game.apply({ type: 'systeme/toggle', lock });
		game.apply({ type: 'systeme/openTarget' });
		for (const [port, value] of Object.entries({
			D: 'NULL',
			A: 'RELAY',
			F: 'MIRROR',
			B: 'BUFFER',
			E: 'ANYCAST',
			C: 'BROADCAST'
		})) {
			game.apply({ type: 'reseau/setEntry', port: port as 'A', value });
		}
		game.apply({ type: 'reseau/submit' });

		expect(game.state.locks).toEqual({ alpha: 'open', beta: 'open', gamma: 'open' });
		expect(game.state.finale).toBe('available');
	});
});
