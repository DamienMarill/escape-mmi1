import { expect, test, type Page } from '@playwright/test';
import { act, clientIdOf, openPost, resetGame } from './helpers';

const BASE = 'http://localhost:4173';

// Réponses de la table de routage (dérivées de la table de correspondance affichée)
const RESEAU_ANSWERS: Record<string, string> = {
	D: 'NULL',
	A: 'RELAY',
	F: 'MIRROR',
	B: 'BUFFER',
	E: 'ANYCAST',
	C: 'BROADCAST'
};

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ request }) => {
	await resetGame(request);
});

/** Assigne un rôle au poste et attend que le module s'affiche. */
async function setRole(
	page: Page,
	request: import('@playwright/test').APIRequestContext,
	clientId: string,
	role: string
) {
	await act(request, { type: 'mj/assignRole', clientId, role });
	await expect(
		page.getByTestId(`task-${role}`).or(page.getByTestId(`epreuve-${role}`))
	).toBeVisible({ timeout: 5_000 });
}

async function solveCompilation(page: Page) {
	// Les ERROR sont aux index 4, 9, 2 (COMPILATION_ERROR_INDEX)
	for (const [wave, line] of [
		[0, 4],
		[1, 9],
		[2, 2]
	]) {
		await page.getByTestId(`log-line-${wave}-${line}`).click({ timeout: 20_000 });
	}
}

async function solveMemoire(page: Page) {
	for (const id of ['seg-a', 'seg-b', 'seg-c', 'seg-d', 'seg-e']) {
		await page.getByTestId(`mem-block-${id}`).first().click();
	}
}

async function solveBrassage(page: Page) {
	const plan: Record<number, string> = { 1: 'D', 2: 'A', 3: 'F', 4: 'B', 5: 'E', 6: 'C' };
	for (const [port, socket] of Object.entries(plan)) {
		await page.getByTestId(`brassage-port-${port}`).click();
		await page.getByTestId(`brassage-socket-${socket}`).click();
	}
	await page.getByTestId('brassage-submit').click();
}

async function solveParite(page: Page) {
	await page.getByTestId('parite-row-5').click();
}

async function solveSynchro(page: Page) {
	await page.getByTestId('synchro-slider').fill('7');
	await page.getByTestId('synchro-submit').click();
}

async function solveScan(page: Page) {
	await page.getByTestId('scan-machine-SRV-EVAL-7').click();
}

const SOLVERS: Record<string, (page: Page) => Promise<void>> = {
	compilation: solveCompilation,
	memoire: solveMemoire,
	brassage: solveBrassage,
	parite: solveParite,
	synchro: solveSynchro,
	scan: solveScan
};

const EXPECTED_SEGMENTS: Record<string, string> = {
	compilation: 'PORT A : 7',
	memoire: 'PORT B : D',
	brassage: 'PORT C : F',
	parite: 'PORT D : 0',
	synchro: 'PORT E : 3',
	scan: 'PORT F : C'
};

test('branche γ complète : 6 minis puis table de routage → cadenas γ', async ({
	browser,
	request
}) => {
	test.setTimeout(240_000);
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	const projector = await browser.newContext({ baseURL: BASE });
	const projPage = await projector.newPage();
	await projPage.goto('/projector');

	await act(request, { type: 'mj/startPhase1' });

	// Un même poste joue les 6 minis par réassignations successives
	for (const task of ['parite', 'scan', 'memoire', 'synchro', 'brassage', 'compilation']) {
		await setRole(post, request, clientId, task);
		await SOLVERS[task](post);
		// Écran résolu : segment en très gros + déblocage nommé, PERMANENT
		await expect(post.getByTestId('task-solved')).toBeVisible({ timeout: 30_000 });
		await expect(post.getByTestId('task-segment')).toContainText(EXPECTED_SEGMENTS[task]);
		await expect(post.getByTestId('task-unlock')).toBeVisible();
	}

	// Le projecteur montre les 6 ports obtenus, jamais les valeurs
	await expect(projPage.getByTestId('lock-gamma')).toHaveAttribute('data-status', 'locked');
	const projBody = await projPage.locator('body').innerText();
	for (const v of ['NULL', 'RELAY', 'MIRROR', 'BUFFER', 'ANYCAST']) {
		expect(projBody).not.toContain(v);
	}

	// Poste RÉSEAU : remplir la table dans l'ordre de branchement et valider
	await setRole(post, request, clientId, 'reseau');
	await expect(post.getByTestId('epreuve-reseau')).toBeVisible();
	for (const [port, value] of Object.entries(RESEAU_ANSWERS)) {
		await post.getByTestId(`entry-${port}`).selectOption(value);
	}
	await post.getByTestId('reseau-submit').click();

	await expect(post.getByTestId('reseau-solved')).toBeVisible();
	await expect(projPage.getByTestId('lock-gamma')).toHaveAttribute('data-status', 'open');

	await post.context().close();
	await projector.close();
});

test('une mauvaise réponse est douce : message, pas de blocage', async ({ browser, request }) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/startPhase1' });
	await setRole(post, request, clientId, 'scan');

	await post.getByTestId('scan-machine-B14-PC-04').click();
	await expect(post.getByTestId('task-solved')).not.toBeVisible();
	// La tâche reste jouable immédiatement
	await solveScan(post);
	await expect(post.getByTestId('task-solved')).toBeVisible();
	await post.context().close();
});

test('RÉSEAU : saisie persistante après rechargement, lockout après 3 échecs', async ({
	browser,
	request
}) => {
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	await act(request, { type: 'mj/startPhase1' });
	await setRole(post, request, clientId, 'reseau');

	// Table complète mais fausse (D inversé avec A)
	const wrong = { ...RESEAU_ANSWERS, D: 'RELAY', A: 'NULL' };
	for (const [port, value] of Object.entries(wrong)) {
		await post.getByTestId(`entry-${port}`).selectOption(value);
	}

	// La saisie survit à un rechargement
	await post.reload();
	await expect(post.getByTestId('entry-D')).toHaveValue('RELAY');

	for (let i = 0; i < 3; i++) {
		await post.getByTestId('reseau-submit').click();
		if (i < 2) await expect(post.getByTestId('reseau-feedback')).toBeVisible();
	}
	// 3e échec → recalibrage affiché, bouton retiré
	await expect(post.getByTestId('reseau-lockout')).toBeVisible();
	await expect(post.getByTestId('reseau-submit')).not.toBeVisible();

	// Après le lockout (30 s × TIME_SCALE 0.05 = 1,5 s), corriger et réussir
	await expect(post.getByTestId('reseau-submit')).toBeVisible({ timeout: 10_000 });
	await post.getByTestId('entry-D').selectOption('NULL');
	await post.getByTestId('entry-A').selectOption('RELAY');
	await post.getByTestId('reseau-submit').click();
	await expect(post.getByTestId('reseau-solved')).toBeVisible();
	await post.context().close();
});
