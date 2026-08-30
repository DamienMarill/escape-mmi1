// Noyau d'état du jeu. L'état est la vérité, l'événement n'est qu'une
// invitation à animer (game-design §14.4) : le serveur pousse l'état complet,
// les clients s'installent dedans.

import type { Action, ChronoState, EpreuveId, LockId, PublicState, Role, TaskId } from '$lib/types';
import { EPREUVE_IDS, POST_ROLES, TASK_IDS } from '$lib/types';
import { BASCULE_STAGGER_MS, SESSION_DURATION_MS } from './constants';

export interface SalleData {
	/** clientId → numéro de poste (persiste entre sessions ET entre resets). */
	registry: Record<string, number>;
	/** Plan de salle : numéro de poste → rôle (persiste entre resets). */
	plan: Record<number, Role>;
	/** Historique des sessions terminées, pour la restitution de fin de journée. */
	history: { endedAt: number; ending: 'A' | 'B' }[];
}

export function initialSalle(): SalleData {
	return { registry: {}, plan: {}, history: [] };
}

export function initialPublicState(now: number): PublicState {
	return {
		seq: 0,
		serverNow: now,
		phase: 'idle',
		calmMode: false,
		chrono: { running: false, elapsedMs: 0, changedAt: now, durationMs: SESSION_DURATION_MS },
		posts: {},
		locks: { alpha: 'locked', beta: 'locked', gamma: 'locked' },
		tasks: Object.fromEntries(TASK_IDS.map((t) => [t, { solved: false, segment: null }])) as Record<
			TaskId,
			{ solved: boolean; segment: string | null }
		>,
		epreuves: Object.fromEntries(EPREUVE_IDS.map((e) => [e, { solved: false }])) as Record<
			EpreuveId,
			{ solved: boolean }
		>,
		finale: 'none',
		ending: null,
		basculeDelays: {},
		hints: {},
		revealedPorts: [],
		journal: []
	};
}

export class Game {
	state: PublicState;
	salle: SalleData;
	private listeners = new Set<(state: PublicState) => void>();
	private now: () => number;

	constructor(opts: { now?: () => number; state?: PublicState; salle?: SalleData } = {}) {
		this.now = opts.now ?? Date.now;
		this.state = opts.state ?? initialPublicState(this.now());
		this.salle = opts.salle ?? initialSalle();
	}

	subscribe(fn: (state: PublicState) => void): () => void {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}

	/** Incrémente seq et notifie tous les abonnés (SSE). */
	private commit() {
		this.state.seq += 1;
		this.state.serverNow = this.now();
		for (const fn of this.listeners) fn(this.state);
	}

	private log(msg: string) {
		this.state.journal.push({ t: this.now(), msg });
	}

	/** Enregistre un client (idempotent) et retourne son numéro de poste. */
	register(clientId: string): number {
		let number = this.salle.registry[clientId];
		if (number === undefined) {
			const used = Object.values(this.salle.registry);
			number = used.length === 0 ? 1 : Math.max(...used) + 1;
			this.salle.registry[clientId] = number;
		}
		if (!this.state.posts[clientId]) {
			this.state.posts[clientId] = {
				number,
				role: this.salle.plan[number] ?? null,
				connected: false,
				activated: false,
				lockedByMj: false
			};
			this.commit();
		}
		return number;
	}

	setConnected(clientId: string, connected: boolean) {
		const post = this.state.posts[clientId];
		if (post && post.connected !== connected) {
			post.connected = connected;
			this.commit();
		}
	}

	/** Temps écoulé du chrono à l'instant t. */
	elapsedMs(chrono: ChronoState = this.state.chrono): number {
		return chrono.elapsedMs + (chrono.running ? this.now() - chrono.changedAt : 0);
	}

	private chronoTouch(running: boolean) {
		const c = this.state.chrono;
		c.elapsedMs = this.elapsedMs(c);
		c.changedAt = this.now();
		c.running = running;
	}

