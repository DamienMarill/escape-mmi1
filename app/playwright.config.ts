import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.{ts,js}',
	// On teste toujours contre le build adapter-node, comme le jour J — jamais contre vite dev.
	webServer: {
		command: 'pnpm run build && node build',
		port: 4173,
		env: { PORT: '4173' },
		stdout: 'ignore',
		stderr: 'pipe',
		timeout: 180_000
	},
	use: {
		baseURL: 'http://localhost:4173'
	}
});
