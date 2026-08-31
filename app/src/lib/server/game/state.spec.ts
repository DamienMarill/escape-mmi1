import { describe, expect, it } from 'vitest';
import { exfilProgress } from '$lib/exfil';
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
		game.setConnected('a', true);
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

describe('ménage des postes fantômes', () => {
	it('le reset purge les postes déconnectés (registre compris)', () => {
		const { game } = makeGame();
		game.register('vivant');
		game.setConnected('vivant', true);
		game.register('fantome-1');
		game.register('fantome-2');
		expect(Object.keys(game.state.posts)).toHaveLength(3);

		game.apply({ type: 'mj/reset' });

		expect(Object.keys(game.state.posts)).toEqual(['vivant']);
		expect(game.salle.registry['fantome-1']).toBeUndefined();
		expect(game.salle.registry['fantome-2']).toBeUndefined();
		expect(game.salle.registry['vivant']).toBe(1);
	});

	it('mj/forgetPost retire un poste déconnecté, refuse un poste connecté', () => {
		const { game } = makeGame();
		game.register('a');
		game.register('b');
		game.setConnected('a', true);

		const refused = game.apply({ type: 'mj/forgetPost', clientId: 'a' });
		expect(refused.ok).toBe(false);

		const res = game.apply({ type: 'mj/forgetPost', clientId: 'b' });
		expect(res.ok).toBe(true);
		expect(game.state.posts['b']).toBeUndefined();
		expect(game.salle.registry['b']).toBeUndefined();
	});

	it('un numéro libéré est réattribué, avec le rôle du plan de salle', () => {
		const { game } = makeGame();
		game.register('ancien'); // numéro 1
		game.register('autre'); // numéro 2
		game.setConnected('autre', true);
		game.apply({ type: 'mj/assignRole', clientId: 'ancien', role: 'dev' });

		game.apply({ type: 'mj/forgetPost', clientId: 'ancien' });

		// La machine de remplacement reprend le numéro 1 et hérite du rôle 'dev'
		expect(game.register('remplacant')).toBe(1);
		expect(game.state.posts['remplacant'].role).toBe('dev');
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

describe('séquence de validation finale et bascule', () => {
	function openAll(game: Game) {
		game.apply({ type: 'mj/cheatOpenLock', lock: 'alpha' });
		game.apply({ type: 'mj/cheatOpenLock', lock: 'beta' });
		game.apply({ type: 'mj/cheatOpenLock', lock: 'gamma' });
	}

	it('refuse la validation tant que les 3 cadenas ne sont pas ouverts', () => {
		const { game } = makeGame();
		const res = game.apply({ type: 'reseau/validate' });
		expect(res.ok).toBe(false);
	});

	it('VALIDER → séquence (20 s) → bascule → (90 s) → phase 2', () => {
		const { game, tick } = makeGame();
		game.register('a');
		game.apply({ type: 'mj/startPhase1' });
		openAll(game);
		game.apply({ type: 'reseau/validate' });
		expect(game.state.finale).toBe('validating');

		tick(19_000);
		game.tick();
		expect(game.state.phase).toBe('phase1');

		tick(1_500);
		game.tick();
		expect(game.state.phase).toBe('bascule');
		expect(game.state.finale).toBe('done');
		expect(Object.keys(game.state.basculeDelays)).toContain('a');

		tick(89_000);
		game.tick();
		expect(game.state.phase).toBe('bascule');

		tick(2_000);
		game.tick();
		expect(game.state.phase).toBe('phase2');
		expect(game.state.exfil).not.toBeNull();
	});

	it('intro : mj/startIntro puis projector/introEnded démarre la phase 1', () => {
		const { game } = makeGame();
		game.apply({ type: 'mj/startIntro' });
		expect(game.state.phase).toBe('intro');
		game.apply({ type: 'projector/introEnded' });
		expect(game.state.phase).toBe('phase1');
		expect(game.state.chrono.running).toBe(true);
	});
});

describe('phase 2 : transfert sortant et Fin C', () => {
	function toPhase2(startAt = 1_000_000) {
		let now = startAt;
		const game = new Game({ now: () => now });
		const tick = (ms: number) => (now += ms);
		game.apply({ type: 'mj/startPhase1' });
		// 15 min de phase 1 écoulées sur 30 min
		tick(15 * 60_000);
		game.apply({ type: 'mj/cheatOpenLock', lock: 'alpha' });
		game.apply({ type: 'mj/cheatOpenLock', lock: 'beta' });
		game.apply({ type: 'mj/cheatOpenLock', lock: 'gamma' });
		game.apply({ type: 'reseau/validate' });
		tick(20_000);
		game.tick(); // bascule
		tick(90_000);
		game.tick(); // phase2
		return { game, tick };
	}

	it('démarre le transfert à l’entrée en phase 2 et progresse avec le temps de jeu', () => {
		const { game, tick } = toPhase2();
		expect(game.state.phase).toBe('phase2');
		const exfil = game.state.exfil!;
		expect(exfil).not.toBeNull();
		expect(exfil.frozenAtMs).toBeNull();
		expect(exfilProgress(exfil, game.elapsedMs())).toBe(0);

		// le transfert couvre exactement le temps restant de la session
		expect(exfil.durationMs).toBe(game.state.chrono.durationMs - exfil.startedAtMs);

		tick(exfil.durationMs / 2);
		game.tick();
		expect(exfilProgress(exfil, game.elapsedMs())).toBeCloseTo(0.5, 2);
		expect(game.state.ending).toBeNull();
		expect(game.state.locks.gamma).toBe('open'); // rien ne se referme plus
	});

	it('la Fin C tombe quand le transfert atteint 100 %', () => {
		const { game, tick } = toPhase2();
		tick(20 * 60_000);
		game.tick();
		expect(game.state.ending).toBe('C');
		expect(game.state.phase).toBe('epilogue');
		expect(game.salle.history).toHaveLength(1);
		expect(game.salle.history[0].ending).toBe('C');
	});

	it('chrono en pause : la progression ne bouge pas (bug de la pause corrigé)', () => {
		const { game, tick } = toPhase2();
		const exfil = game.state.exfil!;
		const before = exfilProgress(exfil, game.elapsedMs());
		game.apply({ type: 'mj/chronoPause' });
		tick(10 * 60_000);
		game.tick();
		expect(game.state.ending).toBeNull();
		expect(exfilProgress(exfil, game.elapsedMs())).toBe(before);
	});

	it('une fin déjà posée empêche la Fin C', () => {
		const { game, tick } = toPhase2();
		game.endGame('B', 'test');
		tick(20 * 60_000);
		game.tick();
		expect(game.state.ending).toBe('B');
		expect(game.salle.history.map((h) => h.ending)).toEqual(['B']);
	});
});

describe('révélation de segment', () => {
	it('publie la valeur du segment uniquement après révélation MJ', () => {
		const { game } = makeGame();
		expect(game.state.revealedSegments.C).toBeUndefined();
		game.apply({ type: 'mj/revealSegment', port: 'C' });
		expect(game.state.revealedSegments.C).toBe('F');
		expect(game.state.revealedPorts).toContain('C');
	});
});

describe('salle initiale', () => {
	it('est vide', () => {
		expect(initialSalle()).toEqual({ registry: {}, plan: {}, history: [] });
	});
});
