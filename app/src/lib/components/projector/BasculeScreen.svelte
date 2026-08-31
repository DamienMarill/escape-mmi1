<script lang="ts">
	// Bascule non interactive (~90 s serveur). L'orbe naît ici, plein écran,
	// et pulse en direct sur bascule.mp3 (joué par ProjectorAudio). C'est la
	// première fois que quelque chose qui a un intérieur occupe le projecteur.
	import Orb from './Orb.svelte';
</script>

<div class="bascule-screen" data-testid="bascule-screen">
	<div class="orb-naissance">
		<Orb mood="bascule" size="min(70vh, 70vw)" />
	</div>
</div>

<style>
	.bascule-screen {
		display: flex;
		min-height: 100dvh;
		align-items: center;
		justify-content: center;
		background: black;
		overflow: hidden;
	}

	.orb-naissance {
		animation: orb-naissance 3s ease both;
	}

	@keyframes orb-naissance {
		from {
			opacity: 0;
			transform: scale(0.7);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	:global(.game-root.calm) .orb-naissance,
	:global(.no-transition) .orb-naissance {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.orb-naissance {
			animation: none;
		}
	}
</style>
