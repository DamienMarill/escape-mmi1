<script lang="ts">
	// Seul écran vu par toute la salle, seule source sonore (game-design §8).
	// La connexion SSE est démarrée par +layout.svelte (asPost: false ici).

	import { connection } from '$lib/client/connection.svelte';
	import ProjectorAudio from '$lib/components/projector/ProjectorAudio.svelte';
	import IdleScreen from '$lib/components/projector/IdleScreen.svelte';
	import IntroSequence from '$lib/components/projector/IntroSequence.svelte';
	import Phase1Screen from '$lib/components/projector/Phase1Screen.svelte';
	import BasculeScreen from '$lib/components/projector/BasculeScreen.svelte';
	import Phase2Screen from '$lib/components/projector/Phase2Screen.svelte';
	import EpilogueScreen from '$lib/components/projector/EpilogueScreen.svelte';

	let armed = $state(false);
	let audioRef: ReturnType<typeof ProjectorAudio> | undefined = $state();

	function onIntroEnded() {
		connection.act({ type: 'projector/introEnded' });
	}
</script>

<div class="projector-page">
	<ProjectorAudio bind:this={audioRef} bind:armed />

	{#if !connection.state || connection.state.phase === 'idle'}
		<IdleScreen {armed} onArm={() => audioRef?.tryUnlock()} />
	{:else if connection.state.phase === 'intro'}
		<IntroSequence {armed} onEnded={onIntroEnded} />
	{:else if connection.state.phase === 'phase1'}
		<Phase1Screen publicState={connection.state} />
	{:else if connection.state.phase === 'bascule'}
		<BasculeScreen />
	{:else if connection.state.phase === 'phase2'}
		<Phase2Screen publicState={connection.state} />
	{:else if connection.state.phase === 'epilogue'}
		<EpilogueScreen publicState={connection.state} />
	{/if}
</div>

<style>
	.projector-page {
		min-height: 100dvh;
	}
</style>
