import { describe, expect, it } from 'vitest';
import { Game, initialPublicState, initialSalle } from './state';

/** Horloge contrôlée pour les tests. */
function makeGame(startAt = 1_000_000) {
	let now = startAt;
	const game = new Game({ now: () => now });
	return { game, tick: (ms: number) => (now += ms), nowValue: () => now };
}

describe('enregistrement des postes', () => {
	it('attribue des numéros croissants et est idempotent', () => {
		const { game } = makeGame();
		expect(game.register('a')).toBe(1);
		expect(game.register('b')).toBe(2);
		expect(game.register('a')).toBe(1);
		expect(Object.keys(game.state.posts)).toHaveLength(2);
	});

	it('réattribue le rôle du plan de salle à la reconnexion', () => {
		const { game } = makeGame();
		game.register('a');
		game.apply({ type: 'mj/assignRole', clientId: 'a', role: 'reseau' });
		// Nouvelle instance (redémarrage serveur) avec la même salle
		const game2 = new Game({ salle: game.salle });
		game2.register('a');
		expect(game2.state.posts['a'].role).toBe('reseau');
	});
});

describe('assignation des rôles', () => {
	it('assigne un rôle nommément et le mémorise dans le plan', () => {
		const { game } = makeGame();
		game.register('a');
		const res = game.apply({ type: 'mj/assignRole', clientId: 'a', role: 'dev' });
		expect(res.ok).toBe(true);
		expect(game.state.posts['a'].role).toBe('dev');
		expect(game.salle.plan[1]).toBe('dev');
	});

	it('distribue les rôles libres aux postes activés dans l’ordre des numéros', () => {
		const { game } = makeGame();
		for (const id of ['a', 'b', 'c']) {
			game.register(id);
			game.apply({ type: 'post/activate', clientId: id });
		}
		game.apply({ type: 'mj/distributeRoles' });
		expect(game.state.posts['a'].role).toBe('dev');
		expect(game.state.posts['b'].role).toBe('image');
		expect(game.state.posts['c'].role).toBe('systeme');
	});

	it('la distribution respecte le plan de salle enregistré', () => {
		const { game } = makeGame();
		game.register('a');
		game.salle.plan[1] = 'scan';
		game.apply({ type: 'post/activate', clientId: 'a' });
		game.apply({ type: 'mj/distributeRoles' });
		expect(game.state.posts['a'].role).toBe('scan');
	});

	it('ne distribue pas aux postes non activés', () => {
		const { game } = makeGame();
		game.register('a');
		game.apply({ type: 'mj/distributeRoles' });
		expect(game.state.posts['a'].role).toBeNull();
	});
});

describe('transitions de phase', () => {
	it('idle → phase1 démarre le chrono', () => {
		const { game, tick } = makeGame();
		game.apply({ type: 'mj/startPhase1' });
		expect(game.state.phase).toBe('phase1');
		expect(game.state.chrono.running).toBe(true);
		tick(5_000);
		expect(game.elapsedMs()).toBe(5_000);
	});

	it('refuse phase1 depuis phase2', () => {
		const { game } = makeGame();
		game.apply({ type: 'mj/startPhase1' });
		game.bascule();
		const res = game.apply({ type: 'mj/startPhase1' });
		expect(res.ok).toBe(false);
	});
});

describe('cadenas et validation finale', () => {
	it('3 cadenas ouverts → validation disponible', () => {
		const { game } = makeGame();
		game.apply({ type: 'mj/cheatOpenLock', lock: 'alpha' });
		game.apply({ type: 'mj/cheatOpenLock', lock: 'beta' });
		expect(game.state.finale).toBe('none');
		game.apply({ type: 'mj/cheatOpenLock', lock: 'gamma' });
		expect(game.state.finale).toBe('available');
	});
});

describe('bascule', () => {
	it('étale les délais dans la fenêtre, de façon déterministe', () => {
		const { game } = makeGame();
		for (const id of ['a', 'b', 'c']) game.register(id);
		game.bascule();
		const delays = Object.values(game.state.basculeDelays);
		expect(delays).toHaveLength(3);
		for (const d of delays) {
			expect(d).toBeGreaterThanOrEqual(0);
			expect(d).toBeLessThan(2_500);
		}
		// Déterminisme : une seconde bascule produit les mêmes délais
		const again = { ...game.state.basculeDelays };
		game.bascule();
		expect(game.state.basculeDelays).toEqual(again);
	});
});

describe('chrono', () => {
	it('pause fige le temps écoulé', () => {
		const { game, tick } = makeGame();
		game.apply({ type: 'mj/chronoStart' });
		tick(10_000);
		game.apply({ type: 'mj/chronoPause' });
		tick(60_000);
		expect(game.elapsedMs()).toBe(10_000);
	});

	it('chronoAdd ajuste la durée sans passer sous 1 min', () => {
		const { game } = makeGame();
		game.apply({ type: 'mj/chronoAdd', ms: -29 * 60_000 });
		expect(game.state.chrono.durationMs).toBe(60_000);
	});
});

describe('reset', () => {
	it('restaure l’état initial en conservant numéros, plan et seq monotone', () => {
		const { game, nowValue } = makeGame();
		game.register('a');
		game.apply({ type: 'mj/assignRole', clientId: 'a', role: 'reseau' });
		game.apply({ type: 'post/activate', clientId: 'a' });
		game.apply({ type: 'mj/startPhase1' });
		game.apply({ type: 'mj/cheatOpenLock', lock: 'alpha' });
		const seqBefore = game.state.seq;

		game.apply({ type: 'mj/reset' });

		const reference = initialPublicState(nowValue());
		expect(game.state.phase).toBe(reference.phase);
		expect(game.state.locks).toEqual(reference.locks);
		expect(game.state.tasks).toEqual(reference.tasks);
		expect(game.state.finale).toBe('none');
		expect(game.state.seq).toBeGreaterThan(seqBefore);
		// Le poste garde son numéro et son rôle planifié, mais plus son activation
		expect(game.state.posts['a']).toMatchObject({ number: 1, role: 'reseau', activated: false });
	});
});

describe('snapshot / restore', () => {
	it('un jeu restauré depuis toJSON() est identique', () => {
		const { game } = makeGame();
		game.register('a');
		game.apply({ type: 'mj/startPhase1' });
		const raw = JSON.parse(JSON.stringify(game.toJSON()));
		const restored = new Game({ state: raw.state, salle: raw.salle });
		expect(restored.state).toEqual(game.state);
		expect(restored.salle).toEqual(game.salle);
	});
});

describe('notifications', () => {
	it('chaque mutation incrémente seq et notifie les abonnés', () => {
		const { game } = makeGame();
		const seqs: number[] = [];
		game.subscribe((s) => seqs.push(s.seq));
		game.register('a');
		game.apply({ type: 'post/activate', clientId: 'a' });
		game.apply({ type: 'mj/setCalmMode', on: true });
		expect(seqs.length).toBe(3);
		expect([...seqs]).toEqual([...seqs].sort((x, y) => x - y));
	});
});

describe('salle initiale', () => {
	it('est vide', () => {
		expect(initialSalle()).toEqual({ registry: {}, plan: {}, history: [] });
	});
});
