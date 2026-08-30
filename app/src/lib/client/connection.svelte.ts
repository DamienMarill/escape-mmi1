// Connexion d'un client au serveur : enregistrement, flux SSE, envoi d'actions.
// EventSource gère nativement la reconnexion ; à chaque événement `state`
// on remplace l'état entier (l'état est la vérité, §14.4).

import type { Action, PostInfo, PublicState } from '$lib/types';

const STORAGE_KEY = 'escape-mmi1-client-id';

export class Connection {
	state = $state<PublicState | null>(null);
	clientId = $state<string | null>(null);
	number = $state<number | null>(null);
	/** true tant que le premier état n'a pas été reçu — sert au no-transition. */
	syncing = $state(true);
	connected = $state(false);

	me = $derived<PostInfo | null>(
		this.state && this.clientId ? (this.state.posts[this.clientId] ?? null) : null
	);

	private source: EventSource | null = null;

	/** À appeler une fois côté navigateur (onMount du layout). */
	async start(opts: { asPost?: boolean } = {}) {
		const asPost = opts.asPost ?? true;
		if (asPost) {
			// Test local multi-onglets : `/?poste=2` isole l'identité par valeur.
			// (Sans le paramètre — cas nominal du jour J — une machine = une identité,
			// partagée entre onglets et persistante entre rechargements.)
			const slot = new URLSearchParams(location.search).get('poste');
			const storageKey = slot ? `${STORAGE_KEY}-${slot}` : STORAGE_KEY;
			const stored = localStorage.getItem(storageKey) ?? undefined;
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clientId: stored })
			});
			const data = (await res.json()) as { clientId: string; number: number };
			this.clientId = data.clientId;
			this.number = data.number;
			localStorage.setItem(storageKey, data.clientId);
		}
		const url = this.clientId
			? `/api/events?client=${encodeURIComponent(this.clientId)}`
			: '/api/events';
		this.source = new EventSource(url);
		this.source.addEventListener('state', (ev) => {
			this.state = JSON.parse((ev as MessageEvent).data) as PublicState;
			this.syncing = false;
			this.connected = true;
		});
		this.source.onerror = () => {
			this.connected = false;
		};
	}

	stop() {
		this.source?.close();
		this.source = null;
	}

	async act(action: Action): Promise<{ ok: boolean; error?: string }> {
		const res = await fetch('/api/action', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(action)
		});
		if (!res.ok) {
			const body = (await res.json().catch(() => null)) as { message?: string } | null;
			return { ok: false, error: body?.message ?? `HTTP ${res.status}` };
		}
		return { ok: true };
	}
}

export const connection = new Connection();
