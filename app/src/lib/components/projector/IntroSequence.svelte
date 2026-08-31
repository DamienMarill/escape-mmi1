<script lang="ts">
	// Séquence d'introduction — remplace intro.mp4 (A1 §6 : 4 plans, montage au
	// cut, pictogrammes type consignes de sécurité en vol). La timeline vit dans
	// $lib/intro-timeline.ts : c'est là qu'on cale les cues sur l'audio généré.
	//
	// Pilotage : l'audio /assets/audio/intro.mp3 joue en autoplay (muet tant que
	// le projecteur n'est pas armé, comme la vidéo avant lui) et la timeline lit
	// audio.currentTime — la synchronisation suit le fichier, quel que soit son
	// montage. Si l'audio ne peut pas jouer, repli sur l'horloge.

	import { onMount } from 'svelte';
	import { cueAt, INTRO_FALLBACK_DURATION_S } from '$lib/intro-timeline';

	// `timeOverride` (secondes) : mode piloté par la régie (/regie) — pas
	// d'audio interne ni de fin automatique, la séquence devient une pure
	// fonction du temps fourni.
	let {
		armed,
		onEnded,
		timeOverride = null
	}: { armed: boolean; onEnded: () => void; timeOverride?: number | null } = $props();

	let audioEl: HTMLAudioElement | undefined = $state();
	let t = $state(0);
	let clockMode = $state(false);
	let done = false;

	function finish() {
		if (done) return;
		done = true;
		onEnded();
	}

	onMount(() => {
		if (timeOverride !== null) return;
		const startedAt = performance.now();
		let raf = 0;
		const loop = () => {
			if (clockMode || !audioEl || audioEl.error) {
				t = (performance.now() - startedAt) / 1000;
				if (t >= INTRO_FALLBACK_DURATION_S) {
					finish();
					return;
				}
			} else {
				t = audioEl.currentTime;
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});

	function onAudioBroken() {
		clockMode = true;
	}

	let cue = $derived(cueAt(timeOverride ?? t));
	let interdite = $derived(
		cue.visual === 'consigne-hauteur' ||
			cue.visual === 'consigne-cable' ||
			cue.visual === 'consigne-console'
	);
</script>

<div class="intro-screen" data-testid="intro-screen">
	{#if timeOverride === null}
		<audio
			bind:this={audioEl}
			src="/assets/audio/intro.mp3"
			autoplay
			muted={!armed}
			onended={finish}
			onerror={onAudioBroken}
		></audio>
	{/if}

	{#key cue.visual}
		<div class="intro-plan" data-visual={cue.visual}>
			{#if cue.visual === 'logo'}
				<img class="intro-picto intro-picto--large" src="/assets/svg/intro/logo-iris.svg" alt="" />
			{:else if cue.visual === 'salle'}
				<img
					class="intro-picto intro-picto--large"
					src="/assets/svg/intro/salle-dessus.svg"
					alt=""
				/>
			{:else if cue.visual === 'epreuves'}
				<div class="intro-epreuves">
					<div class="intro-cadenas-row">
						<img src="/assets/svg/intro/cadenas.svg" alt="" />
						<img src="/assets/svg/intro/cadenas.svg" alt="" />
						<img src="/assets/svg/intro/cadenas.svg" alt="" />
					</div>
					<img class="intro-cadran" src="/assets/svg/intro/cadran-30min.svg" alt="" />
				</div>
			{:else if cue.visual === 'cloture'}
				<div class="intro-cloture">
					<img class="intro-picto" src="/assets/svg/intro/logo-iris.svg" alt="" />
					<p class="intro-mention">ÉVALUATION D'ENTRÉE — PROMOTION MMI1</p>
				</div>
			{:else}
				<img
					class="intro-picto intro-picto--large"
					class:intro-picto--interdit={interdite}
					src="/assets/svg/intro/{cue.visual}.svg"
					alt=""
				/>
			{/if}
		</div>
	{/key}

	{#if cue.subtitle}
		<p class="intro-subtitle" data-testid="intro-subtitle">{cue.subtitle}</p>
	{/if}
</div>

<style>
	.intro-screen {
		position: relative;
		display: flex;
		min-height: 100dvh;
		align-items: center;
		justify-content: center;
		background: oklch(0.12 0.015 250);
		font-family: var(--font-mono, monospace);
	}

	.intro-plan {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.intro-picto {
		width: clamp(16rem, 38vh, 30rem);
		height: auto;
	}

	.intro-picto--large {
		width: clamp(18rem, 48vh, 34rem);
	}

	.intro-epreuves {
		display: flex;
		align-items: center;
		gap: clamp(2rem, 6vw, 5rem);
	}

	.intro-cadenas-row {
		display: flex;
		gap: clamp(1rem, 3vw, 2.5rem);
	}

	.intro-cadenas-row img {
		width: clamp(5rem, 11vh, 9rem);
	}

	.intro-cadran {
		width: clamp(10rem, 26vh, 16rem);
	}

	.intro-cloture {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		animation: intro-fondu 1.2s ease both;
	}

	.intro-mention {
		font-size: clamp(1.1rem, 2.2vw, 1.8rem);
		font-weight: 700;
		letter-spacing: 0.25em;
		text-transform: uppercase;
		color: oklch(0.9 0.01 250);
	}

	.intro-subtitle {
		position: absolute;
		inset-inline: 0;
		bottom: clamp(2rem, 7vh, 4.5rem);
		margin-inline: auto;
		max-width: 62rem;
		padding-inline: 2rem;
		text-align: center;
		font-size: clamp(1.1rem, 2.1vw, 1.7rem);
		line-height: 1.5;
		color: oklch(0.93 0.01 250);
		text-wrap: balance;
	}

	@keyframes intro-fondu {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Montage au cut — aucun flash ; en mode calme ou reduced-motion, on coupe
	   aussi le fondu de clôture (les SVG gèrent leur propre reduced-motion). */
	:global(.game-root.calm) .intro-cloture,
	:global(.no-transition) .intro-cloture {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.intro-cloture {
			animation: none;
		}
	}
</style>
