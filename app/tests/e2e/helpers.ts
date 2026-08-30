import type { APIRequestContext, Browser, Page } from '@playwright/test';

export const MJ_KEY = 'brassens';
export const MJ_COOKIE = { cookie: `mj_key=${MJ_KEY}` };

/** Envoie une action au serveur (avec la clé MJ pour les actions mj/*). */
export async function act(request: APIRequestContext, action: Record<string, unknown>) {
	const res = await request.post('/api/action', {
		headers: MJ_COOKIE,
		data: action
	});
	if (!res.ok()) throw new Error(`action ${String(action.type)} → HTTP ${res.status()}`);
	return res.json();
}

/** Remet le serveur à l'état initial (à appeler en début de test). */
export async function resetGame(request: APIRequestContext) {
	await act(request, { type: 'mj/reset' });
}

/** Ouvre un nouveau contexte "poste" isolé (localStorage vierge) et attend la synchro SSE. */
export async function openPost(browser: Browser, baseURL: string): Promise<Page> {
	const context = await browser.newContext({ baseURL });
	const page = await context.newPage();
	await page.goto('/');
	await page.waitForFunction(() => localStorage.getItem('escape-mmi1-client-id') !== null);
	return page;
}

/** Récupère le clientId d'une page poste. */
export async function clientIdOf(page: Page): Promise<string> {
	const id = await page.evaluate(() => localStorage.getItem('escape-mmi1-client-id'));
	if (!id) throw new Error('clientId absent du localStorage');
	return id;
}

/** Ouvre la console MJ dans un nouveau contexte (pose le cookie via ?key=). */
export async function openMj(browser: Browser, baseURL: string): Promise<Page> {
	const context = await browser.newContext({ baseURL });
	const page = await context.newPage();
	await page.goto(`/mj?key=${MJ_KEY}`);
	return page;
}
