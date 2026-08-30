import { expect, test } from '@playwright/test';
import { act, resetGame, MJ_COOKIE } from './helpers';

const TERMINAL_CODE = '07CD3F';

test.describe.configure({ mode: 'serial' });

/**
 * RECETTE FINALE : deux parties complètes d'affilée (via API, la couverture UI
 * est faite par phase1/phase2.e2e), avec un reset entre les deux. L'état
 * initial doit être STRICTEMENT identique — c'est la garantie « testable une
 * fois pour toutes » du §11.
 */

const RESEAU_ANSWERS = {
	D: 'NULL',
	A: 'RELAY',
	F: 'MIRROR',
	B: 'BUFFER',
	E: 'ANYCAST',
	C: 'BROADCAST'
} as const;

async function playFullGame(
	request: import('@playwright/test').APIRequestContext,
	ending: 'A' | 'B'
) {
	await act(request, { type: 'mj/startPhase1' });
	// Les 6 tâches
	await act(request, { type: 'task/submit', task: 'compilation', payload: { clicks: [4, 9, 2] } });
	await act(request, {
		type: 'task/submit',
		task: 'memoire',
		payload: { placed: ['seg-a', 'seg-b', 'seg-c', 'seg-d', 'seg-e'] }
	});
	await act(request, {
		type: 'task/submit',
		task: 'brassage',
		payload: { connections: { 1: 'D', 2: 'A', 3: 'F', 4: 'B', 5: 'E', 6: 'C' } }
	});
	await act(request, { type: 'task/submit', task: 'parite', payload: { row: 5 } });
	await act(request, { type: 'task/submit', task: 'synchro', payload: { offset: 7 } });
	await act(request, { type: 'task/submit', task: 'scan', payload: { machine: 'SRV-EVAL-7' } });
	// Les 4 épreuves
	await act(request, { type: 'dev/submit', program: ['repete-avance', 'si-mur-tourne'] });
	await act(request, { type: 'image/submit', ops: ['superposition', 'negatif', 'contraste'] });
	for (const lock of [
		'x:archives',
		'x:archives/sessions',
		'r:archives/sessions',
		'r:archives/sessions/eval_mmi1.dat'
	]) {
		await act(request, { type: 'systeme/toggle', lock });
	}
	await act(request, { type: 'systeme/openTarget' });
	for (const [port, value] of Object.entries(RESEAU_ANSWERS)) {
		await act(request, { type: 'reseau/setEntry', port, value });
	}
	await act(request, { type: 'reseau/submit' });
	// Validation finale → bascule → phase 2
	await act(request, { type: 'reseau/validate' });
	await expect
		.poll(
			async () => (await (await request.get('/api/state', { headers: MJ_COOKIE })).json()).phase,
			{ timeout: 20_000 }
		)
		.toBe('phase2');
	// Terminal
	await act(request, { type: 'terminal/auth', code: TERMINAL_CODE });
	await act(request, { type: 'terminal/openDir', symbol: '◆' });
	if (ending === 'A') {
		await act(request, { type: 'terminal/delete' });
	} else {
		await act(request, { type: 'terminal/toggleParentLock', perm: 'x' });
		await act(request, { type: 'terminal/toggleParentLock', perm: 'r' });
	}
	await expect
		.poll(
			async () => (await (await request.get('/api/state', { headers: MJ_COOKIE })).json()).ending,
			{ timeout: 120_000 }
		)
		.toBe(ending);
}

/** Champs volatils à ignorer dans la comparaison d'états initiaux. */
function normalize(state: Record<string, unknown>) {
	const s = structuredClone(state);
	delete s.seq;
	delete s.serverNow;
	delete s.journal;
	delete s.sessionHistory; // il DOIT survivre — vérifié séparément
	delete s.posts; // identités conservées volontairement
	(s.chrono as { changedAt?: number }).changedAt = 0;
	return s;
}

test('deux parties complètes d’affilée : reset → états initiaux identiques', async ({
	request
}) => {
	test.setTimeout(360_000);

	await resetGame(request);
	const initial1 = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();

	await playFullGame(request, 'A');

	await resetGame(request);
	const initial2 = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();
	expect(normalize(initial2)).toEqual(normalize(initial1));
	expect(initial2.sessionHistory.length).toBe(initial1.sessionHistory.length + 1);

	await playFullGame(request, 'B');

	await resetGame(request);
	const initial3 = await (await request.get('/api/state', { headers: MJ_COOKIE })).json();
	expect(normalize(initial3)).toEqual(normalize(initial1));
	const endings = (initial3.sessionHistory as { ending: string }[]).slice(-2).map((h) => h.ending);
	expect(endings).toEqual(['A', 'B']);
});
