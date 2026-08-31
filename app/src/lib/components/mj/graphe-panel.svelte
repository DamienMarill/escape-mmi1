<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import type { PublicState, LockId } from '$lib/types';
	import { LOCK_IDS, EPREUVE_IDS, TASK_IDS } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge/index.js';

	let { publicState }: { publicState: PublicState } = $props();

	const LOCK_LABELS: Record<LockId, string> = { alpha: 'α', beta: 'β', gamma: 'γ' };
	const STATUS_LABELS = { locked: 'verrouillé', open: 'ouvert' } as const;
	const STATUS_VARIANT: Record<PublicState['locks'][LockId], BadgeVariant> = {
		locked: 'destructive',
		open: 'default'
	};

	const EPREUVE_LABELS: Record<string, string> = {
		dev: 'DEV',
		image: 'IMAGE',
		systeme: 'SYSTÈME',
		reseau: 'RÉSEAU'
	};
	const TASK_LABELS: Record<string, string> = {
		compilation: 'COMPILATION',
		memoire: 'MÉMOIRE',
		brassage: 'BRASSAGE',
		parite: 'PARITÉ',
		synchro: 'SYNCHRO',
		scan: 'SCAN'
	};

	function cheatOpen(lock: LockId) {
		connection.act({ type: 'mj/cheatOpenLock', lock });
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>État du graphe</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div>
			<h3 class="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
				Cadenas
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each LOCK_IDS as lock (lock)}
					<div class="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1">
						<span class="font-mono text-sm font-bold">{LOCK_LABELS[lock]}</span>
						<Badge variant={STATUS_VARIANT[publicState.locks[lock]]}
							>{STATUS_LABELS[publicState.locks[lock]]}</Badge
						>
						<Button
							size="xs"
							variant="outline"
							class="border-dashed"
							disabled={publicState.locks[lock] !== 'locked'}
							onclick={() => cheatOpen(lock)}
						>
							Triche : ouvrir {LOCK_LABELS[lock]}
						</Button>
					</div>
				{/each}
			</div>
		</div>
		<div>
			<h3 class="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
				Épreuves
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each EPREUVE_IDS as id (id)}
					<Badge variant={publicState.epreuves[id].solved ? 'default' : 'outline'}>
						{EPREUVE_LABELS[id]}{publicState.epreuves[id].solved ? ' ✓' : ''}
					</Badge>
				{/each}
			</div>
		</div>
		<div>
			<h3 class="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
				Tâches
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each TASK_IDS as id (id)}
					<Badge variant={publicState.tasks[id].solved ? 'default' : 'outline'}>
						{TASK_LABELS[id]}{publicState.tasks[id].solved
							? ` ✓ (${publicState.tasks[id].segment})`
							: ''}
					</Badge>
				{/each}
			</div>
		</div>
	</Card.Content>
</Card.Root>
