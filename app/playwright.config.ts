import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.{ts,js}',
	// Tous les tests partagent le MÊME serveur de jeu (état en mémoire) : jamais de parallélisme.
	workers: 1,
	fullyParallel: false,
	// On teste toujours contre le build adapter-node, comme le jour J — jamais contre vite dev.
	webServer: {
		command:
			"node -e \"require('node:fs').rmSync('data-e2e',{recursive:true,force:true})\" && pnpm run build && node build",
		port: 4173,
		// TIME_SCALE compresse les séquences chronométrées (validation 20 s → 1 s, bascule 90 s → 4,5 s)
		env: { PORT: '4173', GAME_DATA_DIR: 'data-e2e', TIME_SCALE: '0.05' },
		stdout: 'ignore',
		stderr: 'pipe',
		timeout: 180_000
	},
	use: {
		baseURL: 'http://localhost:4173',
		launchOptions: {
			// L'audio du projecteur doit pouvoir jouer sans geste utilisateur dans les tests
			args: ['--autoplay-policy=no-user-gesture-required']
		}
	}
});
