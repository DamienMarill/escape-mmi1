<script lang="ts">
	// État visuel AMBIANCE (game-design §10) : texte qui s'écrit et s'efface
	// sur fond quasi noir, aucune structure, aucune zone d'interaction.
	import { onMount } from 'svelte';
	import { AMBIANCE_FRAGMENTS } from '$lib/phase2-data';

	let { fragment }: { fragment: 'synchro' | 'scan' } = $props();

	// Le fragment d'un poste ne change pas en cours de phase 2 : capture initiale voulue.
	let text = $derived(AMBIANCE_FRAGMENTS[fragment]);
	let shown = $state('');
	let fading = $state(false);
	let reduced = $state(false);

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || document.documentElement.querySelector('.game-root.calm')) {
			shown = text;
			return;
		}
		let i = 0;
		let timer: ReturnType<typeof setInterval> | undefined;
		let pause: ReturnType<typeof setTimeout> | undefined;
		const startCycle = () => {
			i = 0;
			shown = '';
			fading = false;
			timer = setInterval(() => {
				i += 1;
				shown = text.slice(0, i);
				if (i >= text.length) {
					clearInterval(timer);
					pause = setTimeout(() => {
						fading = true;
						pause = setTimeout(startCycle, 2_500);
					}, 6_000);
				}
			}, 60);
		};
		startCycle();
		return () => {
			if (timer) clearInterval(timer);
			if (pause) clearTimeout(pause);
		};
	});
</script>

<div
	class="ambiance flex min-h-[60vh] items-center justify-center p-12"
	data-testid="phase2-ambiance-{fragment}"
>
	<p
		class="max-w-xl text-center font-mono text-lg leading-loose italic"
		class:is-fading={fading}
		style="opacity: 0.6"
	>
		{shown}
	</p>
</div>

<style>
	.ambiance {
		background: rgba(0, 0, 0, 0.55);
	}
	.ambiance p {
		transition: opacity 2.4s ease;
	}
	.ambiance p.is-fading {
		opacity: 0 !important;
	}
</style>
