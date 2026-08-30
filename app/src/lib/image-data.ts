// Données du poste IMAGE — partagées client/serveur.
// Le canvas côté client n'est qu'une VISUALISATION ; la validation porte
// sur la séquence d'opérations, côté serveur. Rien de secret ici : l'ordre
// correct se déduit de l'image affichée (c'est le puzzle).

export const IMAGE_W = 192;
export const IMAGE_H = 128;

export type ImageOp = 'luminosite' | 'superposition' | 'negatif' | 'contraste';

export interface OpInfo {
	id: ImageOp;
	label: string;
	/** L'opération réelle, affichée en clair à droite (le double déclic du poste). */
	formula: string;
	/** Tâche qui la débloque — null si disponible dès le départ. */
	unlockedBy: 'scan' | 'synchro' | null;
}

export const IMAGE_OPS: OpInfo[] = [
	{
		id: 'luminosite',
		label: 'Luminosité +50',
		formula: 'chaque pixel : valeur + 50',
		unlockedBy: null
	},
	{ id: 'superposition', label: 'Superposition', formula: 'pixel A − pixel B', unlockedBy: null },
	{ id: 'negatif', label: 'Négatif', formula: 'chaque pixel : 255 − valeur', unlockedBy: 'scan' },
	{
		id: 'contraste',
		label: 'Contraste ×1.5',
		formula: 'chaque pixel : (valeur − 128) × 1.5 + 128',
		unlockedBy: 'synchro'
	}
];

/** PRNG déterministe (mulberry32) — le calque de bruit est identique partout, toujours. */
export function noiseAt(i: number): number {
	let t = (i + 0x6d2b79f5) | 0;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) % 96;
}

const clamp = (v: number) => Math.max(0, Math.min(255, v));

/** Applique une opération sur un canal (la Superposition soustrait le bruit). */
export function applyOp(op: ImageOp, value: number, pixelIndex: number): number {
	switch (op) {
		case 'luminosite':
			return clamp(value + 50);
		case 'superposition':
			return clamp(value - noiseAt(pixelIndex));
		case 'negatif':
			return clamp(255 - value);
		case 'contraste':
			return clamp((value - 128) * 1.5 + 128);
	}
}

/**
 * Dessine l'image ORIGINALE (placeholder synthétique, déterministe) :
 * un dégradé, des formes, et le « détail caché » que rien n'invite à regarder
 * en phase 1 (game-design §9) — remplaçable par un vrai visuel plus tard.
 */
export function drawOriginal(ctx: CanvasRenderingContext2D) {
	const grad = ctx.createLinearGradient(0, 0, IMAGE_W, IMAGE_H);
	grad.addColorStop(0, '#cfd8dc');
	grad.addColorStop(1, '#455a64');
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, IMAGE_W, IMAGE_H);

	// Un « tableau de salle de classe »
	ctx.fillStyle = '#263238';
	ctx.fillRect(24, 20, 144, 70);
	ctx.strokeStyle = '#eceff1';
	ctx.lineWidth = 2;
	ctx.strokeRect(24, 20, 144, 70);

	ctx.fillStyle = '#eceff1';
	ctx.font = '10px monospace';
	ctx.fillText('SALLE B14 — ÉVALUATION', 34, 40);
	ctx.fillText('promotion MMI1', 34, 54);

	// LE DÉTAIL CACHÉ (placeholder) : une date au coin du tableau
	ctx.font = '7px monospace';
	ctx.fillStyle = '#b0bec5';
	ctx.fillText('mise en service : 2019', 78, 84);

	// Un badge au premier plan
	ctx.fillStyle = '#eceff1';
	ctx.fillRect(30, 98, 52, 22);
	ctx.fillStyle = '#263238';
	ctx.font = '8px monospace';
	ctx.fillText('VIS-042', 38, 112);
}

/** Construit l'image DÉGRADÉE à partir de l'originale : aplatie, inversée, bruitée. */
export function degradePixel(original: number, pixelIndex: number): number {
	const flattened = clamp((original - 128) / 1.5 + 128);
	const inverted = 255 - flattened;
	return clamp(inverted + noiseAt(pixelIndex));
}

/** La seule séquence de restauration correcte (validée côté serveur). */
export const CORRECT_SEQUENCE: ImageOp[] = ['superposition', 'negatif', 'contraste'];
