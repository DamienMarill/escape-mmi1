<script lang="ts">
	let { armed, onEnded }: { armed: boolean; onEnded: () => void } = $props();
</script>

<div class="intro-screen">
	<video
		src="/assets/video/intro.mp4"
		autoplay
		playsinline
		muted={!armed}
		onended={onEnded}
		class="intro-video"
	></video>
</div>

<style>
	.intro-screen {
		display: flex;
		min-height: 100dvh;
		align-items: center;
		justify-content: center;
		background: black;
	}

	.intro-video {
		width: 100%;
		height: 100dvh;
		object-fit: contain;
	}
</style>
