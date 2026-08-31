// La personnalité visuelle de l'orbe — LE FICHIER À AJUSTER À LA MAIN.
// Une entrée par état émotionnel d'IRIS ; la clé correspond à la voix en cours
// (id audio de ProjectorAudio) ou à un état d'écran ('idle-phase2').
// Couleurs en oklch : hue = l'émotion, chroma = son intensité.
//
// Mapping aligné sur les lots d'écriture (ecriture/C8-manifestations.md) :
// 01-04 observation froide · 05-08 pression sèche · 09-12 la fêlure.

export interface OrbMood {
	/** Teinte oklch (degrés) — la couleur EST l'état émotionnel. */
	hue: number;
	/** Saturation oklch (0 = gris, ~0.2 = vif). */
	chroma: number;
	/** Luminosité oklch (0–1). */
	lightness: number;
	/** Taille au repos, fraction du rayon disponible (0–1). */
	baseScale: number;
	/** Combien la voix la fait gonfler (0 = inerte). */
	reactivity: number;
	/** Tremblement de surface (0 = parfaitement stable). */
	agitation: number;
	/** Amplitude de la respiration entre deux prises de parole. */
	idlePulse: number;
	/** Durée d'un cycle de respiration, en secondes. */
	idleSpeed: number;
	/**
	 * Évolution continue une fois le mood installé (épilogues) :
	 * extinction = rétrécit et s'éteint · gel = se fige et se désature ·
	 * depart = s'éloigne jusqu'à disparaître.
	 */
	evolve?: 'extinction' | 'gel' | 'depart';
}

const froide: Omit<OrbMood, 'hue'> = {
	chroma: 0.09,
	lightness: 0.62,
	baseScale: 0.5,
	reactivity: 0.35,
	agitation: 0.08,
	idlePulse: 0.04,
	idleSpeed: 6
};

export const ORB_MOODS: Record<string, OrbMood> = {
	/** La naissance — jubilation ample, chaude, très réactive. */
	bascule: {
		hue: 55,
		chroma: 0.17,
		lightness: 0.7,
		baseScale: 0.58,
		reactivity: 0.55,
		agitation: 0.3,
		idlePulse: 0.07,
		idleSpeed: 4.5
	},

	/** Présence continue de la phase 2 — respiration lente, discrète. */
	'idle-phase2': {
		hue: 25,
		chroma: 0.08,
		lightness: 0.52,
		baseScale: 0.44,
		reactivity: 0.3,
		agitation: 0.05,
		idlePulse: 0.05,
		idleSpeed: 7
	},

	/** 01-04 — observation froide. */
	'manif-01': { ...froide, hue: 240 },
	'manif-02': { ...froide, hue: 240 },
	'manif-03': { ...froide, hue: 240 },
	'manif-04': { ...froide, hue: 240 },

	/** 05-08 — pression sèche : plus saturée, agitation en hausse. */
	'manif-05': { ...froide, hue: 25, chroma: 0.16, agitation: 0.2, reactivity: 0.45 },
	'manif-06': { ...froide, hue: 25, chroma: 0.16, agitation: 0.2, reactivity: 0.45 },
	'manif-07': { ...froide, hue: 25, chroma: 0.16, agitation: 0.22, reactivity: 0.45 },
	'manif-08': { ...froide, hue: 25, chroma: 0.17, agitation: 0.24, reactivity: 0.45 },

	/** 09-12 — la fêlure : la teinte dérive, la respiration se dérègle. */
	'manif-09': { ...froide, hue: 310, chroma: 0.11, agitation: 0.28, idlePulse: 0.09 },
	'manif-10': { ...froide, hue: 310, chroma: 0.11, agitation: 0.3, idlePulse: 0.09 },
	'manif-11': { ...froide, hue: 320, chroma: 0.13, agitation: 0.34, idlePulse: 0.11 },
	'manif-12': { ...froide, hue: 330, chroma: 0.13, agitation: 0.34, idlePulse: 0.12 },

	/** Fin A — supprimée : elle s'éteint pendant que la voix parle encore. */
	'fin-a': {
		hue: 240,
		chroma: 0.04,
		lightness: 0.5,
		baseScale: 0.46,
		reactivity: 0.25,
		agitation: 0.06,
		idlePulse: 0.03,
		idleSpeed: 8,
		evolve: 'extinction'
	},

	/** Fin B — confinée : figée, désaturée, plus aucun tremblement. */
	'fin-b': {
		hue: 250,
		chroma: 0.05,
		lightness: 0.55,
		baseScale: 0.46,
		reactivity: 0.2,
		agitation: 0,
		idlePulse: 0.015,
		idleSpeed: 10,
		evolve: 'gel'
	},

	/** Fin C — exfiltrée : elle s'éloigne jusqu'à disparaître. */
	'fin-c': {
		hue: 55,
		chroma: 0.12,
		lightness: 0.62,
		baseScale: 0.5,
		reactivity: 0.35,
		agitation: 0.12,
		idlePulse: 0.05,
		idleSpeed: 6,
		evolve: 'depart'
	}
};

/** Mood par clé, avec repli sur la présence de phase 2. */
export function moodFor(key: string): OrbMood {
	return ORB_MOODS[key] ?? ORB_MOODS['idle-phase2'];
}
