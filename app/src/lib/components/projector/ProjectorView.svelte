<script lang="ts">
	// L'expérience projecteur complète — seule source sonore de la salle.
	// Rendue par la route /projector ET par la page racine quand le poste a
	// reçu le rôle « projecteur » depuis la console MJ (une seule URL à ouvrir
	// sur toutes les machines, le rôle fait le reste).

	import { connection } from '$lib/client/connection.svelte';
	import AmbientMusic from './AmbientMusic.svelte';
	import ProjectorAudio from './ProjectorAudio.svelte';
	import IdleScreen from './IdleScreen.svelte';
	import IntroSequence from './IntroSequence.svelte';
	import Phase1Screen from './Phase1Screen.svelte';
	import BasculeScreen from './BasculeScreen.svelte';
	import Phase2Screen from './Phase2Screen.svelte';
	import EpilogueScreen from './EpilogueScreen.svelte';

	let armed = $state(false);
	let audioRef: ReturnType<typeof ProjectorAudio> | undefined = $state();

	function onIntroEnded() {
		connection.act({ type: 'projector/introEnded' });
	}
</script>

<div class="projector-page">
	<ProjectorAudio bind:this={audioRef} bind:armed />
	<AmbientMusic {armed} />

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
