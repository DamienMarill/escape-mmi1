<script lang="ts">
	// L'orbe d'IRIS — la présence visuelle de toutes ses prises de parole.
	// Canvas 2D + rAF : le rayon et le halo suivent l'énergie de la bande
	// vocale du MP3 en cours (orb-audio), la couleur et le tempérament viennent
	// d'orb-moods. Les silences la font retomber — c'est voulu (B1 §9).

	import { onMount } from 'svelte';
	import { moodFor } from '$lib/orb-moods';
	import { voiceEnergy } from '$lib/client/orb-audio.svelte';

	let { mood, size = 'clamp(12rem, 32vh, 22rem)' }: { mood: string; size?: string } = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();

	onMount(() => {
		const canvas = canvasEl;
		const ctx2d = canvas?.getContext('2d');
		if (!canvas || !ctx2d) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

		const first = moodFor(mood);
		let hue = first.hue;
		let chroma = first.chroma;
		let lightness = first.lightness;
		let energy = 0;
		let moodKey = mood;
		let evolveStart = performance.now();
		let raf = 0;

		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			const m = moodFor(mood);
			if (mood !== moodKey) {
				moodKey = mood;
				evolveStart = now;
			}
			const calm =
				reduced.matches || Boolean(canvas.closest('.game-root')?.classList.contains('calm'));
			const t = now / 1000;

			// Énergie vocale lissée : montée franche, retombée lente — en mode
			// calme, tout est amorti (variation lente, zéro sursaut).
			const target = voiceEnergy();
			const k = target > energy ? (calm ? 0.08 : 0.28) : calm ? 0.03 : 0.06;
			energy += (target - energy) * k;

			// La couleur glisse vers le mood courant, jamais de saut.
			hue += (m.hue - hue) * 0.02;
			chroma += (m.chroma - chroma) * 0.02;
			lightness += (m.lightness - lightness) * 0.02;

			// Évolutions d'épilogue (extinction / gel / départ).
			let evolveScale = 1;
			let evolveChromaK = 1;
			let alpha = 1;
			let agitation = m.agitation;
			if (m.evolve) {
				const e = (now - evolveStart) / 1000;
				if (m.evolve === 'extinction') {
					const f = Math.max(0, 1 - e / 30);
					evolveScale = 0.35 + 0.65 * f;
					alpha = Math.max(0, f);
				} else if (m.evolve === 'gel') {
					evolveChromaK = Math.max(0.25, 1 - e / 20);
					agitation = 0;
				} else {
					const f = Math.max(0, 1 - e / 30);
					evolveScale = f;
					alpha = 0.15 + 0.85 * f;
				}
			}
			if (calm) agitation = 0;

			const idle = m.idlePulse * (calm ? 0.4 : 1) * Math.sin((t * Math.PI * 2) / m.idleSpeed);
			const wobble =
				agitation *
				(0.3 + energy) *
				0.05 *
				(Math.sin(t * 7.3) + 0.6 * Math.sin(t * 11.7) + 0.4 * Math.sin(t * 17.1));
			const scale = Math.min(
				0.98,
				Math.max(0.04, (m.baseScale + idle + energy * m.reactivity + wobble) * evolveScale)
			);

			// Redimensionnement paresseux (DPR inclus).
			const dpr = window.devicePixelRatio || 1;
			const w = Math.round(canvas.clientWidth * dpr);
			const h = Math.round(canvas.clientHeight * dpr);
			if (w === 0 || h === 0) return;
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
			}

			const cx = w / 2;
			const cy = h / 2;
			const rMax = Math.min(w, h) / 2;
			const r = rMax * scale * 0.62;
			const c = chroma * evolveChromaK;

			ctx2d.clearRect(0, 0, w, h);

			// Halo — il respire avec la voix.
			const haloR = Math.min(rMax, r * (1.7 + energy * 0.9));
			const halo = ctx2d.createRadialGradient(cx, cy, r * 0.4, cx, cy, haloR);
			halo.addColorStop(0, `oklch(${lightness} ${c} ${hue} / ${0.35 * alpha})`);
			halo.addColorStop(1, `oklch(${lightness} ${c} ${hue} / 0)`);
			ctx2d.fillStyle = halo;
			ctx2d.beginPath();
			ctx2d.arc(cx, cy, haloR, 0, Math.PI * 2);
			ctx2d.fill();

			// Le corps — un cœur plus clair, une périphérie qui rejoint le fond.
			const core = ctx2d.createRadialGradient(cx - r * 0.15, cy - r * 0.15, r * 0.1, cx, cy, r);
			core.addColorStop(
				0,
				`oklch(${Math.min(0.95, lightness + 0.22)} ${c * 0.7} ${hue} / ${alpha})`
			);
			core.addColorStop(0.75, `oklch(${lightness} ${c} ${hue} / ${alpha})`);
			core.addColorStop(1, `oklch(${Math.max(0.1, lightness - 0.2)} ${c} ${hue} / ${alpha})`);
			ctx2d.fillStyle = core;
			ctx2d.beginPath();
			ctx2d.arc(cx, cy, r, 0, Math.PI * 2);
			ctx2d.fill();
		};

		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});
</script>

<div class="orb" style:width={size} style:height={size} data-testid="orb" data-mood={mood}>
	<canvas bind:this={canvasEl}></canvas>
</div>

<style>
	.orb {
		display: block;
	}

	canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
