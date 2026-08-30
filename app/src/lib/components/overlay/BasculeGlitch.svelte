<script lang="ts">
	// Glitch plein écran de la bascule (game-design §14, « La bascule synchronisée »).
	// CSS uniquement. En mode calme (.calm posé sur .game-root) ou sous
	// prefers-reduced-motion, layout.css remplace les animations par un simple fondu au noir.
	import { display } from './display.svelte';
</script>

<div
	class="bascule-glitch"
	class:is-active={display.glitching}
	data-testid="bascule-glitch"
	data-active={display.glitching}
>
	<div class="bascule-glitch__rgb"></div>
	<div class="bascule-glitch__scan"></div>
	<div class="bascule-glitch__flash"></div>
</div>
