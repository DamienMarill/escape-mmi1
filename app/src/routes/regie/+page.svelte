<script lang="ts">
	// RÉGIE — lecteur de scènes pour caler l'audio sans jouer une partie.
	// Chaque scène rend les VRAIS composants du projecteur, pilotés par un
	// lecteur audio scrubbable : on vérifie la synchro en déplaçant le curseur.
	// Outil MJ/dev uniquement (garde par clé, comme /mj).

	import { onMount } from 'svelte';
	import { INTRO_CUES } from '$lib/intro-timeline';
	import { BASCULE_VOICE_AT_S } from '$lib/audio-cues';
	import { BASCULE_GLITCH_MS, display } from '$lib/components/overlay/display.svelte';
	import { initAnalyser, orbAudio, resumeAnalyser } from '$lib/client/orb-audio.svelte';
	import type { PublicState } from '$lib/types';
	import IntroSequence from '$lib/components/projector/IntroSequence.svelte';
	import ValidatingSequence from '$lib/components/projector/ValidatingSequence.svelte';
	import BasculeScreen from '$lib/components/projector/BasculeScreen.svelte';
	import Phase2Screen from '$lib/components/projector/Phase2Screen.svelte';
	import EpilogueScreen from '$lib/components/projector/EpilogueScreen.svelte';

	type Scene = 'intro' | 'a9b1' | 'manifs' | 'fins';
	const SCENES: { id: Scene; label: string }[] = [
		{ id: 'intro', label: 'Intro (A1)' },
		{ id: 'a9b1', label: 'Validation + bascule (A9-B1)' },
		{ id: 'manifs', label: 'Manifestations (C8)' },
		{ id: 'fins', label: 'Fins (B2-B4)' }
	];
	const SCENE_SRC: Partial<Record<Scene, string>> = {
		intro: '/assets/audio/intro.mp3',
		a9b1: '/assets/audio/validation-bascule.mp3'
	};
	const MANIF_IDS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

	let scene = $state<Scene>('intro');
	let audioEl: HTMLAudioElement | undefined = $state();
	let t = $state(0);
	let duration = $state(0);
	let playing = $state(false);
	let finChoice = $state<'A' | 'B' | 'C' | null>(null);

	// États factices pour rendre les écrans hors partie (aucune donnée serveur).
	const mockNow = Date.now();
	const phase2Mock = {
		serverNow: mockNow,
		chrono: { running: true, elapsedMs: 17 * 60_000, changedAt: mockNow, durationMs: 30 * 60_000 },
		exfil: { startedAtMs: 17 * 60_000, durationMs: 13 * 60_000, frozenAtMs: null },
		terminal: {
			stage: 'auth',
			authTaunt: null,
			coreContent: null,
			parentLocks: { x: true, r: true }
		}
	} as unknown as PublicState;

	function epilogueMock(ending: 'A' | 'B' | 'C'): PublicState {
		return { restitution: false, ending, sessionHistory: [] } as unknown as PublicState;
	}

	/** Le clic qui déclenche est aussi le geste qui autorise le Web Audio. */
	function arm() {
		if (!audioEl) return;
		initAnalyser(audioEl);
		resumeAnalyser();
	}

	function setScene(next: Scene) {
		scene = next;
		finChoice = null;
		orbAudio.currentVoice = null;
		if (!audioEl) return;
		audioEl.pause();
		const src = SCENE_SRC[next];
		if (src) {
			audioEl.src = src;
			audioEl.currentTime = 0;
		}
	}

	function togglePlay() {
		if (!audioEl) return;
		arm();
		if (audioEl.paused) void audioEl.play();
		else audioEl.pause();
	}

	function seek(value: number) {
		if (audioEl) audioEl.currentTime = value;
	}

	function playFile(src: string, voice: string | null) {
		if (!audioEl) return;
		arm();
		audioEl.src = src;
		audioEl.currentTime = 0;
		orbAudio.currentVoice = voice;
		void audioEl.play();
	}

	function playManif(id: string) {
		playFile(`/assets/audio/manif-${id}.mp3`, `manif-${id}`);
	}

	function playFin(letter: 'A' | 'B' | 'C') {
		finChoice = letter;
		playFile(`/assets/audio/fin-${letter.toLowerCase()}.mp3`, `fin-${letter.toLowerCase()}`);
	}

	function fmt(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${String(s).padStart(2, '0')}`;
	}

	// Aperçu du glitch de bascule : rejoue le VRAI overlay monté par le layout
	// (mêmes couche, CSS et durée qu'en salle), sans toucher à l'état serveur.
	let glitchPreviewTimer: ReturnType<typeof setTimeout> | undefined;
	function previewGlitch() {
		clearTimeout(glitchPreviewTimer);
		display.glitching = true;
		glitchPreviewTimer = setTimeout(() => (display.glitching = false), BASCULE_GLITCH_MS);
	}

	onMount(() => {
		if (audioEl) audioEl.src = SCENE_SRC.intro!;
		let raf = 0;
		const loop = () => {
			raf = requestAnimationFrame(loop);
			if (!audioEl) return;
			t = audioEl.currentTime;
			duration = Number.isFinite(audioEl.duration) ? audioEl.duration : 0;
			playing = !audioEl.paused && !audioEl.ended;
			// Le changement de voix du fichier fusionné, comme en salle.
			if (scene === 'a9b1') {
				orbAudio.currentVoice = t >= BASCULE_VOICE_AT_S ? 'bascule' : null;
			}
		};
		raf = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(raf);
			orbAudio.currentVoice = null;
		};
	});

	// Palette de phase simulée (le layout ne suit pas de vraie partie ici).
	let simPhase2 = $derived(
		scene === 'manifs' || scene === 'fins' || (scene === 'a9b1' && t >= BASCULE_VOICE_AT_S)
	);
	let hasTransport = $derived(scene === 'intro' || scene === 'a9b1');
</script>

<div
	class="regie"
	style:--game-bg={simPhase2 ? 'oklch(0.12 0.03 25)' : 'oklch(0.18 0.02 250)'}
	style:--game-fg={simPhase2 ? 'oklch(0.94 0.02 40)' : 'oklch(0.95 0.01 250)'}
	style:--game-accent={simPhase2 ? 'oklch(0.58 0.19 25)' : 'oklch(0.62 0.14 240)'}
>
	<audio bind:this={audioEl}></audio>

	<div class="stage">
		{#if scene === 'intro'}
			<IntroSequence armed={true} onEnded={() => {}} timeOverride={t} />
		{:else if scene === 'a9b1'}
			{#if t < BASCULE_VOICE_AT_S}
				<ValidatingSequence timeOverride={t} />
			{:else}
				<BasculeScreen />
			{/if}
		{:else if scene === 'manifs'}
			<Phase2Screen publicState={phase2Mock} />
		{:else if finChoice}
			<EpilogueScreen publicState={epilogueMock(finChoice)} />
		{:else}
			<div class="stage-empty"><p>Choisis une fin ci-dessous.</p></div>
		{/if}
	</div>

	<div class="control-bar">
		<div class="row">
			<span class="brand">RÉGIE</span>
			{#each SCENES as s (s.id)}
				<button type="button" class="chip" class:on={scene === s.id} onclick={() => setScene(s.id)}>
					{s.label}
				</button>
			{/each}
			<button
				type="button"
				class="chip"
				class:on={display.glitching}
				data-testid="regie-glitch-btn"
				onclick={previewGlitch}
			>
				⚡ Glitch bascule
			</button>
		</div>

		{#if hasTransport}
			<div class="row">
				<button type="button" class="chip play" onclick={togglePlay}>
					{playing ? '❚❚' : '►'}
				</button>
				<span class="time">{fmt(t)} / {fmt(duration)}</span>
				<input
					class="scrub"
					type="range"
					min="0"
					max={duration || 1}
					step="0.1"
					value={t}
					oninput={(e) => seek(Number(e.currentTarget.value))}
				/>
			</div>
			<div class="row cues">
				{#if scene === 'intro'}
					{#each INTRO_CUES as cue, i (i)}
						<button type="button" class="chip tiny" onclick={() => seek(cue.at)}>
							{cue.at}s · {cue.visual.replace('consigne-', '⚠ ')}
						</button>
					{/each}
				{:else}
					{#each [0, 5, 10, 15] as at (at)}
						<button type="button" class="chip tiny" onclick={() => seek(at)}>
							{at}s · palier {at / 5 + 1}
						</button>
					{/each}
					<button type="button" class="chip tiny" onclick={() => seek(BASCULE_VOICE_AT_S)}>
						{BASCULE_VOICE_AT_S}s · IRIS parle
					</button>
				{/if}
			</div>
		{:else if scene === 'manifs'}
			<div class="row cues">
				{#each MANIF_IDS as id (id)}
					<button
						type="button"
						class="chip tiny"
						class:on={orbAudio.currentVoice === `manif-${id}`}
						onclick={() => playManif(id)}
					>
						{id}
					</button>
				{/each}
				<span class="time">l'orbe respire en idle entre deux lectures</span>
			</div>
		{:else}
			<div class="row cues">
				{#each ['A', 'B', 'C'] as const as letter (letter)}
					<button
						type="button"
						class="chip"
						class:on={finChoice === letter}
						onclick={() => playFin(letter)}
					>
						Fin {letter}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.regie {
		min-height: 100dvh;
		background: var(--game-bg);
		color: var(--game-fg);
	}

	.stage {
		height: 100dvh;
		overflow: hidden;
	}

	.stage-empty {
		display: flex;
		min-height: 100dvh;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono, monospace);
		opacity: 0.6;
	}

	.control-bar {
		position: fixed;
		inset-inline: 0;
		bottom: 0;
		z-index: 50;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: color-mix(in oklch, black 78%, transparent);
		backdrop-filter: blur(6px);
		font-family: var(--font-mono, monospace);
		font-size: 0.8rem;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.brand {
		font-weight: 700;
		letter-spacing: 0.25em;
		opacity: 0.6;
		margin-right: 0.5rem;
	}

	.chip {
		border: 1px solid color-mix(in oklch, var(--game-fg) 30%, transparent);
		border-radius: 0.375rem;
		padding: 0.3rem 0.7rem;
		color: var(--game-fg);
		background: transparent;
		cursor: pointer;
	}

	.chip:hover {
		border-color: var(--game-accent);
	}

	.chip.on {
		background: color-mix(in oklch, var(--game-accent) 30%, transparent);
		border-color: var(--game-accent);
	}

	.chip.tiny {
		padding: 0.15rem 0.5rem;
		font-size: 0.7rem;
		opacity: 0.9;
	}

	.chip.play {
		min-width: 3rem;
		text-align: center;
	}

	.time {
		font-variant-numeric: tabular-nums;
		opacity: 0.7;
		white-space: nowrap;
	}

	.scrub {
		flex: 1;
		min-width: 10rem;
		accent-color: var(--game-accent);
	}
</style>
