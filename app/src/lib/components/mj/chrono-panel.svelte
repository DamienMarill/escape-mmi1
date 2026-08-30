<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import type { PublicState } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { publicState }: { publicState: PublicState } = $props();

	let now = $state(Date.now());

	$effect(() => {
		const id = setInterval(() => {
			now = Date.now();
		}, 500);
		return () => clearInterval(id);
	});

	// Recalculé à chaque état reçu : publicState.serverNow change à chaque poussée SSE.
	let offset = $derived(Date.now() - publicState.serverNow);

	let elapsedMs = $derived.by(() => {
		const chrono = publicState.chrono;
		if (!chrono.running) return chrono.elapsedMs;
		const serverNowEstimate = now - offset;
		return chrono.elapsedMs + Math.max(0, serverNowEstimate - chrono.changedAt);
	});

	let remainingMs = $derived(publicState.chrono.durationMs - elapsedMs);

	function format(ms: number): string {
		const sign = ms < 0 ? '-' : '';
		const abs = Math.abs(Math.round(ms / 1000));
		const m = Math.floor(abs / 60);
		const s = abs % 60;
		return `${sign}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	function chronoStart() {
		connection.act({ type: 'mj/chronoStart' });
	}
	function chronoPause() {
		connection.act({ type: 'mj/chronoPause' });
	}
	function chronoAdd(ms: number) {
		connection.act({ type: 'mj/chronoAdd', ms });
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Chrono</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-3">
		<div class="flex items-baseline gap-3">
			<span class="font-mono text-4xl font-bold tabular-nums">{format(elapsedMs)}</span>
			<span class="text-sm text-neutral-500">
				/ {format(publicState.chrono.durationMs)} · reste {format(remainingMs)}
			</span>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button onclick={chronoStart} disabled={publicState.chrono.running}>Démarrer</Button>
			<Button variant="outline" onclick={chronoPause} disabled={!publicState.chrono.running}
				>Pause</Button
			>
			<Button variant="outline" onclick={() => chronoAdd(60000)}>+1 min</Button>
			<Button variant="outline" onclick={() => chronoAdd(-60000)}>−1 min</Button>
		</div>
	</Card.Content>
</Card.Root>
