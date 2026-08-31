import { expect, test, type Page } from '@playwright/test';
import { act, clientIdOf, openPost, resetGame, MJ_COOKIE } from './helpers';

const BASE = 'http://localhost:4173';
const TERMINAL_CODE = '07CD3F';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ request }) => {
	await resetGame(request);
});

/** Amène le serveur en phase 2 (triche MJ + validation + attente des séquences scalées). */
async function toPhase2(request: import('@playwright/test').APIRequestContext) {
	await act(request, { type: 'mj/startPhase1' });
	for (const lock of ['alpha', 'beta', 'gamma']) {
		await act(request, { type: 'mj/cheatOpenLock', lock });
	}
	await act(request, { type: 'reseau/validate' });
	await expect
		.poll(
			async () => (await (await request.get('/api/state', { headers: MJ_COOKIE })).json()).phase,
			{ timeout: 20_000 }
		)
		.toBe('phase2');
}

async function authAndOpenCore(post: Page) {
	await post.getByTestId('terminal-code').fill(TERMINAL_CODE);
	await post.getByTestId('terminal-auth-btn').click();
	await expect(post.getByTestId('terminal-dir-◆')).toBeVisible();
	// Un mauvais dossier d'abord : répertoire vide, pas de navigation
	await post.getByTestId('terminal-dir-▲').click();
	await expect(post.getByTestId('terminal-delete')).not.toBeVisible();
	await post.getByTestId('terminal-dir-◆').click();
	await expect(post.getByTestId('terminal-delete')).toBeVisible();
}

test('FIN A : terminal → auth → ◆ → lecture du noyau → SUPPRIMER → épilogue partout', async ({
	browser,
	request
}) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/assignRole', clientId, role: 'compilation' });
	const witness = await openPost(browser, BASE);
	await toPhase2(request);

	await expect(post.getByTestId('terminal')).toBeVisible();
	// Mauvais code d'abord
	await post.getByTestId('terminal-code').fill('AAAAAA');
	await post.getByTestId('terminal-auth-btn').click();
	await expect(post.getByTestId('terminal-feedback')).toBeVisible();

	await authAndOpenCore(post);
	await post.getByTestId('terminal-read').click();
	await expect(post.getByTestId('terminal-core-content')).toBeVisible();

	await post.getByTestId('terminal-delete').click();
	await expect(post.getByTestId('epilogue-screen')).toHaveAttribute('data-ending', 'A');
	await expect(witness.getByTestId('epilogue-screen')).toHaveAttribute('data-ending', 'A');

	await post.context().close();
	await witness.context().close();
});

test('FIN B : verrouiller x et r gèle le transfert et conclut immédiatement', async ({
	browser,
	request
}) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/assignRole', clientId, role: 'compilation' });
	const projCtx = await browser.newContext({ baseURL: BASE });
	const projector = await projCtx.newPage();
	await projector.goto('/projector');
	await toPhase2(request);

	await expect(projector.getByTestId('exfil-panel')).toBeVisible();
	// Le symbole du répertoire n'est pas révélé avant l'ouverture du dossier
	await expect(projector.getByTestId('exfil-panel')).not.toContainText('◆');

	await authAndOpenCore(post);
	await expect(projector.getByTestId('exfil-panel')).toContainText('/sandbox/◆/noyau.core');

	// Fermer un seul verrou ne conclut pas
	await post.getByTestId('parent-lock-x').click();
	await expect(post.getByTestId('terminal-delete')).toBeVisible();

	// Le second verrou déclenche la Fin B dans le même cycle
	await post.getByTestId('parent-lock-r').click();
	await expect(post.getByTestId('epilogue-screen')).toHaveAttribute('data-ending', 'B');

	const state = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();
	expect(state.sessionHistory.at(-1).ending).toBe('B');
	expect(state.exfil.frozenAtMs).not.toBeNull();
	await post.context().close();
	await projCtx.close();
});

test('FIN C : sans action au terminal, le transfert va au bout', async ({ browser, request }) => {
	test.setTimeout(240_000); // le transfert scalé ×0.05 dure ~90 s
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/assignRole', clientId, role: 'compilation' });
	await toPhase2(request);

	await expect(post.getByTestId('epilogue-screen')).toHaveAttribute('data-ending', 'C', {
		timeout: 150_000
	});
	const state = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();
	expect(state.sessionHistory.at(-1).ending).toBe('C');
	await post.context().close();
});

test('les trois états visuels de la phase 2 : persistant, recyclé, ambiance', async ({
	browser,
	request
}) => {
	const persistant = await openPost(browser, BASE);
	const recycle = await openPost(browser, BASE);
	const ambiance = await openPost(browser, BASE);
	await act(request, {
		type: 'mj/assignRole',
		clientId: await clientIdOf(persistant),
		role: 'reseau'
	});
	await act(request, {
		type: 'mj/assignRole',
		clientId: await clientIdOf(recycle),
		role: 'memoire'
	});
	await act(request, {
		type: 'mj/assignRole',
		clientId: await clientIdOf(ambiance),
		role: 'synchro'
	});
	await toPhase2(request);

	// PERSISTANT : le poste RÉSEAU garde sa table (documents encore affichés)
	await expect(persistant.getByTestId('epreuve-reseau')).toBeVisible();
	// RECYCLÉ : MÉMOIRE devient le document maintenance.log
	await expect(recycle.getByTestId('phase2-doc-maintenance.log')).toBeVisible();
	// AMBIANCE : SYNCHRO affiche le fragment du monologue
	await expect(ambiance.getByTestId('phase2-ambiance-synchro')).toBeVisible();

	for (const p of [persistant, recycle, ambiance]) await p.context().close();
});

test('reconnexion d’un poste en phase 2 : il retrouve son écran directement', async ({
	browser,
	request
}) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/assignRole', clientId, role: 'brassage' });
	await toPhase2(request);
	await expect(post.getByTestId('phase2-doc-RE_RE_budget_infra.eml')).toBeVisible();

	await post.reload();
	await expect(post.getByTestId('phase2-doc-RE_RE_budget_infra.eml')).toBeVisible();
	await expect(post.getByTestId('game-root')).toHaveAttribute('data-phase', '2');
	await post.context().close();
});

test('restitution : le MJ l’affiche au projecteur après une fin', async ({ browser, request }) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/assignRole', clientId, role: 'compilation' });
	const projCtx = await browser.newContext({ baseURL: BASE });
	const projector = await projCtx.newPage();
	await projector.goto('/projector');
	await toPhase2(request);

	await authAndOpenCore(post);
	await post.getByTestId('terminal-delete').click();
	await expect(post.getByTestId('epilogue-screen')).toBeVisible();

	await act(request, { type: 'mj/showRestitution', on: true });
	await expect(projector.getByTestId('restitution')).toBeVisible();
	await expect(projector.getByTestId('restitution')).toContainText('session');

	// Reset après une fin → nouvelle session propre
	await resetGame(request);
	const state = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();
	expect(state.phase).toBe('idle');
	expect(state.terminal.stage).toBe('auth');
	expect(state.sessionHistory.length).toBeGreaterThan(0); // l'historique survit

	await post.context().close();
	await projCtx.close();
});