	apply(action: Action): { ok: true } | { ok: false; error: string } {
		const s = this.state;
		switch (action.type) {
			case 'post/activate': {
				const post = s.posts[action.clientId];
				if (!post) return { ok: false, error: 'poste inconnu' };
				post.activated = true;
				this.log(`poste ${post.number} activé`);
				break;
			}
			case 'mj/assignRole': {
				const post = s.posts[action.clientId];
				if (!post) return { ok: false, error: 'poste inconnu' };
				post.role = action.role;
				if (action.role) this.salle.plan[post.number] = action.role;
				else delete this.salle.plan[post.number];
				this.log(`poste ${post.number} → rôle ${action.role ?? 'aucun'}`);
				break;
			}
			case 'mj/distributeRoles': {
				// Applique le plan de salle enregistré ; à défaut, l'ordre d'activation.
				const assigned = new Set(
					Object.values(s.posts)
						.map((p) => p.role)
						.filter(Boolean)
				);
				const freeRoles = POST_ROLES.filter((r) => !assigned.has(r));
				const unassigned = Object.entries(s.posts)
					.filter(([, p]) => p.role === null && p.activated)
					.sort(([, a], [, b]) => a.number - b.number);
				for (const [, post] of unassigned) {
					const planned = this.salle.plan[post.number];
					const role = planned ?? freeRoles.shift();
					if (!role) break;
					post.role = role;
					this.salle.plan[post.number] = role;
					const idx = freeRoles.indexOf(role as (typeof freeRoles)[number]);
					if (idx >= 0) freeRoles.splice(idx, 1);
				}
				this.log('distribution des rôles');
				break;
			}
			case 'mj/startPhase1': {
				if (s.phase !== 'idle' && s.phase !== 'intro')
					return { ok: false, error: `phase1 impossible depuis ${s.phase}` };
				s.phase = 'phase1';
				this.chronoTouch(true);
				this.log('phase 1 démarrée');
				break;
			}
			case 'mj/reset': {
				this.reset();
				return { ok: true };
			}
			case 'mj/chronoStart':
				this.chronoTouch(true);
				break;
			case 'mj/chronoPause':
				this.chronoTouch(false);
				break;
			case 'mj/chronoAdd':
				s.chrono.durationMs = Math.max(60_000, s.chrono.durationMs + action.ms);
				this.log(`chrono ajusté de ${Math.round(action.ms / 60000)} min`);
				break;
			case 'mj/cheatOpenLock': {
				if (s.locks[action.lock] === 'open') break;
				this.openLock(action.lock, 'triche MJ');
				break;
			}
			case 'mj/lockPost': {
				const post = s.posts[action.clientId];
				if (!post) return { ok: false, error: 'poste inconnu' };
				post.lockedByMj = action.locked;
				break;
			}
			case 'mj/revealSegment': {
				if (!s.revealedPorts.includes(action.port)) s.revealedPorts.push(action.port);
				this.log(`segment du port ${action.port} révélé au projecteur`);
				break;
			}
			case 'mj/sendHint': {
				s.hints[action.clientId] = { text: action.text, level: action.level, seq: s.seq + 1 };
				break;
			}
			case 'mj/clearHint': {
				s.hints[action.clientId] = null;
				break;
			}
			case 'mj/setCalmMode':
				s.calmMode = action.on;
				break;
			default:
				return { ok: false, error: 'action inconnue' };
		}
		this.commit();
		return { ok: true };
	}

	/** Ouvre un cadenas et déclenche la validation finale si 3/3. */
	openLock(lock: LockId, source: string) {
		const s = this.state;
		s.locks[lock] = 'open';
		this.log(`cadenas ${lock} ouvert (${source})`);
		if (s.locks.alpha === 'open' && s.locks.beta === 'open' && s.locks.gamma === 'open') {
			s.finale = 'available';
			this.log('évaluation complète — validation disponible');
		}
	}

	/**
	 * Bascule vers la phase 2 : délais d'animation étalés, déterministes
	 * (le contenu du jeu ne tire rien au sort — §11 ; l'ordre visuel, lui,
	 * doit juste paraître arbitraire).
	 */
	bascule() {
		const s = this.state;
		s.phase = 'bascule';
		s.basculeDelays = Object.fromEntries(
			Object.entries(s.posts).map(([id, p]) => [id, (p.number * 733) % BASCULE_STAGGER_MS])
		);
		this.log('bascule');
		this.commit();
	}

	/** Reset complet : état initial unique. Registre, plan de salle et historique survivent. */
	reset() {
		const now = this.now();
		const fresh = initialPublicState(now);
		fresh.seq = this.state.seq; // seq reste monotone pour SSE
		// Les postes connus restent identifiés avec leur rôle du plan de salle.
		for (const [clientId, post] of Object.entries(this.state.posts)) {
			fresh.posts[clientId] = {
				number: post.number,
				role: this.salle.plan[post.number] ?? null,
				connected: post.connected,
				activated: false,
				lockedByMj: false
			};
		}
		this.state = fresh;
		this.log('reset de session');
		this.commit();
	}

	/** Sérialisation pour snapshot disque. */
	toJSON() {
		return { state: this.state, salle: this.salle };
	}
}
