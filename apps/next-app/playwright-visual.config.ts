import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e/visual',
	fullyParallel: false, // Visual tests should run sequentially for consistency
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0, // Less retries for visual tests
	workers: 1, // Single worker for visual consistency
	reporter: [['html', { open: 'never' }]],

	use: {
		baseURL: 'http://localhost:8000',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',

		// Visual testing specific settings
		viewport: { width: 1280, height: 720 },
		deviceScaleFactor: 1,
		hasTouch: false,

		// Disable animations for consistent screenshots
		launchOptions: {
			args: ['--disable-web-animations'],
		},
	},

	// Configure visual comparisons
	expect: {
		// Threshold for pixel differences (0-1, where 0 is exact match)
		toHaveScreenshot: {
			maxDiffPixels: 100,
			threshold: 0.2,
			animations: 'disabled',
		},
	},

	projects: [
		{
			name: 'desktop-chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 720 },
			},
		},
		{
			name: 'mobile-chromium',
			use: {
				...devices['Pixel 5'],
			},
		},
		{
			name: 'tablet-chromium',
			use: {
				...devices['iPad (gen 7)'],
			},
		},
	],

	webServer: {
		command: 'pnpm dev',
		url: 'http://localhost:8000',
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
