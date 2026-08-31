import { error, redirect } from '@sveltejs/kit';
import { DEFAULT_MJ_KEY } from '$lib/server/game/constants';
import type { PageServerLoad } from './$types';

const MJ_KEY = process.env.MJ_KEY ?? DEFAULT_MJ_KEY;

/**
 * Même garde que /mj : la régie rejoue toutes les scènes (audio compris),
 * elle révèle donc l'intégralité du twist. /regie?key=<clé> pose le cookie.
 */
export const load: PageServerLoad = ({ url, cookies }) => {
	const key = url.searchParams.get('key');
	if (key === MJ_KEY) {
		cookies.set('mj_key', key, { path: '/', httpOnly: true, sameSite: 'lax' });
		redirect(303, '/regie');
	}
	if (cookies.get('mj_key') !== MJ_KEY) {
		error(403, 'accès régie : ouvrir /regie?key=<clé MJ>');
	}
	return {};
};
