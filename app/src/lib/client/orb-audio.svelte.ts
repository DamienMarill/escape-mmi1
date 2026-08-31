// Analyse audio pour l'orbe d'IRIS. Un seul graphe Web Audio, greffé sur
// l'unique <audio> du projecteur (ProjectorAudio) — createMediaElementSource
// ne peut être appelé qu'une fois par élément, et le graphe DOIT ressortir
// sur ctx.destination : le projecteur reste la seule source sonore.

class OrbAudioState {
	/**
	 * Voix d'IRIS en cours de lecture ('bascule', 'manif-05', 'fin-b', …) ou
	 * null (silence, ou son corporate — cadenas, jalons — sur lequel l'orbe ne
	 * réagit pas). Positionné par ProjectorAudio.
	 */
	currentVoice = $state<string | null>(null);
}

export const orbAudio = new OrbAudioState();

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let bins: Uint8Array<ArrayBuffer> | null = null;
const attached = new WeakSet<HTMLAudioElement>();

/**
 * Branche un élément <audio> sur le graphe d'analyse (créé au premier appel).
 * Appelé par ProjectorAudio en salle, et par la régie (/regie) pour son propre
 * lecteur. Idempotent par élément — createMediaElementSource ne tolère qu'un
 * appel par élément, et plusieurs sources peuvent alimenter le même analyseur.
 */
export function initAnalyser(el: HTMLAudioElement): void {
	try {
		if (!ctx) {
			ctx = new AudioContext();
			analyser = ctx.createAnalyser();
			analyser.fftSize = 1024;
			analyser.smoothingTimeConstant = 0.55;
			analyser.connect(ctx.destination);
			bins = new Uint8Array(analyser.frequencyBinCount);
		}
		if (analyser && !attached.has(el)) {
			ctx.createMediaElementSource(el).connect(analyser);
			attached.add(el);
		}
	} catch {
		// Sans Web Audio, l'orbe vit sur sa respiration idle — pas d'erreur.
	}
}

/** À appeler sur un geste utilisateur (le déblocage audio du projecteur). */
export function resumeAnalyser(): void {
	if (ctx && ctx.state === 'suspended') void ctx.resume();
}

/**
 * Énergie instantanée de la BANDE VOCALE (~100–3500 Hz), entre 0 et 1.
 * Jamais le spectre complet : un lit sonore large ferait pulser l'orbe en
 * permanence et elle cesserait de réagir à la parole (B1 §9).
 */
export function voiceEnergy(): number {
	if (!ctx || !analyser || !bins) return 0;
	analyser.getByteFrequencyData(bins);
	const hzPerBin = ctx.sampleRate / analyser.fftSize;
	const lo = Math.max(1, Math.round(100 / hzPerBin));
	const hi = Math.min(bins.length - 1, Math.round(3500 / hzPerBin));
	let sum = 0;
	for (let i = lo; i <= hi; i++) sum += bins[i];
	return sum / ((hi - lo + 1) * 255);
}

/** Réservé aux tests. */
export function resetOrbAudioForTests(): void {
	orbAudio.currentVoice = null;
}
