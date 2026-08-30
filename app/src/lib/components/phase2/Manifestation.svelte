<script lang="ts">
	// Interventions textuelles de l'IA (game-design §9) — signature visuelle
	// CONSTANTE (glyphe ▓ + ambre) pour ne jamais être confondue avec un bug.
	// pointer-events: none — ne mange jamais un clic (leçon du §14).
	import { connection } from '$lib/client/connection.svelte';

	let lastSeq = $state<number | null>(null);
	let visibleText = $state<string | null>(null);
	let firstSync = true;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const m = connection.state?.manifestation;
		if (!m) return;
		if (firstSync) {
			// À la première synchro : on n'affiche pas la manifestation courante
			firstSync = false;
			lastSeq = m.seq;
			return;
		}
		if (m.seq !== lastSeq) {
			lastSeq = m.seq;
			visibleText = m.text;
			clearTimeout(hideTimer);
			hideTimer = setTimeout(() => (visibleText = null), 8_000);
		}
	});
	// Au tout premier état reçu sans manifestation, la synchro est faite aussi
	$effect(() => {
		if (connection.state && firstSync && !connection.state.manifestation) firstSync = false;
	});
</script>

<div
	class="manifestation fixed inset-x-0 top-0 z-50 flex justify-center"
	data-testid="manifestation"
	data-visible={visibleText !== null}
	style="pointer-events: none"
>
	{#if visibleText}
		<p
			class="ia-signature m-4 max-w-3xl border border-amber-500/40 bg-black/80 px-6 py-3 text-center font-mono text-base text-amber-400 italic"
		>
			▓ {visibleText}
		</p>
	{/if}
</div>

<style>
	.ia-signature {
		animation: ia-flicker 2.8s ease-in-out infinite;
	}
	@keyframes ia-flicker {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.82;
		}
	}
	:global(.game-root.calm) .ia-signature,
	:global(.no-transition) .ia-signature {
		animation: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.ia-signature {
			animation: none;
		}
	}
</style>
