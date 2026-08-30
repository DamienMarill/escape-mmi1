<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';

	let closedSeq = $state<number | null>(null);

	let hint = $derived(
		connection.clientId ? (connection.state?.hints[connection.clientId] ?? null) : null
	);
	let visible = $derived(hint !== null && hint.seq !== closedSeq);

	function close() {
		if (hint) closedSeq = hint.seq;
	}
</script>

{#if visible && hint}
	<div class="hint-panel">
		<Card class="w-80 border-(--game-accent)">
			<CardHeader>
				<CardTitle class="font-mono text-sm tracking-widest uppercase">
					Indice — niveau {hint.level}
				</CardTitle>
			</CardHeader>
			<CardContent class="font-mono text-sm">
				{hint.text}
			</CardContent>
			<CardFooter class="justify-end">
				<Button variant="outline" size="sm" onclick={close}>Fermer</Button>
			</CardFooter>
		</Card>
	</div>
{/if}
