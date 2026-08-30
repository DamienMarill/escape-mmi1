<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import type { PublicState } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	let { publicState }: { publicState: PublicState } = $props();

	let resetOpen = $state(false);

	const PHASE_LABELS: Record<PublicState['phase'], string> = {
		idle: 'En attente',
		intro: 'Introduction',
		phase1: 'Phase 1',
		bascule: 'Bascule',
		phase2: 'Phase 2',
		epilogue: 'Épilogue'
	};

	function startPhase1() {
		connection.act({ type: 'mj/startPhase1' });
	}

	function confirmReset() {
		connection.act({ type: 'mj/reset' });
		resetOpen = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Session</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-3">
		<p class="font-mono text-2xl font-bold">{PHASE_LABELS[publicState.phase]}</p>
		<div class="flex flex-wrap gap-2">
			<Button disabled={publicState.phase !== 'idle'} onclick={startPhase1}
				>Démarrer la phase 1</Button
			>
			<Button variant="destructive" onclick={() => (resetOpen = true)}>Reset</Button>
		</div>
	</Card.Content>
</Card.Root>

<Dialog.Root bind:open={resetOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Checklist physique avant reset</Dialog.Title>
			<Dialog.Description>À vérifier dans la salle avant de confirmer :</Dialog.Description>
		</Dialog.Header>
		<ol class="list-decimal space-y-1.5 pl-5 text-sm">
			<li>Fiche remise dans le tome, à la bonne page, dépassant visiblement.</li>
			<li>Tableau ouvert, le battant recouvrant le dessin.</li>
			<li>Plan de câblage encore lisible (le réparer seulement si nécessaire).</li>
		</ol>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (resetOpen = false)}>Annuler</Button>
			<Button variant="destructive" onclick={confirmReset}>Confirmer le reset</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
