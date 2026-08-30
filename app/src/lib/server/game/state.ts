// Noyau d'état du jeu. L'état est la vérité, l'événement n'est qu'une
// invitation à animer (game-design §14.4) : le serveur pousse l'état complet,
// les clients s'installent dedans.

import { CORRECT_SEQUENCE } from '$lib/image-data';
import { simulate, type BlockId } from '$lib/dev-sim';
import { BASE_QUOTA, REQUIRED_LOCKS } from '$lib/systeme-data';
import { CORRESPONDENCE_TABLE, BRANCH_ORDER } from '$lib/tasks-data';
import type { Action, ChronoState, EpreuveId, LockId, PublicState, Role, TaskId } from '$lib/types';
import { EPREUVE_IDS, POST_ROLES, TASK_IDS, TASK_PORT } from '$lib/types';
import {
	BASCULE_DURATION_MS,
	BASCULE_STAGGER_MS,
	RELOCK_FRACTIONS,
	RESEAU_LOCKOUT_MS,
	RESEAU_MAX_ATTEMPTS,
	SEGMENT_VALUES,
	SESSION_DURATION_MS,
	VALIDATION_SEQUENCE_MS
} from './constants';
import { validateTask } from './tasks';

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
		introStartedAt: null,
		finaleValidatedAt: null,
		basculeAt: null,
		phase2At: null,
		relockAt: {},
		revealedSegments: {},
		reseau: { entries: {}, attempts: 0, lockedUntil: null },
		systeme: { locks: [] },
		devFails: 0,
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
			case 'mj/startIntro': {
				if (s.phase !== 'idle') return { ok: false, error: `intro impossible depuis ${s.phase}` };
				s.phase = 'intro';
				s.introStartedAt = this.now();
				this.log('vidéo d’introduction lancée');
				break;
			}
			case 'projector/introEnded': {
				if (s.phase !== 'intro') return { ok: false, error: 'pas d’intro en cours' };
				s.phase = 'phase1';
				this.chronoTouch(true);
				this.log('intro terminée — phase 1 démarrée');
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
			case 'reseau/validate': {
				if (s.finale !== 'available') return { ok: false, error: 'validation finale indisponible' };
				s.finale = 'validating';
				s.finaleValidatedAt = this.now();
				this.log('validation finale lancée');
				break;
			}
			case 'task/submit': {
				if (s.phase !== 'phase1') return { ok: false, error: 'hors phase 1' };
				const task = action.task;
				if (s.tasks[task].solved) break; // déjà résolue — idempotent
				const result = validateTask(task, action.payload);
				if (!result.solved) {
					return { ok: false, error: result.message ?? 'tentative non concluante' };
				}
				const port = TASK_PORT[task];
				s.tasks[task] = { solved: true, segment: SEGMENT_VALUES[port] };
				this.log(`tâche ${task} résolue — port ${port} obtenu`);
				break;
			}
			case 'reseau/setEntry': {
				// Saisie persistante : rien ne s'efface jamais tout seul (§6)
				s.reseau.entries[action.port] = action.value;
				break;
			}
			case 'reseau/submit': {
				if (s.phase !== 'phase1') return { ok: false, error: 'hors phase 1' };
				if (s.locks.gamma === 'open') break;
				const now = this.now();
				if (s.reseau.lockedUntil !== null && now < s.reseau.lockedUntil)
					return { ok: false, error: 'RECALIBRAGE DU LECTEUR…' };
				const complete = BRANCH_ORDER.every((port) => s.reseau.entries[port]);
				if (!complete) return { ok: false, error: 'table incomplète' };
				const correct = BRANCH_ORDER.every(
					(port) => s.reseau.entries[port] === CORRESPONDENCE_TABLE[SEGMENT_VALUES[port]]
				);
				if (correct) {
					s.reseau.attempts = 0;
					s.reseau.lockedUntil = null;
					s.epreuves.reseau.solved = true;
					this.openLock('gamma', 'table de routage rétablie');
					break;
				}
				s.reseau.attempts += 1;
				if (s.reseau.attempts >= RESEAU_MAX_ATTEMPTS) {
					s.reseau.attempts = 0;
					s.reseau.lockedUntil = now + RESEAU_LOCKOUT_MS;
					this.log('poste RÉSEAU en recalibrage (anti-brute-force)');
				}
				this.commit();
				return { ok: false, error: 'table de routage invalide' };
			}
			case 'dev/submit': {
				if (s.phase !== 'phase1') return { ok: false, error: 'hors phase 1' };
				if (s.epreuves.dev.solved) break;
				// Les blocs verrouillés exigent leurs tâches (validation serveur stricte)
				const program = action.program as BlockId[];
				if (program.includes('si-mur-tourne') && !s.tasks.compilation.solved)
					return { ok: false, error: 'bloc SI MUR verrouillé — source : un poste TÂCHE' };
				if (program.includes('repete-avance') && !s.tasks.memoire.solved)
					return { ok: false, error: 'bloc RÉPÈTE ×3 verrouillé — source : un poste TÂCHE' };
				const sim = simulate(program);
				if (!sim.success) {
					s.devFails += 1;
					this.commit();
					const hint =
						s.devFails >= 3 && sim.outcome === 'energy'
							? ' — séquence trop coûteuse pour cette grille'
							: '';
					return { ok: false, error: `le robot n’a pas atteint la cible${hint}` };
				}
				s.devFails = 0;
				s.epreuves.dev.solved = true;
				this.openLock('alpha', 'séquenceur résolu');
				break;
			}
			case 'image/submit': {
				if (s.phase !== 'phase1') return { ok: false, error: 'hors phase 1' };
				if (s.epreuves.image.solved) break;
				const ops = action.ops;
				// Les opérations verrouillées exigent leurs tâches
				if (ops.includes('negatif') && !s.tasks.scan.solved)
					return { ok: false, error: 'opération Négatif verrouillée — source : un poste TÂCHE' };
				if (ops.includes('contraste') && !s.tasks.synchro.solved)
					return { ok: false, error: 'opération Contraste verrouillée — source : un poste TÂCHE' };
				const correct =
					ops.length === CORRECT_SEQUENCE.length &&
					CORRECT_SEQUENCE.every((op, i) => ops[i] === op);
				if (!correct) return { ok: false, error: 'restauration non conforme à l’original' };
				s.epreuves.image.solved = true;
				this.log('image restaurée — schéma des verrous révélé');
				break;
			}
			case 'systeme/toggle': {
				if (s.phase !== 'phase1') return { ok: false, error: 'hors phase 1' };
				const quota =
					BASE_QUOTA + (s.tasks.brassage.solved ? 1 : 0) + (s.tasks.parite.solved ? 1 : 0);
				const idx = s.systeme.locks.indexOf(action.lock);
				if (idx >= 0) {
					s.systeme.locks.splice(idx, 1);
				} else {
					if (s.systeme.locks.length >= quota)
						return { ok: false, error: `quota de verrous atteint (${quota})` };
					s.systeme.locks.push(action.lock);
				}
				break;
			}
			case 'systeme/openTarget': {
				if (s.phase !== 'phase1') return { ok: false, error: 'hors phase 1' };
				if (s.epreuves.systeme.solved) break;
				const open = new Set(s.systeme.locks);
				const ok = REQUIRED_LOCKS.every((lock) => open.has(lock));
				if (!ok) return { ok: false, error: 'accès refusé — permissions insuffisantes' };
				s.epreuves.systeme.solved = true;
				this.openLock('beta', 'arborescence résolue');
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
				s.revealedSegments[action.port] = SEGMENT_VALUES[action.port];
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
		s.basculeAt = this.now();
		s.finale = 'done';
		s.basculeDelays = Object.fromEntries(
			Object.entries(s.posts).map(([id, p]) => [id, (p.number * 733) % BASCULE_STAGGER_MS])
		);
		this.log('bascule');
		this.commit();
	}

	/** Entrée en phase 2 : programme la refermeture des cadenas sur le temps restant. */
	enterPhase2() {
		const s = this.state;
		const now = this.now();
		s.phase = 'phase2';
		s.phase2At = now;
		const remaining = Math.max(60_000, s.chrono.durationMs - this.elapsedMs());
		s.relockAt = {
			alpha: now + remaining * RELOCK_FRACTIONS.alpha,
			beta: now + remaining * RELOCK_FRACTIONS.beta,
			gamma: now + remaining * RELOCK_FRACTIONS.gamma
		};
		this.log('phase 2 — confinement');
		this.commit();
	}

	/**
	 * Tick d'horloge (appelé toutes les ~500 ms par le serveur, ou manuellement
	 * dans les tests). Fait avancer les séquences chronométrées.
	 */
	tick() {
		const s = this.state;
		const now = this.now();

		if (
			s.finale === 'validating' &&
			s.finaleValidatedAt !== null &&
			now >= s.finaleValidatedAt + VALIDATION_SEQUENCE_MS
		) {
			this.bascule();
			return;
		}

		if (s.phase === 'bascule' && s.basculeAt !== null && now >= s.basculeAt + BASCULE_DURATION_MS) {
			this.enterPhase2();
			return;
		}

		if (s.phase === 'phase2') {
			let changed = false;
			for (const lock of ['alpha', 'beta', 'gamma'] as const) {
				const at = s.relockAt[lock];
				if (at !== undefined && now >= at && s.locks[lock] === 'open') {
					s.locks[lock] = 'reclosed';
					this.log(`cadenas ${lock} refermé`);
					changed = true;
				}
			}
			const allReclosed = (['alpha', 'beta', 'gamma'] as const).every(
				(l) => s.locks[l] === 'reclosed'
			);
			if (allReclosed && s.ending === null) {
				this.endGame('A', 'procédure automatique — noyau supprimé');
				return;
			}
			if (changed) this.commit();
		}
	}

	/** Fin de partie (A ou B) : épilogue sur tous les postes, historique salle. */
	endGame(ending: 'A' | 'B', reason: string) {
		const s = this.state;
		s.ending = ending;
		s.phase = 'epilogue';
		this.salle.history.push({ endedAt: this.now(), ending });
		this.log(`fin ${ending} — ${reason}`);
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
