<script lang="ts">
	// Écran permanent d'une tâche résolue : le segment en très gros + le
	// déblocage nommé. Reste affiché jusqu'à la fin de la phase 1 (règle n°4).
	import { connection } from '$lib/client/connection.svelte';
	import { TASK_UNLOCK_LABELS } from '$lib/tasks-data';
	import { TASK_PORT, type TaskId } from '$lib/types';

	let { task }: { task: TaskId } = $props();

	let segment = $derived(connection.state?.tasks[task].segment ?? '?');
	let port = $derived(TASK_PORT[task]);
</script>

<div
	class="flex flex-col items-center justify-center gap-8 p-8 text-center"
	data-testid="task-solved"
>
	<p class="font-mono text-2xl tracking-[0.3em] uppercase opacity-70">Tâche accomplie</p>
	<p class="font-mono text-9xl font-bold" data-testid="task-segment">
		PORT {port} : {segment}
	</p>
	<p
		class="border px-6 py-3 font-mono text-xl tracking-wider"
		style="border-color: var(--game-accent)"
		data-testid="task-unlock"
	>
		{TASK_UNLOCK_LABELS[task]}
	</p>
</div>
