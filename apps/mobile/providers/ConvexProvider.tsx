import React, { useState, useEffect } from 'react';
import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';
import { View, Text, ActivityIndicator, Alert } from 'react-native';

// Create a singleton Convex client
let convexClient: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient | null {
	if (!convexClient) {
		const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

		if (!convexUrl) {
			console.error(
				'EXPO_PUBLIC_CONVEX_URL is required but not set. Please configure your environment variables.'
			);
			return null;
		}

		try {
			convexClient = new ConvexReactClient(convexUrl);
		} catch (error) {
			console.error('Failed to initialize Convex client:', error);
			return null;
		}
	}

	return convexClient;
}

function ConfigurationErrorScreen() {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
			<Text style={{ fontSize: 24, fontWeight: 'bold', color: '#DC2626', marginBottom: 16 }}>
				Configuration Error
			</Text>
			<Text style={{ fontSize: 16, textAlign: 'center', color: '#6B7280', marginBottom: 24 }}>
				The app is missing required configuration. Please contact support or check your environment
				setup.
			</Text>
			<Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#9CA3AF' }}>
				Error: EXPO_PUBLIC_CONVEX_URL not configured
			</Text>
		</View>
	);
}

export function ConvexProvider({ children }: { children: React.ReactNode }) {
	const [client, setClient] = useState<ConvexReactClient | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		try {
			const convexClient = getConvexClient();
			if (!convexClient) {
				setHasError(true);
			} else {
				setClient(convexClient);
			}
		} catch (error) {
			console.error('ConvexProvider initialization error:', error);
			setHasError(true);
		} finally {
			setIsLoading(false);
		}
	}, []);

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color="#000" />
				<Text style={{ marginTop: 16, fontSize: 24, fontWeight: 'bold' }}>RITE</Text>
			</View>
		);
	}

	if (hasError || !client) {
		return <ConfigurationErrorScreen />;
	}

	return <ConvexReactProvider client={client}>{children}</ConvexReactProvider>;
}
