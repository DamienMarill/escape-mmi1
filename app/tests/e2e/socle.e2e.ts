import { expect, test } from '@playwright/test';
import { act, clientIdOf, openMj, openPost, resetGame, MJ_COOKIE } from './helpers';

const BASE = 'http://localhost:4173';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ request }) => {
	await resetGame(request);
});

test('enregistrement : un poste reçoit un numéro et la couche bloquante est active', async ({
	browser
}) => {
	const post = await openPost(browser, BASE);
	const layer = post.getByTestId('blocking-layer');
	await expect(layer).toHaveAttribute('data-active', 'true');
	await expect(post.getByTestId('post-number')).not.toHaveText('—');
	await post.context().close();
});

test('activation + assignation : le rôle apparaît sur le poste et dans l’état', async ({
	browser,
	request
}) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);

	await post.getByTestId('activate-btn').click();
	await expect(post.getByTestId('activate-btn')).toBeHidden();

	await act(request, { type: 'mj/assignRole', clientId, role: 'reseau' });
	await expect(post.getByTestId('blocking-layer')).toContainText('RÉSEAU');

	const state = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();
	expect(state.posts[clientId]).toMatchObject({ role: 'reseau', activated: true });
	await post.context().close();
});

test('démarrage de la phase 1 : la couche bloquante se retire, le module s’affiche', async ({
	browser,
	request
}) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/assignRole', clientId, role: 'dev' });
	await act(request, { type: 'mj/startPhase1' });

	await expect(post.getByTestId('blocking-layer')).toHaveAttribute('data-active', 'false');
	await expect(post.locator('main')).toContainText('module DEV');
	await expect(post.locator('h1')).toContainText('ÉVALUATION');
	await post.context().close();
});

test('un poste rechargé en cours de session se resynchronise dans l’état courant', async ({
	browser,
	request
}) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/assignRole', clientId, role: 'image' });
	await act(request, { type: 'mj/startPhase1' });
	await expect(post.locator('main')).toContainText('module IMAGE');

	await post.reload();
	// Même identité (localStorage), même état, sans repasser par l'identification
	expect(await clientIdOf(post)).toBe(clientId);
	await expect(post.getByTestId('blocking-layer')).toHaveAttribute('data-active', 'false');
	await expect(post.locator('main')).toContainText('module IMAGE');
	await post.context().close();
});

test('verrouillage MJ d’un poste : la couche bloquante revient', async ({ browser, request }) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/assignRole', clientId, role: 'scan' });
	await act(request, { type: 'mj/startPhase1' });
	await expect(post.getByTestId('blocking-layer')).toHaveAttribute('data-active', 'false');

	await act(request, { type: 'mj/lockPost', clientId, locked: true });
	await expect(post.getByTestId('blocking-layer')).toHaveAttribute('data-active', 'true');
	await post.context().close();
});

test('indice MJ : l’encart s’affiche, se ferme, et un nouvel indice le rouvre', async ({
	browser,
	request
}) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/startPhase1' });

	await act(request, { type: 'mj/sendHint', clientId, text: 'regarde la table', level: 1 });
	await expect(post.getByText('regarde la table')).toBeVisible();

	await post.getByRole('button', { name: 'Fermer' }).click();
	await expect(post.getByText('regarde la table')).toBeHidden();

	await act(request, { type: 'mj/sendHint', clientId, text: 'second indice', level: 2 });
	await expect(post.getByText('second indice')).toBeVisible();
	await post.context().close();
});

test('la console MJ exige la clé et liste les postes', async ({ browser }) => {
	// Sans clé → 403
	const anon = await browser.newContext({ baseURL: BASE });
	const anonPage = await anon.newPage();
	const res = await anonPage.goto('/mj');
	expect(res?.status()).toBe(403);
	await anon.close();

	// Avec clé → la console rend et reflète un poste connecté
	const post = await openPost(browser, BASE);
	const mj = await openMj(browser, BASE);
	await expect(mj.locator('body')).toContainText(/postes/i);
	await post.context().close();
	await mj.context().close();
});

test('accès MJ : une action mj/* sans cookie est refusée', async ({ request }) => {
	// Le fixture `request` ne porte pas le cookie MJ (helpers.act l'ajoute explicitement)
	const res = await request.post('/api/action', { data: { type: 'mj/startPhase1' } });
	expect(res.status()).toBe(403);
});
