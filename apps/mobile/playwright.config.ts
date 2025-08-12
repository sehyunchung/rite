import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './visual-tests',
	outputDir: './visual-tests/test-results',

	// Snapshot settings
	use: {
		// Base URL for the Expo web server
		baseURL: 'http://localhost:8081',

		// Capture screenshots on failure
		screenshot: 'only-on-failure',

		// Video recording off by default
		video: 'off',

		// Consistent viewport for snapshots
		viewport: { width: 390, height: 844 }, // iPhone 14 Pro size
	},

	// Configure different device profiles
	projects: [
		// Mobile devices
		{
			name: 'Mobile iOS',
			use: {
				...devices['iPhone 14 Pro'],
				hasTouch: true,
			},
		},
		{
			name: 'Mobile Android',
			use: {
				...devices['Pixel 7'],
				hasTouch: true,
			},
		},
		// Tablet devices
		{
			name: 'iPad',
			use: {
				...devices['iPad Pro'],
				hasTouch: true,
			},
		},
		// Desktop for comparison
		{
			name: 'Desktop',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 720 },
			},
		},
	],

	// Start the Expo web server before running tests
	webServer: {
		command: 'pnpm run web',
		port: 8081,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000, // 2 minutes for initial build
	},

	// Test timeout
	timeout: 30 * 1000,

	// Retry failed tests
	retries: process.env.CI ? 2 : 0,

	// Reporter configuration
	reporter: [['html', { outputFolder: 'visual-tests/playwright-report' }], ['list']],

	// Snapshot configuration
	expect: {
		// Threshold for pixel differences
		toHaveScreenshot: {
			maxDiffPixels: 100,
			threshold: 0.2, // 20% difference threshold
		},
	},
});
