import { expect, test, type Page } from '@playwright/test';
import { act, clientIdOf, openPost, resetGame, MJ_COOKIE } from './helpers';

const BASE = 'http://localhost:4173';

// TIME_SCALE=0.05 côté serveur : validation ~1 s, bascule ~4,5 s.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ request }) => {
	await resetGame(request);
});

async function openProjector(browser: import('@playwright/test').Browser): Promise<Page> {
	const context = await browser.newContext({ baseURL: BASE });
	const page = await context.newPage();
	await page.goto('/projector');
	return page;
}

test('intro : lancement MJ, phase intro au projecteur, fin d’intro → phase 1', async ({
	browser,
	request
}) => {
	const projector = await openProjector(browser);
	await act(request, { type: 'mj/startIntro' });
	await expect(projector.locator('video')).toBeVisible();

	await act(request, { type: 'projector/introEnded' });
	const state = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();
	expect(state.phase).toBe('phase1');
	expect(state.chrono.running).toBe(true);
	await projector.context().close();
});

test('bascule complète : triche 3 cadenas → VALIDER → vague sur tous les postes', async ({
	browser,
	request
}) => {
	// 4 postes actifs (le design tient à 10 ; 4 suffisent pour la vague en CI locale)
	const posts = [] as Page[];
	for (let i = 0; i < 4; i++) posts.push(await openPost(browser, BASE));
	const projector = await openProjector(browser);

	const reseauId = await clientIdOf(posts[0]);
	await act(request, { type: 'mj/assignRole', clientId: reseauId, role: 'reseau' });
	await act(request, { type: 'mj/startPhase1' });

	for (const lock of ['alpha', 'beta', 'gamma']) {
		await act(request, { type: 'mj/cheatOpenLock', lock });
	}

	// Le projecteur annonce la validation disponible, le poste RÉSEAU montre VALIDER
	await expect(projector.getByTestId('finale-banner')).toBeVisible();
	await expect(posts[0].getByTestId('valider-btn')).toBeVisible();
	await posts[0].getByTestId('valider-btn').click();

	// Séquence (~1 s) puis bascule : tous les postes passent en data-phase=2
	for (const post of posts) {
		await expect(post.getByTestId('game-root')).toHaveAttribute('data-phase', '2', {
			timeout: 15_000
		});
		await expect(post.locator('h1')).toContainText('CONFINEMENT');
	}

	// L'audio ne sort que du projecteur
	const projectorPlaying = await projector.evaluate(() => {
		const el = document.querySelector<HTMLAudioElement>('[data-testid="projector-audio"]');
		return el ? !el.paused : false;
	});
	expect(projectorPlaying).toBe(true);
	for (const post of posts) {
		const anyPlaying = await post.evaluate(() =>
			[...document.querySelectorAll('audio')].some((a) => !a.paused)
		);
		expect(anyPlaying).toBe(false);
	}

	for (const p of [...posts, projector]) await p.context().close();
});

test('un poste qui se connecte après la bascule s’installe en phase 2 sans glitch', async ({
	browser,
	request
}) => {
	await act(request, { type: 'mj/startPhase1' });
	for (const lock of ['alpha', 'beta', 'gamma']) {
		await act(request, { type: 'mj/cheatOpenLock', lock });
	}
	await act(request, { type: 'reseau/validate' });
	// attend l'entrée effective en bascule (~1 s scalé)
	await expect
		.poll(
			async () => {
				const s = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();
				return s.phase;
			},
			{ timeout: 10_000 }
		)
		.toBe('bascule');

	const late = await openPost(browser, BASE);
	await expect(late.getByTestId('game-root')).toHaveAttribute('data-phase', '2');
	await expect(late.getByTestId('bascule-glitch')).toHaveAttribute('data-active', 'false');
	await late.context().close();
});

test('reset : retour à l’état initial en moins de 5 s', async ({ request }) => {
	await act(request, { type: 'mj/startPhase1' });
	for (const lock of ['alpha', 'beta', 'gamma']) {
		await act(request, { type: 'mj/cheatOpenLock', lock });
	}
	const t0 = Date.now();
	await resetGame(request);
	const state = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();
	expect(Date.now() - t0).toBeLessThan(5_000);
	expect(state.phase).toBe('idle');
	expect(state.locks).toEqual({ alpha: 'locked', beta: 'locked', gamma: 'locked' });
	expect(state.finale).toBe('none');
	expect(state.ending).toBeNull();
	expect(state.basculeAt).toBeNull();
	for (const t of Object.values(state.tasks) as { solved: boolean }[]) {
		expect(t.solved).toBe(false);
	}
});

test('le projecteur affiche les cadenas et leurs chaînes en phase 1', async ({
	browser,
	request
}) => {
	const projector = await openProjector(browser);
	await act(request, { type: 'mj/startPhase1' });

	for (const lock of ['alpha', 'beta', 'gamma']) {
		await expect(projector.getByTestId(`lock-${lock}`)).toHaveAttribute('data-status', 'locked');
	}
	await act(request, { type: 'mj/cheatOpenLock', lock: 'beta' });
	await expect(projector.getByTestId('lock-beta')).toHaveAttribute('data-status', 'open');

	// La soupape MJ révèle une valeur de segment au projecteur
	await act(request, { type: 'mj/revealSegment', port: 'C' });
	await expect(projector.locator('body')).toContainText(/PORT C\s*:\s*F/i);
	await projector.context().close();
});
