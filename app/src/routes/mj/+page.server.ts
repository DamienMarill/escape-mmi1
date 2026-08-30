import { error, redirect } from '@sveltejs/kit';
import { DEFAULT_MJ_KEY } from '$lib/server/game/constants';
import type { PageServerLoad } from './$types';

const MJ_KEY = process.env.MJ_KEY ?? DEFAULT_MJ_KEY;

/**
 * Garde d'accès à la console MJ : /mj?key=<clé> pose le cookie puis redirige
 * vers /mj. Sans cookie valide, accès refusé — un joueur qui tape /mj ne voit rien.
 */
export const load: PageServerLoad = ({ url, cookies }) => {
	const key = url.searchParams.get('key');
	if (key === MJ_KEY) {
		cookies.set('mj_key', key, { path: '/', httpOnly: true, sameSite: 'lax' });
		redirect(303, '/mj');
	}
	if (cookies.get('mj_key') !== MJ_KEY) {
		error(403, 'accès MJ : ouvrir /mj?key=<clé> (affichée au lancement du serveur)');
	}
	return {};
};
