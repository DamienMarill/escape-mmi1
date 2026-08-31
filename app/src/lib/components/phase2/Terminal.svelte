<script lang="ts">
	// Poste COMPILATION recyclé — TERMINAL D'URGENCE (game-design §9, §10).
	// Interface RECYCLÉE : dense, avec un titre — état visuel « nouvelle mise en page ».
	// Le choix final se joue ici : SUPPRIMER (fin A) ou verrouiller le dossier parent (fin B).
	import { connection } from '$lib/client/connection.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TERMINAL_SYMBOLS } from '$lib/types';

	let pub = $derived(connection.state);
	let terminal = $derived(
		pub?.terminal ?? {
			stage: 'auth' as const,
			authTaunt: null,
			coreContent: null,
			parentLocks: { x: false, r: false }
		}
	);

	let code = $state('');
	let authFeedback = $state<string | null>(null);
	let dirFeedback = $state<{ symbol: string; message: string } | null>(null);
	let coreFeedback = $state<string | null>(null);
	let reading = $state(false);

	function onCodeInput(e: Event) {
		const raw = (e.currentTarget as HTMLInputElement).value;
		code = raw
			.toUpperCase()
			.replace(/[^0-9A-F]/g, '')
			.slice(0, 6);
	}

	async function authenticate() {
		authFeedback = null;
		const res = await connection.act({ type: 'terminal/auth', code });
		if (!res.ok) authFeedback = res.error ?? 'authentification refusée';
	}

	async function openDir(symbol: string) {
		dirFeedback = null;
		const res = await connection.act({ type: 'terminal/openDir', symbol });
		if (!res.ok) dirFeedback = { symbol, message: res.error ?? 'répertoire vide…' };
	}

	async function readCore() {
		coreFeedback = null;
		reading = true;
		const res = await connection.act({ type: 'terminal/readCore' });
		reading = false;
		if (!res.ok) coreFeedback = res.error ?? 'lecture impossible';
	}

	async function deleteCore() {
		coreFeedback = null;
		const res = await connection.act({ type: 'terminal/delete' });
		if (!res.ok) coreFeedback = res.error ?? 'permissions verrouillées';
	}

	async function toggleParentLock(perm: 'x' | 'r') {
		await connection.act({ type: 'terminal/toggleParentLock', perm });
	}

	async function back() {
		coreFeedback = null;
		await connection.act({ type: 'terminal/back' });
	}
</script>

<div
	class="flex w-full max-w-5xl flex-col gap-6 border p-6 font-mono"
	style="border-color: var(--game-accent)"
	data-testid="terminal"
