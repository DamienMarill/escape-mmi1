import { expect, test, type Page } from '@playwright/test';
import { act, clientIdOf, openPost, resetGame } from './helpers';

const BASE = 'http://localhost:4173';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ request }) => {
	await resetGame(request);
});

async function assign(
	request: import('@playwright/test').APIRequestContext,
	clientId: string,
	role: string
) {
	await act(request, { type: 'mj/assignRole', clientId, role });
}

/** Solveurs UI des mini-tâches (mêmes gestes qu'un joueur). */
const TASK_SOLVERS: Record<string, (p: Page) => Promise<void>> = {
	compilation: async (p) => {
		for (const [w, l] of [
			[0, 4],
			[1, 9],
			[2, 2]
		]) {
			await p.getByTestId(`log-line-${w}-${l}`).click({ timeout: 20_000 });
		}
	},
	memoire: async (p) => {
		for (const id of ['seg-a', 'seg-b', 'seg-c', 'seg-d', 'seg-e']) {
			await p.getByTestId(`mem-block-${id}`).first().click();
		}
	},
	brassage: async (p) => {
		const plan: Record<number, string> = { 1: 'D', 2: 'A', 3: 'F', 4: 'B', 5: 'E', 6: 'C' };
		for (const [port, socket] of Object.entries(plan)) {
			await p.getByTestId(`brassage-port-${port}`).click();
			await p.getByTestId(`brassage-socket-${socket}`).click();
		}
		await p.getByTestId('brassage-submit').click();
	},
	parite: async (p) => {
		await p.getByTestId('parite-row-5').click();
	},
	synchro: async (p) => {
		await p.getByTestId('synchro-slider').fill('7');
		await p.getByTestId('synchro-submit').click();
	},
	scan: async (p) => {
		await p.getByTestId('scan-machine-B14-SRV-01').click();
	}
};

test('RECETTE PHASE 1 : partie complète jouée à l’écran, des tâches à la bascule', async ({
	browser,
	request
}) => {
	test.setTimeout(300_000);
	const post = await openPost(browser, BASE);
	const clientId = await clientIdOf(post);
	const projCtx = await browser.newContext({ baseURL: BASE });
	const projector = await projCtx.newPage();
	await projector.goto('/projector');

	await act(request, { type: 'mj/startPhase1' });

	// ── Branche α : PARITÉ ne sert pas α, mais l'ordre est volontairement mêlé
	for (const task of ['parite', 'memoire', 'compilation'] as const) {
		await assign(request, clientId, task);
		await expect(post.getByTestId(`task-${task}`)).toBeVisible();
		await TASK_SOLVERS[task](post);
		await expect(post.getByTestId('task-solved')).toBeVisible({ timeout: 30_000 });
	}

	// ── Épreuve DEV : les deux blocs sont débloqués (compilation + mémoire)
	await assign(request, clientId, 'dev');
	await expect(post.getByTestId('epreuve-dev')).toBeVisible();
	await post.getByRole('button', { name: 'RÉPÈTE ×3 — AVANCE' }).click();
	await post.getByRole('button', { name: 'SI MUR — TOURNE' }).click();
	await post.getByTestId('dev-run').click();
	await expect(post.getByTestId('dev-solved')).toBeVisible({ timeout: 30_000 });
	await expect(projector.getByTestId('lock-alpha')).toHaveAttribute('data-status', 'open');

	// ── Branche β premier étage : SYNCHRO + SCAN puis IMAGE
	for (const task of ['synchro', 'scan'] as const) {
		await assign(request, clientId, task);
		await expect(post.getByTestId(`task-${task}`)).toBeVisible();
		await TASK_SOLVERS[task](post);
		await expect(post.getByTestId('task-solved')).toBeVisible({ timeout: 30_000 });
	}
	await assign(request, clientId, 'image');
	await expect(post.getByTestId('epreuve-image')).toBeVisible();
	await post.getByTestId('img-op-superposition').click();
	await post.getByTestId('img-op-negatif').click();
	await post.getByTestId('img-op-contraste').click();
	await post.getByTestId('img-submit').click();
	await expect(post.getByTestId('image-solved')).toBeVisible({ timeout: 15_000 });
	await expect(post.getByTestId('image-schema')).toBeVisible();

	// ── Branche β second étage : BRASSAGE puis SYSTÈME (parité déjà résolue)
	await assign(request, clientId, 'brassage');
	await TASK_SOLVERS.brassage(post);
	await expect(post.getByTestId('task-solved')).toBeVisible({ timeout: 15_000 });

	await assign(request, clientId, 'systeme');
	await expect(post.getByTestId('epreuve-systeme')).toBeVisible();
	await expect(post.getByTestId('systeme-quota')).toContainText('4');
	for (const lock of [
		'lock-x-archives',
		'lock-x-archives/sessions',
		'lock-r-archives/sessions',
		'lock-r-archives/sessions/eval_mmi1.dat'
	]) {
		await post.getByTestId(lock).click();
	}
	await post.getByTestId('systeme-open').click();
	await expect(post.getByTestId('systeme-solved')).toBeVisible({ timeout: 15_000 });
	await expect(projector.getByTestId('lock-beta')).toHaveAttribute('data-status', 'open');

	// ── Branche γ : la table de routage (les 6 segments sont tous obtenus)
	await assign(request, clientId, 'reseau');
	await expect(post.getByTestId('epreuve-reseau')).toBeVisible();
	for (const [port, value] of Object.entries({
		D: 'NULL',
		A: 'RELAY',
		F: 'MIRROR',
		B: 'BUFFER',
		E: 'ANYCAST',
		C: 'BROADCAST'
	})) {
		await post.getByTestId(`entry-${port}`).selectOption(value);
	}
	await post.getByTestId('reseau-submit').click();
	await expect(projector.getByTestId('lock-gamma')).toHaveAttribute('data-status', 'open');

	// ── Validation finale → bascule
	await expect(projector.getByTestId('finale-banner')).toBeVisible();
	await post.getByTestId('valider-btn').click();
	await expect(post.getByTestId('game-root')).toHaveAttribute('data-phase', '2', {
		timeout: 20_000
	});
	await expect(post.locator('h1')).toContainText('CONFINEMENT');

	await post.context().close();
	await projCtx.close();
});
