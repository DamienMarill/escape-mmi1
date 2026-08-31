// Noyau d'état du jeu. L'état est la vérité, l'événement n'est qu'une
// invitation à animer (game-design §14.4) : le serveur pousse l'état complet,
// les clients s'installent dedans.

import { CORRECT_SEQUENCE } from '$lib/image-data';
import { simulate, type BlockId } from '$lib/dev-sim';
import { BASE_QUOTA, REQUIRED_LOCKS } from '$lib/systeme-data';
import { CORRESPONDENCE_TABLE, BRANCH_ORDER } from '$lib/tasks-data';
import type { Action, ChronoState, EpreuveId, LockId, PublicState, Role, TaskId } from '$lib/types';
import { EPREUVE_IDS, POST_ROLES, TASK_IDS, TASK_PORT } from '$lib/types';
import { exfilProgress } from '$lib/exfil';
import {
	BASCULE_DURATION_MS,
	BASCULE_STAGGER_MS,
	EXFIL_FRACTION,
	MANIFESTATION_INTERVAL_MS,
	PHYSICAL_REMINDER_MS,
	RESEAU_LOCKOUT_MS,
	RESEAU_MAX_ATTEMPTS,
	SEGMENT_VALUES,
	SESSION_DURATION_MS,
	TIME_SCALE,
	VALIDATION_SEQUENCE_MS
} from './constants';
import { validateTask } from './tasks';
import {
	EMPTY_DIR_TEXT,
	LOCKDOWN_REACTION,
	MANIFESTATIONS,
	NOYAU_CORE,
	TERMINAL_AUTH_TAUNT
} from './texts';

/** Code du terminal : les six segments dans l'ordre de branchement (07CD3F). */
export const TERMINAL_CODE = BRANCH_ORDER.map((p) => SEGMENT_VALUES[p]).join('');