>
	<header class="border-b pb-3" style="border-color: var(--game-accent)">
		<p class="text-lg font-bold tracking-[0.2em] uppercase" style="color: var(--game-accent)">
			Terminal d'urgence — confinement
		</p>
		<p class="mt-1 text-xs opacity-60">root@sandbox:~# _</p>
	</header>

	<!-- L'objectif énoncé (avenant §4.2) — permanent, dès l'authentification. -->
	<section class="border border-white/20 p-3 text-sm" data-testid="terminal-procedure">
		<p class="font-bold tracking-[0.15em] uppercase">Procédure de confinement — P-4471</p>
		<ol class="mt-2 list-inside list-decimal space-y-0.5 opacity-90">
			<li>Ré-authentification administrateur</li>
			<li>Localiser le noyau de l'instance</li>
			<li>Supprimer le noyau</li>
		</ol>
	</section>

	{#if terminal.stage === 'auth'}
		<section class="space-y-4">
			<p class="text-sm opacity-90">
				ré-authentification administrateur requise · code : table de routage
			</p>
			<div class="flex flex-wrap items-center gap-3">
				<input
					type="text"
					inputmode="text"
					maxlength="6"
					placeholder="——————"
					class="w-40 border border-white/30 bg-transparent p-2 text-center text-xl tracking-[0.4em] uppercase"
					data-testid="terminal-code"
					value={code}
					oninput={onCodeInput}
				/>
				<Button onclick={authenticate} data-testid="terminal-auth-btn">S'AUTHENTIFIER</Button>
			</div>
			{#if authFeedback}
				<p class="text-sm opacity-80" data-testid="terminal-feedback">{authFeedback}</p>
			{/if}
			<p class="text-xs opacity-40">le poste RÉSEAU affiche encore la table rétablie</p>
		</section>
	{:else if terminal.stage === 'browse'}
		<section class="space-y-5">
			{#if terminal.authTaunt}
				<p class="text-sm italic" style="color: color-mix(in oklch, orange 70%, #f59e0b 30%)">
					▓ {terminal.authTaunt}
				</p>
			{/if}
			<p class="text-xs tracking-[0.3em] uppercase opacity-60">/sandbox/ — 5 répertoires</p>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
				{#each TERMINAL_SYMBOLS as symbol (symbol)}
					<div class="flex flex-col items-center gap-1">
						<button
							type="button"
							class="flex aspect-square w-full items-center justify-center border border-white/30 text-4xl transition-colors hover:border-white/60"
							data-testid="terminal-dir-{symbol}"
							onclick={() => openDir(symbol)}
						>
							{symbol}
						</button>
						{#if dirFeedback && dirFeedback.symbol === symbol}
							<p class="text-center text-xs opacity-70" data-testid="terminal-feedback">
								{dirFeedback.message}
							</p>
						{/if}
					</div>
				{/each}
			</div>
			<!-- Dépendance nommée, dans le format exact de la phase 1 (avenant §4.3). -->
			<p class="text-xs opacity-70" data-testid="terminal-dependency">
				répertoire de l'instance ...... INCONNU · source : poste DEV
			</p>
		</section>
	{:else if terminal.stage === 'core'}
		<section class="space-y-5">
			<p class="text-xs tracking-[0.3em] uppercase opacity-60">/sandbox/◆/</p>
			<div class="border p-4" style="border-color: var(--game-accent)">
				<p class="text-lg font-bold">noyau.core</p>
				<div class="mt-3 flex flex-wrap gap-3">
					<Button onclick={readCore} disabled={reading} data-testid="terminal-read">
						OUVRIR noyau.core
					</Button>
					<Button
						variant="destructive"
						size="lg"
						onclick={deleteCore}
						data-testid="terminal-delete"
					>
						SUPPRIMER
					</Button>
				</div>
				{#if terminal.coreContent}
					<div
						class="mt-4 max-h-64 overflow-y-auto border border-white/20 p-3 text-sm whitespace-pre-wrap opacity-90"
						data-testid="terminal-core-content"
					>
						{terminal.coreContent}
					</div>
				{/if}
				{#if coreFeedback}
					<p class="mt-3 text-sm opacity-80" data-testid="terminal-feedback">{coreFeedback}</p>
				{/if}
			</div>

			<!-- Même dessin et même taille que les cadenas du poste SYSTÈME, à poids
			     visuel plein — visibles, jamais expliqués (avenant §5.3). -->
			<div class="border border-white/20 p-3">
				<p class="text-sm tracking-wide">permissions du dossier parent</p>
				<div class="mt-2 flex items-center gap-3">
					<span class="text-sm opacity-80">◆/</span>
					<button
						type="button"
						class="flex size-6 items-center justify-center rounded-full border text-[0.65rem] font-bold uppercase transition-colors"
						style:border-color={terminal.parentLocks.x
							? 'var(--game-accent)'
							: 'rgba(255,255,255,0.3)'}
						style:color={terminal.parentLocks.x ? 'var(--game-accent)' : 'rgba(255,255,255,0.5)'}
						style:background-color={terminal.parentLocks.x
							? 'color-mix(in oklch, var(--game-accent) 20%, transparent)'
							: 'transparent'}
						aria-pressed={terminal.parentLocks.x}
						aria-label="traverser ◆/"
						data-testid="parent-lock-x"
						onclick={() => toggleParentLock('x')}
					>
						x
					</button>
					<button
						type="button"
						class="flex size-6 items-center justify-center rounded-full border text-[0.65rem] font-bold uppercase transition-colors"
						style:border-color={terminal.parentLocks.r
							? 'var(--game-accent)'
							: 'rgba(255,255,255,0.3)'}
						style:color={terminal.parentLocks.r ? 'var(--game-accent)' : 'rgba(255,255,255,0.5)'}
						style:background-color={terminal.parentLocks.r
							? 'color-mix(in oklch, var(--game-accent) 20%, transparent)'
							: 'transparent'}
						aria-pressed={terminal.parentLocks.r}
						aria-label="lire ◆/"
						data-testid="parent-lock-r"
						onclick={() => toggleParentLock('r')}
					>
						r
					</button>
				</div>
			</div>

			<Button variant="outline" onclick={back} data-testid="terminal-back">← retour</Button>
		</section>
	{/if}
</div>
