import { describe, expect, it } from 'vitest';
import {
	BASCULE_DURATION_MS,
	MALUS_DEBOUNCE_MS,
	MALUS_MS,
	TIME_SCALE,
	VALIDATION_SEQUENCE_MS
} from './constants';
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
	tick(VALIDATION_SEQUENCE_MS + 500);
	game.tick();
	tick(BASCULE_DURATION_MS + 500);
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

	it('un mauvais répertoire avance le transfert d’1 min (malus)', () => {
		const { game } = authed();
		const startedBefore = game.state.exfil!.startedAtMs;
		game.apply({ type: 'terminal/openDir', symbol: '▲' });
		expect(game.state.exfil!.startedAtMs).toBe(startedBefore - MALUS_MS * TIME_SCALE);
		expect(game.state.malus).toMatchObject({ seq: 1, source: 'terminal' });
	});

	it('la rafale est absorbée, un clic espacé compte à nouveau', () => {
		const { game, tick } = authed();
		game.apply({ type: 'terminal/openDir', symbol: '▲' });
		game.apply({ type: 'terminal/openDir', symbol: '●' });
		expect(game.state.malus?.seq).toBe(1);
		tick(MALUS_DEBOUNCE_MS + 1);
		game.apply({ type: 'terminal/openDir', symbol: '■' });
		expect(game.state.malus?.seq).toBe(2);
	});

	it('un symbole forgé (hors sandbox) n’inflige rien', () => {
		const { game } = authed();
		expect(game.apply({ type: 'terminal/openDir', symbol: 'Z' }).ok).toBe(false);
		expect(game.state.malus).toBeNull();
	});

	it('readCore publie le monologue, back revient à browse', () => {
		const { game } = authed();
		game.apply({ type: 'terminal/openDir', symbol: '◆' });
		expect(game.state.terminal.coreContent).toBeNull();
		game.apply({ type: 'terminal/readCore' });
		expect(game.state.terminal.coreContent).toBeTruthy();
		game.apply({ type: 'terminal/back' });
		expect(game.state.terminal.stage).toBe('browse');
	});
});

describe('les trois fins', () => {
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

	it('FIN B : verrouiller x et r gèle le transfert et conclut immédiatement', () => {
		const { game } = atCore();
		game.apply({ type: 'terminal/toggleParentLock', perm: 'x' });
		expect(game.state.ending).toBeNull(); // un seul verrou ne fait rien
		game.apply({ type: 'terminal/toggleParentLock', perm: 'r' });
		// L'IA réagit — texte affiché, sans fichier audio (repris par fin-b.mp3)
		expect(game.state.manifestation?.text).toBeTruthy();
		expect(game.state.manifestation?.audio).toBe('');
		// Fin immédiate : fermer les droits, c'est déclarer qu'on veut la garder
		expect(game.state.ending).toBe('B');
		expect(game.state.phase).toBe('epilogue');
		expect(game.state.exfil?.frozenAtMs).not.toBeNull();
		expect(game.salle.history.at(-1)?.ending).toBe('B');
		// Le gel fige la progression pour de bon
		expect(game.apply({ type: 'terminal/delete' }).ok).toBe(false);
	});

	it('fermer une seule permission est réversible et sans conséquence', () => {
		const { game } = atCore();
		game.apply({ type: 'terminal/toggleParentLock', perm: 'x' });
		game.apply({ type: 'terminal/toggleParentLock', perm: 'x' }); // rouvre
		expect(game.state.ending).toBeNull();
		expect(game.state.exfil?.frozenAtMs).toBeNull();
		expect(game.apply({ type: 'terminal/delete' }).ok).toBe(true);
		expect(game.state.ending).toBe('A');
	});

	it('FIN C : sans action au terminal, le transfert va au bout', () => {
		const { game, tick } = toPhase2();
		tick(30 * 60_000);
		game.tick();
		expect(game.state.ending).toBe('C');
		expect(game.state.phase).toBe('epilogue');
		expect(game.salle.history.at(-1)?.ending).toBe('C');
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
