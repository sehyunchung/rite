import { test, expect } from '@playwright/test';

test.describe('Visual Tests - Simple Components', () => {
	test('Visual test page loads correctly', async ({ page }) => {
		// Navigate to visual test page
		await page.goto('/en/visual-test');

		// Wait for content to be visible
		await page.waitForSelector('h1:has-text("Typography Showcase")', { timeout: 30000 });

		// Take a simple screenshot to establish baseline
		await expect(page).toHaveScreenshot('visual-test-page.png', {
			fullPage: true,
			animations: 'disabled',
		});
	});

	test('Button component visual test', async ({ page }) => {
		await page.goto('/en/visual-test');
		await page.waitForSelector('h2:has-text("Buttons")');

		// Find buttons section
		const buttonsSection = page.locator('text=Buttons').locator('..').locator('..');

		// Take screenshot of buttons section
		await expect(buttonsSection).toHaveScreenshot('buttons-section.png');
	});
});
