<script lang="ts">
	// Poste IMAGE — « Traitement » (game-design §6 P2).
	// Le canvas n'est qu'une visualisation ; la validation de la séquence est
	// côté serveur (image/submit). Chaque opération est appliquée canal par
	// canal (R, G, B) avec le même index de pixel — c'est le cœur pédagogique
	// du poste : l'outil EST une opération arithmétique, affichée en clair.
	import { connection } from '$lib/client/connection.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		IMAGE_W,
		IMAGE_H,
		IMAGE_OPS,
		applyOp,
		drawOriginal,
		degradePixel,
		noiseAt,
		type ImageOp,
		type OpInfo
	} from '$lib/image-data';
	import { REQUIRED_LOCKS } from '$lib/systeme-data';

	let pub = $derived(connection.state);
	let solved = $derived(pub?.epreuves.image.solved ?? false);

	let mainCanvas = $state<HTMLCanvasElement | undefined>(undefined);
	let noiseCanvas = $state<HTMLCanvasElement | undefined>(undefined);

	// Copie des pixels DÉGRADÉS, gardée hors-état pour permettre la réinitialisation.
	let degradedPixels: Uint8ClampedArray | null = null;
	// Image courante, mutée directement à chaque application d'opération.
	let currentImage: ImageData | null = null;

	let history = $state<ImageOp[]>([]);
	let feedback = $state<string | null>(null);
	let submitting = $state(false);

	function buildDegraded(ctx: CanvasRenderingContext2D): ImageData {
		drawOriginal(ctx);
		const img = ctx.getImageData(0, 0, IMAGE_W, IMAGE_H);
		const data = img.data;
		for (let i = 0; i < IMAGE_W * IMAGE_H; i++) {
			const o = i * 4;
			data[o] = degradePixel(data[o], i);
			data[o + 1] = degradePixel(data[o + 1], i);
			data[o + 2] = degradePixel(data[o + 2], i);
		}
		return img;
	}

	// Construction initiale (ou reconstruction à la reconnexion) du canvas principal.
	$effect(() => {
		if (!mainCanvas) return;
		const ctx = mainCanvas.getContext('2d');
		if (!ctx) return;
		if (solved) {
			// Épreuve déjà résolue à la reconnexion : impossible de rejouer l'historique,
			// on affiche directement l'image restaurée (= l'originale).
			drawOriginal(ctx);
		} else {
			const degradedImg = buildDegraded(ctx);
			degradedPixels = new Uint8ClampedArray(degradedImg.data);
			currentImage = new ImageData(new Uint8ClampedArray(degradedImg.data), IMAGE_W, IMAGE_H);
			ctx.putImageData(currentImage, 0, 0);
		}
	});

	// Vignette du calque de bruit — le « pixel B » de la Superposition, en niveaux de gris.
	$effect(() => {
		if (!noiseCanvas || solved) return;
		const ctx = noiseCanvas.getContext('2d');
		if (!ctx) return;
		const img = ctx.createImageData(IMAGE_W, IMAGE_H);
		const data = img.data;
		for (let i = 0; i < IMAGE_W * IMAGE_H; i++) {
			const v = noiseAt(i);
			const o = i * 4;
			data[o] = v;
			data[o + 1] = v;
			data[o + 2] = v;
			data[o + 3] = 255;
		}
		ctx.putImageData(img, 0, 0);
	});

	function isLocked(op: OpInfo): boolean {
		if (!op.unlockedBy) return false;
		return !(pub?.tasks[op.unlockedBy]?.solved ?? false);
	}

	function apply(op: OpInfo) {
		if (isLocked(op) || !mainCanvas || !currentImage) return;
		const ctx = mainCanvas.getContext('2d');
		if (!ctx) return;
		const data = currentImage.data;
		for (let i = 0; i < IMAGE_W * IMAGE_H; i++) {
			const o = i * 4;
			data[o] = applyOp(op.id, data[o], i);
			data[o + 1] = applyOp(op.id, data[o + 1], i);
			data[o + 2] = applyOp(op.id, data[o + 2], i);
		}
		ctx.putImageData(currentImage, 0, 0);
		history = [...history, op.id];
		feedback = null;
	}

	function reset() {
		if (!mainCanvas || !degradedPixels) return;
		const ctx = mainCanvas.getContext('2d');
		if (!ctx) return;
		currentImage = new ImageData(new Uint8ClampedArray(degradedPixels), IMAGE_W, IMAGE_H);
		ctx.putImageData(currentImage, 0, 0);
		history = [];
		feedback = null;
	}

	async function submit() {
		submitting = true;
		const res = await connection.act({ type: 'image/submit', ops: history });
		submitting = false;
		if (!res.ok) feedback = res.error ?? 'la restauration ne correspond pas encore';
	}

	function opLabel(id: ImageOp): string {
		return IMAGE_OPS.find((o) => o.id === id)?.label ?? id;
	}
