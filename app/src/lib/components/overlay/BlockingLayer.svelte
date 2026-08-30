<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ROLE_LABELS, roleKind } from './helpers';

	let { isPostPage }: { isPostPage: boolean } = $props();

	let me = $derived(connection.me);
	let postRole = $derived(me?.role && me.role !== 'projector' ? me.role : null);

	let active = $derived(
		connection.syncing ||
			(isPostPage && connection.state?.phase === 'idle') ||
			Boolean(me?.lockedByMj)
	);

	async function activate() {
		if (!connection.clientId) return;
		await connection.act({ type: 'post/activate', clientId: connection.clientId });
	}
</script>

<div
	class="blocking-layer"
	class:is-active={active}
	data-testid="blocking-layer"
	data-active={active}
>
	<div class="flex flex-col items-center gap-6 px-6 text-center">
		{#if !isPostPage}
			<p class="font-mono text-lg tracking-widest uppercase opacity-80">Connexion en cours…</p>
		{:else}
			<p class="font-mono text-8xl font-bold tabular-nums" data-testid="post-number">
				{connection.number ?? '—'}
			</p>

			{#if postRole}
				<div class="flex flex-col items-center gap-2">
					<Badge
						variant={roleKind(postRole) === 'epreuve' ? 'default' : 'secondary'}
						class="tracking-widest uppercase"
					>
						{roleKind(postRole) === 'epreuve' ? 'Épreuve' : 'Tâche'}
					</Badge>
					<p class="font-mono text-4xl font-semibold tracking-wide">{ROLE_LABELS[postRole]}</p>
				</div>
			{/if}

			{#if me && !me.activated}
				<Button size="lg" onclick={activate} data-testid="activate-btn">ACTIVER CE POSTE</Button>
			{/if}
		{/if}
	</div>

	{#if isPostPage}
		<p class="absolute bottom-6 px-6 text-center font-mono text-xs opacity-60">
			Documentation de référence : postes + ressources de salle.<br />
			Certains documents n'ont pas été numérisés.
		</p>
	{/if}
</div>
