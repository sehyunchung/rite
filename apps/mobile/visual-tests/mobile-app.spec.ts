import { test, expect } from '@playwright/test';

test.describe('RITE Mobile Visual Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Wait for app to fully load
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('home screen renders correctly', async ({ page }) => {
		// Wait for content to be visible
		await page.waitForSelector('text=Dashboard');

		// Take screenshot
		await expect(page).toHaveScreenshot('home-screen.png', {
			fullPage: true,
		});
	});

	test('navigation tabs are visible', async ({ page }) => {
		// Check all tab bar items
		const tabs = ['Dashboard', 'Create', 'Events'];

		for (const tab of tabs) {
			await expect(page.getByText(tab)).toBeVisible();
		}

		// Screenshot just the tab bar
		const tabBar = page.locator('[role="tablist"]').or(page.locator('nav'));
		await expect(tabBar).toHaveScreenshot('tab-bar.png');
	});

	test('create event screen', async ({ page }) => {
		// Navigate to create screen
		await page.getByText('Create').click();
		await page.waitForLoadState('networkidle');

		// Wait for form to be visible
		await page.waitForSelector('text=Create Event');

		await expect(page).toHaveScreenshot('create-event-screen.png', {
			fullPage: true,
		});
	});

	test('events list screen', async ({ page }) => {
		// Navigate to events
		await page.getByText('Events').click();
		await page.waitForLoadState('networkidle');

		await expect(page).toHaveScreenshot('events-list.png', {
			fullPage: true,
		});
	});

	test('theme consistency - dark theme', async ({ page }) => {
		// Ensure dark theme is applied (default)
		await page.evaluate(() => {
			localStorage.setItem('rite-theme-mode', 'dark');
		});
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Check background color
		const body = page.locator('body');
		await expect(body).toHaveCSS('background-color', 'rgb(26, 26, 31)'); // neutral-800

		await expect(page).toHaveScreenshot('dark-theme.png');
	});

	test('theme consistency - light theme', async ({ page }) => {
		// Switch to light theme
		await page.evaluate(() => {
			localStorage.setItem('rite-theme-mode', 'light');
		});
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Check background color changed
		const body = page.locator('body');
		await expect(body).toHaveCSS('background-color', 'rgb(245, 245, 248)'); // neutral-900 in light

		await expect(page).toHaveScreenshot('light-theme.png');
	});

	test('responsive design - mobile viewport', async ({ page, viewport }) => {
		// Already using mobile viewport from config
		expect(viewport?.width).toBeLessThan(500);

		await expect(page).toHaveScreenshot('mobile-viewport.png');
	});

	test('form elements styling', async ({ page }) => {
		await page.goto('/create');
		await page.waitForLoadState('networkidle');

		// Focus on form elements to capture different states
		const eventNameInput = page.getByPlaceholder('Event name');

		// Normal state
		await expect(eventNameInput).toHaveScreenshot('input-normal.png');

		// Focused state
		await eventNameInput.focus();
		await expect(eventNameInput).toHaveScreenshot('input-focused.png');

		// With content
		await eventNameInput.fill('Test Event');
		await expect(eventNameInput).toHaveScreenshot('input-filled.png');
	});

	test('button variants', async ({ page }) => {
		await page.goto('/create');

		// Find different button variants
		const submitButton = page.getByRole('button', { name: /create event/i });
		await expect(submitButton).toHaveScreenshot('button-primary.png');
	});

	test('loading states', async ({ page }) => {
		// Navigate to events which might show loading
		await page.goto('/events');

		// Capture any loading indicators if visible
		const loadingIndicator = page.locator('[role="progressbar"]').or(page.locator('text=Loading'));

		if (await loadingIndicator.isVisible()) {
			await expect(loadingIndicator).toHaveScreenshot('loading-state.png');
		}
	});
});

test.describe('Component Visual Tests', () => {
	test('all UI components from @rite/ui', async ({ page }) => {
		// You could create a dedicated visual test page that showcases all components
		// For now, we'll test components as they appear in the app

		const components = [
			{ url: '/', name: 'cards', selector: '[data-testid="event-card"]' },
			{ url: '/create', name: 'form-elements', selector: 'form' },
		];

		for (const component of components) {
			await page.goto(component.url);
			await page.waitForLoadState('networkidle');

			const element = page.locator(component.selector).first();
			if (await element.isVisible()) {
				await expect(element).toHaveScreenshot(`component-${component.name}.png`);
			}
		}
	});
});
