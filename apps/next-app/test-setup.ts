import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Next.js router
vi.mock('next/navigation', () => ({
	useRouter() {
		return {
			push: vi.fn(),
			replace: vi.fn(),
			prefetch: vi.fn(),
			back: vi.fn(),
			forward: vi.fn(),
			refresh: vi.fn(),
		};
	},
	useSearchParams() {
		return new URLSearchParams();
	},
	usePathname() {
		return '/';
	},
}));

// Mock NextAuth
vi.mock('next-auth', () => ({
	auth: vi.fn(() => Promise.resolve(null)),
}));

// Mock Convex
vi.mock('convex/react', () => ({
	useQuery: vi.fn(() => undefined),
	useMutation: vi.fn(() => vi.fn()),
	useAction: vi.fn(() => vi.fn()),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
	useLocale: () => 'en',
}));

vi.mock('@/i18n/routing', () => ({
	Link: ({ children, ...props }: any) => {
		const React = require('react');
		return React.createElement('a', props, children);
	},
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		back: vi.fn(),
	}),
}));

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Global test setup
beforeAll(() => {
	// Setup any global test configuration
});
