import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import AuthScreen from '../app/auth';
import { View, Text } from 'react-native';
import { themeColors } from '../lib/theme-colors';

export default function AppNavigator() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<View
				className="flex-1 justify-center items-center bg-neutral-800"
				accessible={true}
				accessibilityRole="progressbar"
				accessibilityLabel="Loading application"
			>
				<Text
					className="text-brand-primary text-2xl"
					accessible={true}
					accessibilityRole="text"
				>
					Loading...
				</Text>
			</View>
		);
	}

	if (!user) {
		return <AuthScreen />;
	}

	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen
				name="events/[eventId]"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="events/[eventId]/edit"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="events/[eventId]/submissions"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="settings"
				options={{
					headerShown: true,
					title: 'Settings',
					headerStyle: {
						backgroundColor: themeColors.neutral[800],
					},
					headerTintColor: '#FFFFFF',
					headerTitleStyle: {
						fontFamily: 'SUIT-SemiBold',
					},
				}}
			/>
			<Stack.Screen name="+not-found" />
		</Stack>
	);
}
