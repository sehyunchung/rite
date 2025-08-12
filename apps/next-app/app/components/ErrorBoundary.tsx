'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@rite/ui';
import { Button } from '@rite/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: (error: Error, reset: () => void) => React.ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error to console in development
		if (process.env.NODE_ENV === 'development') {
			console.error('ErrorBoundary caught an error:', error, errorInfo);
		}

		// Call optional error handler
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	reset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.reset);
			}

			// Default error UI
			return (
				<Card className="border-destructive">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<AlertCircle className="h-5 w-5" />
							Something went wrong
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							An unexpected error occurred. Please try again or contact support if the problem
							persists.
						</p>
						{process.env.NODE_ENV === 'development' && (
							<div className="rounded-md bg-muted p-3">
								<p className="font-mono text-xs">{this.state.error.message}</p>
							</div>
						)}
						<Button onClick={this.reset} variant="outline" size="sm" className="gap-2">
							<RefreshCw className="h-4 w-4" />
							Try Again
						</Button>
					</CardContent>
				</Card>
			);
		}

		return this.props.children;
	}
}

// Hook for using error boundary with function components
export function useErrorHandler() {
	const [error, setError] = React.useState<Error | null>(null);

	React.useEffect(() => {
		if (error) {
			throw error;
		}
	}, [error]);

	return setError;
}
