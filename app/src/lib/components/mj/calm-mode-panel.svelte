<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import type { PublicState } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { publicState }: { publicState: PublicState } = $props();

	function setCalmMode(on: boolean) {
		connection.act({ type: 'mj/setCalmMode', on });
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Mode calme</Card.Title>
		<Card.Description>
			Remplace les glitchs et les flashs par des fondus sur tous les postes.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Button
			variant={publicState.calmMode ? 'default' : 'outline'}
			onclick={() => setCalmMode(!publicState.calmMode)}
		>
			Mode calme : {publicState.calmMode ? 'activé' : 'désactivé'}
		</Button>
	</Card.Content>
</Card.Root>
