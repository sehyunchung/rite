import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView } from 'react-native';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
		};
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
		this.setState({
			error,
			errorInfo,
		});
	}

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<ScrollView
					className="flex-1 bg-red-50"
					contentContainerClassName="flex-1 justify-center items-center p-5"
				>
					<View className="items-center" style={{ maxWidth: 300 }}>
						<Text className="text-2xl font-bold text-red-600 mb-4 text-center">
							Something went wrong
						</Text>

						<Text className="text-base text-center text-gray-500 mb-6 leading-6">
							We&apos;re sorry, but an unexpected error occurred. Please restart the app or contact
							support if the problem persists.
						</Text>

						{__DEV__ && this.state.error && (
							<View className="bg-gray-100 p-3 rounded-lg w-full mt-4">
								<Text className="text-xs font-mono text-gray-700 mb-2 font-bold">
									Error Details (Development Mode):
								</Text>
								<Text className="text-xs font-mono text-gray-500">{this.state.error.message}</Text>
								{this.state.error.stack && (
									<Text className="text-xs font-mono text-gray-400 mt-2">
										{this.state.error.stack}
									</Text>
								)}
							</View>
						)}
					</View>
				</ScrollView>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
