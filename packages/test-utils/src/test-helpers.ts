/**
 * Common test helper utilities
 * Following TDD principle: DRY test utilities for consistent testing
 */

import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';

// Wait for async operations with better error messages
export const waitForAsync = async (
	callback: () => void | Promise<void>,
	options = { timeout: 3000 }
) => {
	return waitFor(callback, {
		...options,
		onTimeout: (error) => {
			console.error('waitForAsync timeout:', error);
			return error;
		},
	});
};

// Mock console methods for cleaner test output
export const mockConsole = () => {
	const originalConsole = {
		log: console.log,
		error: console.error,
		warn: console.warn,
	};

	beforeAll(() => {
		console.log = vi.fn();
		console.error = vi.fn();
		console.warn = vi.fn();
	});

	afterAll(() => {
		console.log = originalConsole.log;
		console.error = originalConsole.error;
		console.warn = originalConsole.warn;
	});

	return {
		getLastLog: () => (console.log as any).mock.calls.slice(-1)[0],
		getLastError: () => (console.error as any).mock.calls.slice(-1)[0],
		getLastWarn: () => (console.warn as any).mock.calls.slice(-1)[0],
	};
};

// Mock date/time for consistent testing
export const mockDate = (date: string | Date) => {
	const mockedDate = typeof date === 'string' ? new Date(date) : date;

	beforeAll(() => {
		vi.useFakeTimers();
		vi.setSystemTime(mockedDate);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	return {
		advance: (ms: number) => vi.advanceTimersByTime(ms),
		set: (newDate: string | Date) => {
			const d = typeof newDate === 'string' ? new Date(newDate) : newDate;
			vi.setSystemTime(d);
		},
	};
};

// Mock localStorage for testing
export const mockLocalStorage = () => {
	const store: Record<string, string> = {};

	const mockStorage = {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			Object.keys(store).forEach((key) => delete store[key]);
		}),
	};

	Object.defineProperty(window, 'localStorage', {
		value: mockStorage,
		writable: true,
	});

	return {
		store,
		mock: mockStorage,
	};
};

// Mock fetch for API testing
export const mockFetch = (
	responses: Array<{ url: string | RegExp; response: any; status?: number }>
) => {
	const fetchMock = vi.fn().mockImplementation((url: string, options?: any) => {
		const match = responses.find((r) => {
			if (typeof r.url === 'string') {
				return url.includes(r.url);
			}
			return r.url.test(url);
		});

		if (match) {
			return Promise.resolve({
				ok: (match.status || 200) < 400,
				status: match.status || 200,
				json: () => Promise.resolve(match.response),
				text: () => Promise.resolve(JSON.stringify(match.response)),
			});
		}

		return Promise.reject(new Error(`No mock found for ${url}`));
	});

	global.fetch = fetchMock as any;

	return fetchMock;
};

// Helper for testing form submissions
export const submitForm = async (getByRole: any, formData: Record<string, string>) => {
	for (const [name, value] of Object.entries(formData)) {
		const input =
			getByRole('textbox', { name }) ||
			getByRole('combobox', { name }) ||
			document.querySelector(`[name="${name}"]`);

		if (input) {
			input.value = value;
			input.dispatchEvent(new Event('change', { bubbles: true }));
		}
	}

	const submitButton = getByRole('button', { name: /submit/i });
	submitButton.click();
};

// Helper for testing async state updates
export const expectEventually = async (assertion: () => void, timeout = 3000, interval = 100) => {
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		try {
			assertion();
			return;
		} catch (error) {
			await new Promise((resolve) => setTimeout(resolve, interval));
		}
	}

	// Final attempt that will throw if it fails
	assertion();
};

// Mock router for Next.js testing
export const mockRouter = {
	push: vi.fn(),
	replace: vi.fn(),
	prefetch: vi.fn(),
	back: vi.fn(),
	reload: vi.fn(),
	pathname: '/',
	query: {},
	asPath: '/',
	locale: 'en',
	locales: ['en', 'ko'],
	defaultLocale: 'en',
};

// Mock navigation for React Native testing
export const mockNavigation = {
	navigate: vi.fn(),
	goBack: vi.fn(),
	reset: vi.fn(),
	setOptions: vi.fn(),
	addListener: vi.fn(),
	removeListener: vi.fn(),
};

// Helper to test accessibility
export const testA11y = async (container: HTMLElement) => {
	// Basic accessibility checks
	const images = container.querySelectorAll('img');
	images.forEach((img) => {
		if (!img.alt && !img.getAttribute('aria-label')) {
			throw new Error(`Image missing alt text: ${img.src}`);
		}
	});

	const buttons = container.querySelectorAll('button');
	buttons.forEach((button) => {
		if (!button.textContent && !button.getAttribute('aria-label')) {
			throw new Error('Button missing accessible label');
		}
	});

	const inputs = container.querySelectorAll('input, textarea, select');
	inputs.forEach((input) => {
		const id = input.id;
		if (!id || !container.querySelector(`label[for="${id}"]`)) {
			if (!input.getAttribute('aria-label')) {
				throw new Error('Form input missing label');
			}
		}
	});
};
