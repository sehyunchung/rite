'use client';

import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react';
import { ReactNode, useRef, useState, useEffect } from 'react';
import { FullScreenLoading, Typography } from '@rite/ui';

// Singleton pattern for Convex client instance
let convexClient: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient | null {
	// Only create client on browser
	if (typeof window === 'undefined') return null;

	// Return existing client if already created
	if (convexClient) return convexClient;

	// Create new client
	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex functionality will be disabled.');
		return null;
	}

	try {
		convexClient = new ConvexReactClient(convexUrl);
		return convexClient;
	} catch (error) {
		console.error('Failed to initialize ConvexReactClient:', error);
		return null;
	}
}

interface ConvexProviderHydrationSafeProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export function ConvexProviderHydrationSafe({
	children,
	fallback,
}: ConvexProviderHydrationSafeProps) {
	const [isClient, setIsClient] = useState(false);
	const clientRef = useRef<ConvexReactClient | null>(null);

	useEffect(() => {
		// Mark as client-side after hydration
		setIsClient(true);

		// Initialize Convex client
		if (!clientRef.current) {
			clientRef.current = getConvexClient();
		}
	}, []);

	// Show consistent loading state during SSR and initial hydration
	if (!isClient) {
		return (
			fallback || (
				<div suppressHydrationWarning>
					<FullScreenLoading />
				</div>
			)
		);
	}

	// Client-side without Convex URL
	if (!clientRef.current) {
		return (
			<div className="min-h-screen bg-bg-primary flex items-center justify-center">
				<div className="text-center p-8">
					<Typography variant="h3" className="mb-4 text-color-error">
						Configuration Error
					</Typography>
					<Typography variant="body" color="secondary" className="mb-4">
						NEXT_PUBLIC_CONVEX_URL is not configured. Please check your environment variables.
					</Typography>
					<Typography variant="caption" color="secondary">
						See CLAUDE.md for setup instructions.
					</Typography>
				</div>
			</div>
		);
	}

	// Client-side with Convex
	return <ConvexReactProvider client={clientRef.current}>{children}</ConvexReactProvider>;
}