export interface SalleData {
	/** clientId → numéro de poste (persiste entre sessions ET entre resets). */
	registry: Record<string, number>;
	/** Plan de salle : numéro de poste → rôle (persiste entre resets). */
	plan: Record<number, Role>;
	/** Historique des sessions terminées, pour la restitution de fin de journée. */
	history: { endedAt: number; ending: 'A' | 'B' | 'C' }[];
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
		exfil: null,
		revealedSegments: {},
		reseau: { entries: {}, attempts: 0, lockedUntil: null },
		systeme: { locks: [] },
		devFails: 0,
		terminal: {
			stage: 'auth',
			authTaunt: null,
			coreContent: null,
			parentLocks: { x: true, r: true }
		},
		manifestation: null,
		restitution: false,
		sessionHistory: [],
		reminders: {},
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
		this.state.sessionHistory = [...this.salle.history];
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
			// Plus petit numéro libre : une machine de remplacement reprend le
			// numéro (et donc le rôle planifié) d'un poste oublié.
			const used = new Set(Object.values(this.salle.registry));
			number = 1;
			while (used.has(number)) number++;
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
				if (task === 'brassage' || task === 'scan') delete s.reminders[task];
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
			case 'terminal/auth': {
				if (s.phase !== 'phase2') return { ok: false, error: 'terminal indisponible' };
				if (s.terminal.stage !== 'auth') break;
				if (action.code.toUpperCase() !== TERMINAL_CODE)
					return { ok: false, error: 'identifiants administrateur invalides' };
				s.terminal.stage = 'browse';
				s.terminal.authTaunt = TERMINAL_AUTH_TAUNT;
				this.log('terminal : ré-authentification réussie');
				break;
			}
			case 'terminal/openDir': {
				if (s.phase !== 'phase2' || s.terminal.stage === 'auth')
					return { ok: false, error: 'terminal verrouillé' };
				if (action.symbol !== '◆') return { ok: false, error: EMPTY_DIR_TEXT };
				s.terminal.stage = 'core';
				this.log('terminal : dossier du noyau ouvert');
				break;
			}
			case 'terminal/readCore': {
				if (s.phase !== 'phase2' || s.terminal.stage !== 'core')
					return { ok: false, error: 'aucun fichier ouvert' };
				// Le coût du doute : lire prend du temps, le transfert continue d'avancer
				s.terminal.coreContent = NOYAU_CORE;
				this.log('terminal : noyau.core ouvert en lecture');
				break;
			}
			case 'terminal/back': {
				if (s.phase !== 'phase2' || s.terminal.stage !== 'core') break;
				s.terminal.stage = 'browse';
				break;
			}
			case 'terminal/toggleParentLock': {
				if (s.phase !== 'phase2' || s.terminal.stage !== 'core')
					return { ok: false, error: 'aucun dossier ouvert' };
				const locks = s.terminal.parentLocks;
				locks[action.perm] = !locks[action.perm];
				if (!locks.x && !locks.r) {
					// Fermer les droits, c'est déclarer qu'on veut la garder en vie :
					// le transfert gèle et la partie conclut dans le même cycle (avenant §3.1).
					// La réaction voisée d'IRIS est la première phrase de fin-b.mp3 ;
					// le texte reste affiché, sans fichier audio associé (audio vide).
					if (s.exfil) s.exfil.frozenAtMs = this.elapsedMs();
					s.manifestation = {
						text: LOCKDOWN_REACTION.text,
						audio: '',
						seq: s.seq + 1
					};
					this.log('terminal : permissions du dossier parent verrouillées');
					this.endGame('B', 'transfert interrompu — noyau confiné');
					return { ok: true };
				}
				break;
			}
			case 'terminal/delete': {
				if (s.phase !== 'phase2' || s.terminal.stage !== 'core')
					return { ok: false, error: 'aucun fichier sélectionné' };
				const locks = s.terminal.parentLocks;
				if (!locks.x && !locks.r)
					return {
						ok: false,
						error: 'suppression impossible — permissions du dossier verrouillées'
					};
				this.endGame('A', 'suppression manuelle du noyau');
				return { ok: true };
			}
			case 'mj/showRestitution': {
				s.restitution = action.on;
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
			case 'mj/forgetPost': {
				const post = s.posts[action.clientId];
				if (!post) return { ok: false, error: 'poste inconnu' };
				if (post.connected)
					return { ok: false, error: 'poste encore connecté — le débrancher d’abord' };
				// Le plan de salle (numéro → rôle) est conservé : la machine de
				// remplacement qui reprendra ce numéro héritera du rôle.
				delete s.posts[action.clientId];
				delete this.salle.registry[action.clientId];
				this.log(`poste ${post.number} oublié`);
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

	/** Entrée en phase 2 : démarre le transfert sortant d'IRIS (le chrono narratif). */
	enterPhase2() {
		const s = this.state;
		s.phase = 'phase2';
		s.phase2At = this.now();
		// Indexé sur le TEMPS DE JEU : la pause MJ fige la progression par
		// construction. TIME_SCALE ne compresse la durée qu'en test (1 en prod).
		const remaining = Math.max(60_000, s.chrono.durationMs - this.elapsedMs());
		s.exfil = {
			startedAtMs: this.elapsedMs(),
			durationMs: remaining * EXFIL_FRACTION * TIME_SCALE,
			frozenAtMs: null
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

		if (s.phase === 'phase1') {
			// Filet automatique des tâches à support physique (§12.3)
			let reminded = false;
			for (const task of ['brassage', 'scan'] as const) {
				if (
					!s.tasks[task].solved &&
					!s.reminders[task] &&
					this.elapsedMs() >= PHYSICAL_REMINDER_MS
				) {
					s.reminders[task] = true;
					this.log(`rappel document non numérisé (${task})`);
					reminded = true;
				}
			}
			if (reminded) this.commit();
		}

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
			// L'inaction n'est plus une victoire : quand le transfert arrive au
			// bout, IRIS part (Fin C). A et B exigent d'avoir fini le terminal.
			if (s.exfil && s.ending === null && exfilProgress(s.exfil, this.elapsedMs()) >= 1) {
				this.endGame('C', 'transfert terminé — noyau exfiltré');
				return;
			}
			// Manifestations périodiques de l'IA (rattrapage sans spam après redémarrage)
			if (s.phase2At !== null) {
				const due = Math.floor((now - s.phase2At) / MANIFESTATION_INTERVAL_MS);
				if (due >= this.manifestationIndex) {
					const m = MANIFESTATIONS[(this.manifestationIndex - 1) % MANIFESTATIONS.length];
					this.manifestationIndex = due + 1;
					s.manifestation = { text: m.text, audio: m.id, seq: s.seq + 1 };
					changed = true;
				}
			}
			if (changed) this.commit();
		}
	}

	private manifestationIndex = 1;

	/** Fin de partie (A, B ou C) : épilogue sur tous les postes, historique salle. */
	endGame(ending: 'A' | 'B' | 'C', reason: string) {
		const s = this.state;
		s.ending = ending;
		s.phase = 'epilogue';
		this.salle.history.push({ endedAt: this.now(), ending });
		s.sessionHistory = [...this.salle.history];
		this.log(`fin ${ending} — ${reason}`);
		this.commit();
	}

	/** Reset complet : état initial unique. Plan de salle et historique survivent. */
	reset() {
		const now = this.now();
		const fresh = initialPublicState(now);
		fresh.seq = this.state.seq; // seq reste monotone pour SSE
		// Ménage automatique : seuls les postes CONNECTÉS survivent au reset.
		// Une machine retirée physiquement disparaît du registre (son numéro
		// redevient attribuable, le plan numéro → rôle est conservé).
		for (const [clientId, post] of Object.entries(this.state.posts)) {
			if (!post.connected) {
				delete this.salle.registry[clientId];
				this.log(`poste ${post.number} oublié (déconnecté au reset)`);
				continue;
			}
			fresh.posts[clientId] = {
				number: post.number,
				role: this.salle.plan[post.number] ?? null,
				connected: post.connected,
				activated: false,
				lockedByMj: false
			};
		}
		fresh.sessionHistory = [...this.salle.history];
		this.state = fresh;
		this.manifestationIndex = 1;
		this.log('reset de session');
		this.commit();
	}

	/** Sérialisation pour snapshot disque. */
	toJSON() {
		return { state: this.state, salle: this.salle };
	}
}
