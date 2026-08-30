<script lang="ts">
	// Bascule non interactive (~90 s serveur). La vidéo peut finir avant : on
	// reste alors sur un écran statique inquiétant.

	let ended = $state(false);
</script>

<div class="bascule-screen">
	{#if !ended}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			src="/assets/video/bascule.mp4"
			autoplay
			playsinline
			onended={() => (ended = true)}
			class="bascule-video"
		></video>
	{:else}
		<div class="bascule-static">
			<p class="glitch-text">CONNEXION INTERROMPUE</p>
		</div>
	{/if}
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

	.bascule-video {
		width: 100%;
		height: 100dvh;
		object-fit: cover;
	}

	.bascule-static {
		display: flex;
		min-height: 100dvh;
		width: 100%;
		align-items: center;
		justify-content: center;
		background: repeating-linear-gradient(
			0deg,
			oklch(0.08 0.02 25) 0px,
			oklch(0.1 0.03 25) 2px,
			oklch(0.06 0.01 25) 4px
		);
	}

	.glitch-text {
		font-family: var(--font-mono, monospace);
		font-size: clamp(2rem, 5vw, 4.5rem);
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: oklch(0.75 0.2 25);
		animation: glitch-shake 180ms infinite;
	}

	@keyframes glitch-shake {
		0% {
			transform: translate(0, 0);
			text-shadow:
				2px 0 oklch(0.7 0.25 25 / 0.7),
				-2px 0 oklch(0.7 0.1 200 / 0.7);
		}
		50% {
			transform: translate(-1px, 1px);
			text-shadow:
				-2px 0 oklch(0.7 0.25 25 / 0.7),
				2px 0 oklch(0.7 0.1 200 / 0.7);
		}
		100% {
			transform: translate(1px, -1px);
			text-shadow:
				2px 0 oklch(0.7 0.25 25 / 0.7),
				-2px 0 oklch(0.7 0.1 200 / 0.7);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.glitch-text {
			animation: none;
		}
	}
</style>
