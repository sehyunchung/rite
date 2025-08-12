import { test, expect } from '@playwright/test';

test.describe('Visual Tests - Theme Switcher', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to a page with the theme switcher (dashboard)
		await page.goto('/en/dashboard');

		// Wait for page to fully load
		await page.waitForLoadState('networkidle');

		// Disable animations
		await page.addStyleTag({
			content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
		});
	});

	test('Theme switcher button states', async ({ page }) => {
		const themeSwitcher = page.locator('[aria-label="Switch theme"]');

		// Closed state
		await expect(themeSwitcher).toHaveScreenshot('theme-switcher-closed.png');

		// Hover state
		await themeSwitcher.hover();
		await expect(themeSwitcher).toHaveScreenshot('theme-switcher-hover.png');

		// Open state
		await themeSwitcher.click();
		await page.waitForSelector('[role="listbox"]');
		const dropdown = page.locator('[role="listbox"]');
		await expect(dropdown).toHaveScreenshot('theme-switcher-dropdown.png');
	});

	test('Theme transitions', async ({ page }) => {
		const themes = [
			'rite-refined',
			'deep-ocean',
			'josh-comeau',
			'monochrome-light',
			'monochrome-dark',
		];

		for (const theme of themes) {
			// Open theme switcher
			await page.locator('[aria-label="Switch theme"]').click();
			await page.waitForSelector('[role="listbox"]');

			// Select theme
			await page.locator(`[data-value="${theme}"]`).click();

			// Wait for theme to apply
			await page.waitForTimeout(300);

			// Take screenshot of header area showing theme switcher with new theme
			const header = page.locator('header').first();
			await expect(header).toHaveScreenshot(`header-with-${theme}.png`);
		}
	});

	test('Theme persistence', async ({ page, context }) => {
		// Set a theme
		await page.locator('[aria-label="Switch theme"]').click();
		await page.locator('[data-value="deep-ocean"]').click();
		await page.waitForTimeout(300);

		// Verify theme is applied
		const htmlElement = page.locator('html');
		await expect(htmlElement).toHaveAttribute('data-theme', 'deep-ocean');

		// Navigate to another page
		await page.goto('/en/events/create');
		await page.waitForLoadState('networkidle');

		// Verify theme persisted
		await expect(htmlElement).toHaveAttribute('data-theme', 'deep-ocean');

		// Take screenshot to verify visual persistence
		await expect(page.locator('body')).toHaveScreenshot('theme-persistence.png');
	});
});
