import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { PostHogProvider } from 'posthog-react-native';
import { POSTHOG_CONFIG, getPostHogEnvVars } from '@rite/posthog-config';

interface PostHogProviderWrapperProps {
	children: React.ReactNode;
}

export function PostHogProviderWrapper({ children }: PostHogProviderWrapperProps) {
	const [isClient, setIsClient] = useState(false);
	const { key, host } = getPostHogEnvVars();

	// Ensure we only initialize PostHog on the client side
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Don't initialize PostHog during SSR or if no key is provided
	if (!isClient || !key || Platform.OS === 'web') {
		if (!key && Platform.OS !== 'web') {
			console.warn('PostHog key not found in environment variables');
		}
		return <>{children}</>;
	}

	return (
		<PostHogProvider
			apiKey={key}
			options={{
				...POSTHOG_CONFIG.mobile,
				host,
			}}
		>
			{children}
		</PostHogProvider>
	);
}
