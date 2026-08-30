<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import type { PublicState, Role } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let {
		publicState,
		onIndice
	}: { publicState: PublicState; onIndice: (clientId: string) => void } = $props();

	const ROLE_LABELS: Record<Role, string> = {
		dev: 'DEV',
		image: 'IMAGE',
		systeme: 'SYSTÈME',
		reseau: 'RÉSEAU',
		compilation: 'COMPILATION',
		memoire: 'MÉMOIRE',
		brassage: 'BRASSAGE',
		parite: 'PARITÉ',
		synchro: 'SYNCHRO',
		scan: 'SCAN',
		projector: 'PROJECTEUR'
	};

	const ROLE_OPTIONS: { value: Role | ''; label: string }[] = [
		{ value: '', label: '— aucun —' },
		...(Object.entries(ROLE_LABELS) as [Role, string][]).map(([value, label]) => ({
			value,
			label
		}))
	];

	let posts = $derived(
		Object.entries(publicState.posts)
			.map(([clientId, post]) => ({ clientId, ...post }))
			.sort((a, b) => a.number - b.number)
	);

	function setRole(clientId: string, value: string) {
		connection.act({
			type: 'mj/assignRole',
			clientId,
			role: value === '' ? null : (value as Role)
		});
	}

	function toggleLock(clientId: string, locked: boolean) {
		connection.act({ type: 'mj/lockPost', clientId, locked });
	}

	function distribute() {
		connection.act({ type: 'mj/distributeRoles' });
	}
</script>

<Card.Root class="xl:col-span-2">
	<Card.Header>
		<Card.Title>Postes</Card.Title>
		<Card.Action>
			<Button size="sm" onclick={distribute}>Distribuer les rôles</Button>
		</Card.Action>
	</Card.Header>
	<Card.Content class="space-y-1.5">
		{#each posts as post (post.clientId)}
			<div
				class="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-2.5 py-1.5"
			>
				<span class="w-6 shrink-0 text-center font-mono text-sm font-bold">{post.number}</span>
				<span
					class="size-2.5 shrink-0 rounded-full {post.connected
						? 'bg-green-500'
						: 'bg-neutral-700'}"
					title={post.connected ? 'connecté' : 'déconnecté'}
				></span>
				{#if post.activated}
					<Badge variant="secondary">activé</Badge>
				{/if}
				<select
					class="h-7 rounded-md border border-neutral-700 bg-neutral-900 px-1.5 text-xs"
					value={post.role ?? ''}
					onchange={(e) => setRole(post.clientId, (e.currentTarget as HTMLSelectElement).value)}
				>
					{#each ROLE_OPTIONS as opt (opt.value)}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
				<Button
					size="sm"
					variant={post.lockedByMj ? 'destructive' : 'outline'}
					onclick={() => toggleLock(post.clientId, !post.lockedByMj)}
				>
					{post.lockedByMj ? 'Verrouillé' : 'Verrouiller'}
				</Button>
				<Button size="sm" variant="ghost" onclick={() => onIndice(post.clientId)}>Indice</Button>
			</div>
		{/each}
		{#if posts.length === 0}
			<p class="text-sm text-neutral-500">Aucun poste enregistré pour l'instant.</p>
		{/if}
	</Card.Content>
</Card.Root>
