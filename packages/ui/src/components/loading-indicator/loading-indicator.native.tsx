import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import '@rite/ui/types/nativewind';

interface LoadingIndicatorProps {
	className?: string;
}

export function LoadingIndicator({ className = '' }: LoadingIndicatorProps) {
	return (
		<View className={`items-center ${className}`}>
			<Text className="font-medium text-brand-primary text-4xl">RITE</Text>
			<ActivityIndicator size="small" className="text-brand-primary" style={{ marginTop: 8 }} />
		</View>
	);
}

export function FullScreenLoading() {
	return (
		<View
			className="absolute inset-0 bg-bg-primary items-center justify-center"
			style={{ zIndex: 50 }}
		>
			<LoadingIndicator />
		</View>
	);
}
