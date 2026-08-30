<script lang="ts">
	import { connection } from '$lib/client/connection.svelte';
	import type { PublicState, PortId } from '$lib/types';
	import { PORT_IDS } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let { publicState }: { publicState: PublicState } = $props();

	let posts = $derived(
		Object.entries(publicState.posts)
			.map(([clientId, post]) => ({ clientId, ...post }))
			.sort((a, b) => a.number - b.number)
	);

	let drafts = $state<Record<string, { text: string; level: number }>>({});

	$effect(() => {
		for (const post of posts) {
			drafts[post.clientId] ??= { text: '', level: 1 };
		}
	});

	function revealSegment(port: PortId) {
		connection.act({ type: 'mj/revealSegment', port });
	}

	function sendHint(clientId: string) {
		const draft = drafts[clientId];
		if (!draft || !draft.text.trim()) return;
		connection.act({ type: 'mj/sendHint', clientId, text: draft.text, level: draft.level });
	}

	function clearHint(clientId: string) {
		connection.act({ type: 'mj/clearHint', clientId });
	}
</script>

<Card.Root class="xl:col-span-2">
	<Card.Header>
		<Card.Title>Soupapes</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div>
			<h3 class="mb-1.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
				Révélation de segment (branche γ)
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each PORT_IDS as port (port)}
					<Button
						size="sm"
						variant="outline"
						disabled={publicState.revealedPorts.includes(port)}
						onclick={() => revealSegment(port)}
					>
						Révéler {port}
					</Button>
				{/each}
			</div>
		</div>
		<div>
			<h3 class="mb-1.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
				Indices par poste
			</h3>
			<div class="max-h-96 space-y-2 overflow-y-auto pr-1">
				{#each posts as post (post.clientId)}
					{@const hint = publicState.hints[post.clientId]}
					{@const draft = drafts[post.clientId]}
					<div id={`hint-${post.clientId}`} class="rounded-lg border border-neutral-800 p-2">
						<div class="mb-1 flex items-center justify-between">
							<span class="font-mono text-sm font-bold">
								#{post.number}{post.role ? ` · ${post.role}` : ''}
							</span>
							{#if hint}
								<span class="text-xs text-amber-400">indice niveau {hint.level} actif</span>
							{/if}
						</div>
						{#if hint}
							<p class="mb-1.5 text-sm text-neutral-300">{hint.text}</p>
						{/if}
						{#if draft}
							<div class="flex flex-wrap items-end gap-2">
								<textarea
									id={`hint-text-${post.clientId}`}
									class="h-14 min-w-48 flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
									placeholder="Texte de l'indice…"
									bind:value={draft.text}></textarea>
								<div class="flex flex-col gap-1">
									<Label for={`hint-level-${post.clientId}`} class="text-xs text-neutral-500"
										>Niveau</Label
									>
									<select
										id={`hint-level-${post.clientId}`}
										class="h-7 rounded-md border border-neutral-700 bg-neutral-900 px-1.5 text-xs"
										bind:value={draft.level}
									>
										<option value={1}>1</option>
										<option value={2}>2</option>
										<option value={3}>3</option>
									</select>
								</div>
								<Button size="sm" onclick={() => sendHint(post.clientId)}>Envoyer</Button>
								<Button
									size="sm"
									variant="outline"
									disabled={!hint}
									onclick={() => clearHint(post.clientId)}
								>
									Effacer
								</Button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</Card.Content>
</Card.Root>
