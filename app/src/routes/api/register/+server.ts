import { json } from '@sveltejs/kit';
import { game } from '$lib/server/game/instance';
import type { RequestHandler } from './$types';

/**
 * Enregistrement d'un client. Le client envoie son id persistant (localStorage)
 * s'il en a un ; sinon le serveur en émet un. Idempotent.
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => ({}))) as { clientId?: string };
	const clientId = body.clientId || `poste-${crypto.randomUUID()}`;
	const number = game.register(clientId);
	return json({ clientId, number });
};
