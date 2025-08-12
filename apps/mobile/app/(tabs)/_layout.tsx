import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { themeColors } from '@/lib/theme-colors';

export default function TabLayout() {
	const { width } = useWindowDimensions();
	const isLargeScreen = width > 768;

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: themeColors.brand.primary,
				tabBarInactiveTintColor: themeColors.neutral[400],
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: {
					backgroundColor: themeColors.neutral[700],
					borderTopColor: themeColors.neutral[700],
					borderTopWidth: 1,
					height:
						Platform.OS === 'web'
							? isLargeScreen
								? 72
								: 68
							: Platform.OS === 'ios'
								? 84
								: 64,
					paddingBottom:
						Platform.OS === 'web'
							? isLargeScreen
								? 16
								: 12
							: Platform.OS === 'ios'
								? 24
								: 8,
					paddingTop: 12,
					paddingHorizontal: isLargeScreen ? 32 : 24,
					...(Platform.OS === 'ios' ? { position: 'absolute' as const } : {}),
					...(Platform.OS === 'web' && isLargeScreen
						? {
								// For web desktop, make tab bar more like a sidebar or top nav
								borderTopWidth: 0,
								borderBottomWidth: 1,
								borderBottomColor: themeColors.neutral[600],
							}
						: {}),
				},
				tabBarLabelStyle: {
					fontSize: isLargeScreen ? 12 : 11,
					fontFamily: 'SUIT-Medium',
					marginTop: Platform.OS === 'web' ? 2 : 4,
					letterSpacing: -0.2,
				},
				tabBarIconStyle: {
					marginBottom: Platform.OS === 'web' ? -2 : 0,
				},
				tabBarItemStyle: {
					paddingTop: Platform.OS === 'web' ? 6 : 8,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Dashboard',
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? 'home' : 'home-outline'}
							size={24}
							color={color}
							accessibilityLabel="Dashboard tab"
							accessibilityHint="Navigate to the main dashboard screen"
						/>
					),
					tabBarAccessibilityLabel: 'Dashboard',
				}}
			/>
			<Tabs.Screen
				name="events"
				options={{
					title: 'Events',
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? 'calendar' : 'calendar-outline'}
							size={24}
							color={color}
							accessibilityLabel="Events tab"
							accessibilityHint="View and manage your events"
						/>
					),
					tabBarAccessibilityLabel: 'Events',
				}}
			/>
			<Tabs.Screen
				name="create"
				options={{
					title: 'Create',
					tabBarIcon: ({ color, focused }) => (
						<View
							style={{
								width: 24,
								height: 24,
								backgroundColor: color,
								borderRadius: 6,
								alignItems: 'center',
								justifyContent: 'center',
							}}
							accessible={true}
							accessibilityLabel="Create event tab"
							accessibilityHint="Navigate to create a new event"
							accessibilityRole="button"
						>
							<Ionicons name="add" size={20} color={themeColors.neutral[800]} />
						</View>
					),
					tabBarAccessibilityLabel: 'Create Event',
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					title: 'Profile',
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? 'person' : 'person-outline'}
							size={24}
							color={color}
							accessibilityLabel="Profile tab"
							accessibilityHint="View and manage your profile"
						/>
					),
					tabBarAccessibilityLabel: 'Profile',
				}}
			/>
		</Tabs>
	);
}
