import { expect, test } from '@playwright/test';

test('la page racine répond et rend le contenu', async ({ page }) => {
	const response = await page.goto('/');
	expect(response?.status()).toBe(200);
	await expect(page.locator('h1')).toBeVisible();
});
