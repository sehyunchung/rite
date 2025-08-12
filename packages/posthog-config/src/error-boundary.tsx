import * as React from 'react';

interface PostHogErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface PostHogErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

export class PostHogErrorBoundary extends React.Component<
	PostHogErrorBoundaryProps,
	PostHogErrorBoundaryState
> {
	constructor(props: PostHogErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): PostHogErrorBoundaryState {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log PostHog-related errors
		console.error('PostHog Error Boundary caught an error:', error, errorInfo);

		// Call optional error handler
		this.props.onError?.(error, errorInfo);

		// Try to capture error with PostHog if available
		try {
			if (typeof window !== 'undefined' && (window as any).posthog) {
				(window as any).posthog.capture('posthog_error_boundary_triggered', {
					error_message: error.message,
					error_stack: error.stack,
					component_stack: errorInfo.componentStack,
					error_boundary: 'PostHogErrorBoundary',
				});
			}
		} catch (trackingError) {
			console.warn('Failed to track error boundary event:', trackingError);
		}
	}

	render() {
		if (this.state.hasError) {
			// Render fallback UI or just the children without PostHog
			return this.props.fallback || this.props.children;
		}

		return this.props.children;
	}
}

// Hook for handling PostHog initialization errors
export function usePostHogErrorHandler() {
	return {
		handlePostHogError: (error: Error, context: string) => {
			console.error(`PostHog error in ${context}:`, error);

			// Don't break the app, just log and continue
			try {
				if (typeof window !== 'undefined' && (window as any).posthog) {
					(window as any).posthog.capture('posthog_initialization_error', {
						error_message: error.message,
						error_context: context,
						timestamp: new Date().toISOString(),
					});
				}
			} catch (trackingError) {
				console.warn('Failed to track PostHog initialization error:', trackingError);
			}
		},
	};
}
