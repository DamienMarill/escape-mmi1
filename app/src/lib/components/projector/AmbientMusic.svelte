<script lang="ts">
	// Musiques d'ambiance du projecteur — deux lits sonores en boucle, à bas
	// volume (AMBIENT_VOLUME), avec fondus d'entrée/sortie :
	//   · phase 1 : de la fin de l'intro au lancement de la séquence de
	//     validation (le fichier fusionné A9-B1 joue ensuite sans lit dessous) ;
	//   · phase 2 : de la fin de la bascule à l'épilogue.
	// Éléments <audio> séparés de celui des annonces : ils ne passent PAS par
	// l'analyseur de l'orbe (un lit musical la ferait pulser en continu, B1 §9).

	import { onMount } from 'svelte';
	import { connection } from '$lib/client/connection.svelte';
	import { AMBIENT_VOLUME } from '$lib/audio-cues';

	let { armed }: { armed: boolean } = $props();

	let phase1El: HTMLAudioElement | undefined = $state();
	let phase2El: HTMLAudioElement | undefined = $state();

	onMount(() => {
		const id = setInterval(() => {
			const pub = connection.state;
			const phase = pub?.phase;
			const wantPhase1 = armed && phase === 'phase1' && pub?.finale !== 'validating';
			const wantPhase2 = armed && phase === 'phase2';
			ramp(phase1El, wantPhase1);
			ramp(phase2El, wantPhase2);
		}, 100);
		return () => clearInterval(id);
	});

	/** Fondu de ~2 s vers le volume cible ; pause une fois retombé à zéro. */
	function ramp(el: HTMLAudioElement | undefined, wanted: boolean) {
		if (!el) return;
		const target = wanted ? AMBIENT_VOLUME : 0;
		if (wanted && el.paused) {
			el.volume = 0;
			void el.play().catch(() => {});
		}
		const step = AMBIENT_VOLUME / 20;
		if (el.volume < target) el.volume = Math.min(target, el.volume + step);
		else if (el.volume > target) el.volume = Math.max(target, el.volume - step);
		if (!wanted && el.volume === 0 && !el.paused) el.pause();
	}
</script>

<audio bind:this={phase1El} src="/assets/audio/ambiance-phase1.mp3" loop preload="auto"></audio>
<audio bind:this={phase2El} src="/assets/audio/ambiance-phase2.mp3" loop preload="auto"></audio>
