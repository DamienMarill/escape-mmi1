import { error, json } from '@sveltejs/kit';
import { DEFAULT_MJ_KEY } from '$lib/server/game/constants';
import { game } from '$lib/server/game/instance';
import type { RequestHandler } from './$types';

const MJ_KEY = process.env.MJ_KEY ?? DEFAULT_MJ_KEY;

/** Lecture directe de l'état — console MJ, tests et debug uniquement. */
export const GET: RequestHandler = ({ cookies }) => {
	if (cookies.get('mj_key') !== MJ_KEY) throw error(403, 'clé MJ requise');
	return json(game.state);
};
