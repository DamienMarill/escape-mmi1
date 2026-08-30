import { game } from '$lib/server/game/instance';
import type { PublicState } from '$lib/types';
import type { RequestHandler } from './$types';

/**
 * Flux SSE : à la connexion, l'état complet est envoyé immédiatement
 * (id = seq), puis à chaque mutation. L'état est la vérité — un client qui
 * se reconnecte s'installe dans l'état courant sans rejouer les événements.
 */
export const GET: RequestHandler = ({ url }) => {
	const clientId = url.searchParams.get('client');
	const encoder = new TextEncoder();

	let unsubscribe: (() => void) | undefined;
	let heartbeat: ReturnType<typeof setInterval> | undefined;

	const stream = new ReadableStream({
		start(controller) {
			const send = (state: PublicState) => {
				try {
					controller.enqueue(
						encoder.encode(`id: ${state.seq}\nevent: state\ndata: ${JSON.stringify(state)}\n\n`)
					);
				} catch {
					// contrôleur déjà fermé — le cancel() fera le ménage
				}
			};
			if (clientId) game.setConnected(clientId, true);
			send(game.state);
			unsubscribe = game.subscribe(send);
			heartbeat = setInterval(() => {
				try {
					controller.enqueue(encoder.encode(`: ping\n\n`));
				} catch {
					/* fermé */
				}
			}, 15_000);
			heartbeat.unref?.();
		},
		cancel() {
			unsubscribe?.();
			if (heartbeat) clearInterval(heartbeat);
			if (clientId) game.setConnected(clientId, false);
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive'
		}
	});
};