</script>

<div data-testid="epreuve-image">
	{#if solved}
		<div class="flex flex-col items-center gap-4 p-8" data-testid="image-solved">
			<p class="font-mono text-lg tracking-widest uppercase opacity-70">Image restaurée</p>
			<div class="relative">
				<canvas
					bind:this={mainCanvas}
					width={IMAGE_W}
					height={IMAGE_H}
					class="border"
					style="border-color: var(--game-accent); width: {IMAGE_W * 3}px; height: {IMAGE_H *
						3}px; image-rendering: pixelated;"
				></canvas>

				<div class="absolute inset-x-0 top-0 flex justify-center p-3">
					<div
						class="border bg-black/90 p-4 font-mono text-xs"
						style="border-color: var(--game-accent)"
						data-testid="image-schema"
					>
						<h2 class="mb-2 text-[0.65rem] tracking-[0.3em] uppercase opacity-70">
							Schéma des verrous — poste système
						</h2>
						<ul class="space-y-0.5">
							{#each REQUIRED_LOCKS as lock (lock)}
								<li>
									<span class="font-bold">{lock.startsWith('x:') ? 'x' : 'r'}</span>
									&nbsp;&nbsp;{lock.slice(2)}
								</li>
							{/each}
						</ul>
						<p class="mt-3 opacity-60">→ poste système</p>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="grid w-full max-w-6xl gap-8 p-6 lg:grid-cols-[2fr_1fr]">
			<section class="space-y-4">
				<div class="flex flex-wrap items-start gap-6">
					<div>
						<h2 class="mb-2 text-xs tracking-[0.3em] uppercase opacity-60">Image</h2>
						<canvas
							bind:this={mainCanvas}
							width={IMAGE_W}
							height={IMAGE_H}
							class="border"
							style="border-color: var(--game-accent); width: {IMAGE_W * 3}px; height: {IMAGE_H *
								3}px; image-rendering: pixelated;"
						></canvas>
					</div>
					<div>
						<h2 class="mb-2 text-xs tracking-[0.3em] uppercase opacity-60">Calque de bruit</h2>
						<canvas
							bind:this={noiseCanvas}
							width={IMAGE_W}
							height={IMAGE_H}
							class="border border-white/20"
							style="width: {IMAGE_W}px; height: {IMAGE_H}px; image-rendering: pixelated;"
						></canvas>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<Button variant="outline" onclick={reset} data-testid="img-reset">Réinitialiser</Button>
					<Button onclick={submit} disabled={submitting} data-testid="img-submit"
						>Transmettre</Button
					>
				</div>

				{#if feedback}
					<p class="font-mono text-sm opacity-80" data-testid="img-feedback">{feedback}</p>
				{/if}

				<div>
					<h2 class="mb-2 text-xs tracking-[0.3em] uppercase opacity-60">Historique</h2>
					<div class="flex flex-wrap gap-2" data-testid="img-history">
						{#each history as op, i (i)}
							<Badge variant="outline">{opLabel(op)}</Badge>
						{/each}
					</div>
				</div>
			</section>

			<aside class="space-y-3 font-mono text-sm">
				<h2 class="mb-2 text-xs tracking-[0.3em] uppercase opacity-60">Opérations</h2>
				{#each IMAGE_OPS as op (op.id)}
					{@const locked = isLocked(op)}
					<button
						type="button"
						class="w-full border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40"
						style="border-color: {locked ? 'rgba(255,255,255,0.15)' : 'var(--game-accent)'}"
						disabled={locked}
						onclick={() => apply(op)}
						data-testid="img-op-{op.id}"
					>
						<div class="flex flex-wrap items-baseline justify-between gap-x-3">
							<span class="font-bold">{op.label}</span>
							<span class="text-xs opacity-70">{op.formula}</span>
						</div>
						{#if locked}
							<div class="mt-1 text-xs opacity-50">verrouillé · source : un poste TÂCHE</div>
						{/if}
					</button>
				{/each}
			</aside>
		</div>
	{/if}
</div>
