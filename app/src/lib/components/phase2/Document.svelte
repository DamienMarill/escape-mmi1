<script lang="ts">
	// État visuel RECYCLÉ (game-design §10) : interface nouvelle, dense, avec
	// un titre. Un document = un écran entier, aucune interaction — trois
	// lecteurs doivent pouvoir se raconter ce qu'ils ont lu.
	import { PHASE2_DOCS } from '$lib/phase2-data';

	let { doc }: { doc: 'memoire' | 'brassage' | 'parite' } = $props();

	let info = $derived(PHASE2_DOCS[doc]);
</script>

<div
	class="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8 text-left"
	data-testid="phase2-doc-{info.filename}"
>
	<p class="font-mono text-xs tracking-[0.3em] uppercase opacity-60">
		Console d'administration — document récupéré
	</p>
	<div class="flex items-baseline gap-3">
		<span
			class="border px-2 py-0.5 font-mono text-xs"
			style="border-color: var(--game-accent); color: var(--game-accent)"
		>
			{info.filename}
		</span>
		<h2 class="font-mono text-xl font-semibold tracking-wider uppercase">{info.title}</h2>
	</div>
	<pre
		class="border border-white/10 bg-black/30 p-6 font-mono text-base leading-relaxed whitespace-pre-wrap">{info.body}</pre>
</div>
