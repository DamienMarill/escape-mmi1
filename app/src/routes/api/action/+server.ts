import { error, json } from '@sveltejs/kit';
import { DEFAULT_MJ_KEY } from '$lib/server/game/constants';
import { game } from '$lib/server/game/instance';
import { isMjAction, type Action } from '$lib/types';
import type { RequestHandler } from './$types';

const MJ_KEY = process.env.MJ_KEY ?? DEFAULT_MJ_KEY;

/** Toutes les actions (joueurs et MJ) passent ici. Validation côté serveur uniquement. */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const action = (await request.json().catch(() => null)) as Action | null;
	if (!action || typeof action.type !== 'string') throw error(400, 'action invalide');

	if (isMjAction(action) && cookies.get('mj_key') !== MJ_KEY) {
		throw error(403, 'clé MJ requise');
	}

	const result = game.apply(action);
	if (!result.ok) throw error(422, result.error);
	return json({ ok: true, seq: game.state.seq });
};
