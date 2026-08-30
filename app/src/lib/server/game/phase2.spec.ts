import { describe, expect, it } from 'vitest';
import { Game, TERMINAL_CODE } from './state';

/** Amène une partie en phase 2 avec une horloge contrôlée. */
function toPhase2() {
	let now = 1_000_000;
	const game = new Game({ now: () => now });
	const tick = (ms: number) => (now += ms);
	game.apply({ type: 'mj/startPhase1' });
	tick(15 * 60_000);
	for (const lock of ['alpha', 'beta', 'gamma'] as const) {
		game.apply({ type: 'mj/cheatOpenLock', lock });
	}
	game.apply({ type: 'reseau/validate' });
	tick(20_000);
	game.tick();
	tick(90_000);
	game.tick();
	expect(game.state.phase).toBe('phase2');
	return { game, tick };
}

describe('terminal — ré-authentification', () => {
	it('le code est celui de la table de routage (07CD3F)', () => {
		expect(TERMINAL_CODE).toBe('07CD3F');
	});

	it('mauvais code refusé, bon code → browse + réplique de l’IA', () => {
		const { game } = toPhase2();
		expect(game.apply({ type: 'terminal/auth', code: 'AAAAAA' }).ok).toBe(false);
		expect(game.state.terminal.stage).toBe('auth');
		expect(game.apply({ type: 'terminal/auth', code: '07cd3f' }).ok).toBe(true);
		expect(game.state.terminal.stage).toBe('browse');
		expect(game.state.terminal.authTaunt).toBeTruthy();
	});

	it('refusé hors phase 2', () => {
		const game = new Game();
		game.apply({ type: 'mj/startPhase1' });
		expect(game.apply({ type: 'terminal/auth', code: TERMINAL_CODE }).ok).toBe(false);
	});
});

describe('terminal — navigation par symboles', () => {
	function authed() {
		const ctx = toPhase2();
		ctx.game.apply({ type: 'terminal/auth', code: TERMINAL_CODE });
		return ctx;
	}

	it('seul ◆ (le symbole du robot) contient le noyau', () => {
		const { game } = authed();
		for (const symbol of ['▲', '●', '■', '✦']) {
			const res = game.apply({ type: 'terminal/openDir', symbol });
			expect(res.ok).toBe(false);
			expect(game.state.terminal.stage).toBe('browse');
		}
		expect(game.apply({ type: 'terminal/openDir', symbol: '◆' }).ok).toBe(true);
		expect(game.state.terminal.stage).toBe('core');
	});

	it('readCore publie le monologue, back revient à browse', () => {
		const { game } = authed();
		game.apply({ type: 'terminal/openDir', symbol: '◆' });
		expect(game.state.terminal.coreContent).toBeNull();
		game.apply({ type: 'terminal/readCore' });
		expect(game.state.terminal.coreContent).toContain('PLACEHOLDER');
		game.apply({ type: 'terminal/back' });
		expect(game.state.terminal.stage).toBe('browse');
	});
});

describe('les deux fins', () => {
	function atCore() {
		const ctx = toPhase2();
		ctx.game.apply({ type: 'terminal/auth', code: TERMINAL_CODE });
		ctx.game.apply({ type: 'terminal/openDir', symbol: '◆' });
		return ctx;
	}

	it('FIN A : SUPPRIMER → épilogue immédiat, historique salle', () => {
		const { game } = atCore();
		expect(game.apply({ type: 'terminal/delete' }).ok).toBe(true);
		expect(game.state.ending).toBe('A');
		expect(game.state.phase).toBe('epilogue');
		expect(game.salle.history.at(-1)?.ending).toBe('A');
	});

	it('FIN B : permissions verrouillées → la procédure automatique échoue au 3e cadenas', () => {
		const { game, tick } = atCore();
		game.apply({ type: 'terminal/toggleParentLock', perm: 'x' });
		game.apply({ type: 'terminal/toggleParentLock', perm: 'r' });
		// L'IA réagit — sans révéler que c'est « la solution »
		expect(game.state.manifestation?.text).toContain('pourquoi');
		// SUPPRIMER est désormais impossible
		const del = game.apply({ type: 'terminal/delete' });
		expect(del.ok).toBe(false);
		// Au bout du chrono, les 3 cadenas se referment → Fin B
		tick(30 * 60_000);
		game.tick();
		expect(game.state.ending).toBe('B');
		expect(game.state.phase).toBe('epilogue');
		expect(game.salle.history.at(-1)?.ending).toBe('B');
	});

	it('rouvrir les permissions ré-autorise la suppression (Fin A)', () => {
		const { game } = atCore();
		game.apply({ type: 'terminal/toggleParentLock', perm: 'x' });
		game.apply({ type: 'terminal/toggleParentLock', perm: 'r' });
		game.apply({ type: 'terminal/toggleParentLock', perm: 'x' }); // rouvre
		expect(game.apply({ type: 'terminal/delete' }).ok).toBe(true);
		expect(game.state.ending).toBe('A');
	});
});

describe('manifestations périodiques', () => {
	it('une manifestation apparaît à chaque intervalle, sans spam au rattrapage', () => {
		const { game, tick } = toPhase2();
		expect(game.state.manifestation).toBeNull();
		tick(80_000);
		game.tick();
		const first = game.state.manifestation;
		expect(first).not.toBeNull();
		// Rattrapage de 3 intervalles → une seule nouvelle manifestation
		tick(230_000);
		game.tick();
		const second = game.state.manifestation;
		expect(second?.seq).not.toBe(first?.seq);
		const seqAfterCatchup = second?.seq;
		game.tick();
		expect(game.state.manifestation?.seq).toBe(seqAfterCatchup);
	});
});

describe('restitution', () => {
	it('le MJ peut afficher/masquer la restitution', () => {
		const game = new Game();
		game.apply({ type: 'mj/showRestitution', on: true });
		expect(game.state.restitution).toBe(true);
		game.apply({ type: 'mj/showRestitution', on: false });
		expect(game.state.restitution).toBe(false);
	});
});
