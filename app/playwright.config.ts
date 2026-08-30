import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.{ts,js}',
	// On teste toujours contre le build adapter-node, comme le jour J — jamais contre vite dev.
	webServer: {
		command:
			"node -e \"require('node:fs').rmSync('data-e2e',{recursive:true,force:true})\" && pnpm run build && node build",
		port: 4173,
		env: { PORT: '4173', GAME_DATA_DIR: 'data-e2e' },
		stdout: 'ignore',
		stderr: 'pipe',
		timeout: 180_000
	},
	use: {
		baseURL: 'http://localhost:4173'
	}
});
