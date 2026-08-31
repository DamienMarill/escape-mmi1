<script lang="ts">
	// Accès direct à l'écran projecteur (sans passer par l'assignation de rôle).
	// La connexion SSE est démarrée par +layout.svelte (asPost: false ici).
	import ProjectorView from '$lib/components/projector/ProjectorView.svelte';
</script>

<ProjectorView />
