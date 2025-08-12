import { test, expect } from '@playwright/test';

// Available themes from RITE design system
const themes = [
	{ key: 'rite-refined', name: 'RITE Refined' },
	{ key: 'deep-ocean', name: 'Deep Ocean' },
	{ key: 'josh-comeau', name: 'Josh Comeau Inspired' },
	{ key: 'monochrome-light', name: 'Pure Monochrome Light' },
	{ key: 'monochrome-dark', name: 'Pure Monochrome Dark' },
];

test.describe('Visual Tests - Components', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to visual test page
		await page.goto('/en/visual-test');

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

	// Test each theme
	for (const theme of themes) {
		test(`Full page screenshot - ${theme.name}`, async ({ page }) => {
			// Apply theme
			await page.evaluate((themeKey) => {
				localStorage.setItem('rite-theme', themeKey);
				document.documentElement.setAttribute('data-theme', themeKey);
			}, theme.key);

			// Force theme CSS variables to update
			await page.waitForTimeout(100);

			// Take full page screenshot
			await expect(page).toHaveScreenshot(`full-page-${theme.key}.png`, {
				fullPage: true,
				animations: 'disabled',
			});
		});

		test(`Component sections - ${theme.name}`, async ({ page }) => {
			// Apply theme
			await page.evaluate((themeKey) => {
				localStorage.setItem('rite-theme', themeKey);
				document.documentElement.setAttribute('data-theme', themeKey);
			}, theme.key);

			await page.waitForTimeout(100);

			// Typography section
			const typographySection = page.locator('section').first();
			await expect(typographySection).toHaveScreenshot(`typography-${theme.key}.png`);

			// Buttons section
			const buttonsSection = page.locator('section').nth(1);
			await expect(buttonsSection).toHaveScreenshot(`buttons-${theme.key}.png`);

			// Badges section
			const badgesSection = page.locator('section').nth(2);
			await expect(badgesSection).toHaveScreenshot(`badges-${theme.key}.png`);

			// Cards section
			const cardsSection = page.locator('section').nth(3);
			await expect(cardsSection).toHaveScreenshot(`cards-${theme.key}.png`);

			// Event Card section
			const eventCardSection = page.locator('section').nth(4);
			await expect(eventCardSection).toHaveScreenshot(`event-card-${theme.key}.png`);

			// Form Elements section
			const formSection = page.locator('section').nth(5);
			await expect(formSection).toHaveScreenshot(`forms-${theme.key}.png`);

			// Alerts section
			const alertsSection = page.locator('section').nth(6);
			await expect(alertsSection).toHaveScreenshot(`alerts-${theme.key}.png`);

			// Loading States section
			const loadingSection = page.locator('section').nth(7);
			await expect(loadingSection).toHaveScreenshot(`loading-${theme.key}.png`);
		});
	}

	// Test responsive breakpoints
	test.describe('Responsive Tests', () => {
		const viewports = [
			{ name: 'mobile', width: 375, height: 667 },
			{ name: 'tablet', width: 768, height: 1024 },
			{ name: 'desktop', width: 1920, height: 1080 },
		];

		for (const viewport of viewports) {
			test(`Components at ${viewport.name} viewport`, async ({ page }) => {
				// Set viewport
				await page.setViewportSize({ width: viewport.width, height: viewport.height });

				// Use default theme for responsive tests
				await page.evaluate(() => {
					localStorage.setItem('rite-theme', 'rite-refined');
					document.documentElement.setAttribute('data-theme', 'rite-refined');
				});

				await page.waitForTimeout(100);

				// Take screenshot of key sections
				await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`, {
					fullPage: true,
					animations: 'disabled',
				});
			});
		}
	});

	// Test interactive states
	test('Interactive states', async ({ page }) => {
		// Use default theme
		await page.evaluate(() => {
			localStorage.setItem('rite-theme', 'rite-refined');
			document.documentElement.setAttribute('data-theme', 'rite-refined');
		});

		await page.waitForTimeout(100);

		// Button hover states
		const defaultButton = page.locator('button:has-text("Default")').first();
		await defaultButton.hover();
		await expect(defaultButton).toHaveScreenshot('button-hover.png');

		// Input focus state
		const inputField = page.locator('#input-test');
		await inputField.focus();
		await expect(inputField).toHaveScreenshot('input-focus.png');

		// Select dropdown open
		const selectTrigger = page.locator('[role="combobox"]').first();
		await selectTrigger.click();
		await page.waitForSelector('[role="listbox"]');
		await expect(page.locator('[role="listbox"]')).toHaveScreenshot('select-open.png');
	});
});
