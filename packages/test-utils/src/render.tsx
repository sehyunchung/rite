/**
 * Custom render utilities for testing React components
 * Follows TDD principle: Test components in realistic environments
 */

import * as React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';

// Mock Convex client for testing
const mockConvexClient = new ConvexReactClient(
	process.env.NEXT_PUBLIC_CONVEX_URL || 'https://test.convex.cloud'
);

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	// Add any custom options here
	withAuth?: boolean;
	locale?: 'en' | 'ko';
	theme?: string;
}

// Provider wrapper for Next.js components
export function AllTheProviders({ children }: { children: React.ReactNode }) {
	return <ConvexProvider client={mockConvexClient}>{children}</ConvexProvider>;
}

// Custom render function for Next.js components
export function renderWithProviders(ui: React.ReactElement, options?: CustomRenderOptions) {
	return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
