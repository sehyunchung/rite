import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';
import './index.css';
import { ConvexProvider } from '../providers/ConvexProvider';
import { PostHogProviderWrapper } from '../providers/PostHogProvider';
import { AuthProvider } from '../contexts/AuthContext';
import { I18nProvider } from '../contexts/I18nContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NavigationThemeWrapper } from '../components/NavigationThemeProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { registerServiceWorker } from './registerServiceWorker';
import { themeColors } from '../lib/theme-colors';

export default function RootLayout() {
	// Register service worker for PWA support on web
	useEffect(() => {
		registerServiceWorker();
	}, []);

	const [loaded, error] = useFonts({
		'SUIT-Regular': require('../assets/fonts/SUIT-Regular.otf'),
		'SUIT-Medium': require('../assets/fonts/SUIT-Medium.otf'),
		'SUIT-SemiBold': require('../assets/fonts/SUIT-SemiBold.otf'),
		'SUIT-Bold': require('../assets/fonts/SUIT-Bold.otf'),
	});

	if (error) {
		console.error('Font loading error:', error);
	}

	if (!loaded) {
		// Show loading screen while fonts load
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'hsl(210deg 15% 12%)',
				}}
			>
				<Text style={{ color: 'hsl(225deg 100% 75%)', fontSize: 24 }}>Loading fonts...</Text>
			</View>
		);
	}

	return (
		<ErrorBoundary>
			<ThemeProvider>
				<I18nProvider>
					<PostHogProviderWrapper>
						<ConvexProvider>
							<AuthProvider>
								<NavigationThemeWrapper>
									<View className="flex-1 h-full min-h-[100dvh]">
										<Stack>
											<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
											<Stack.Screen
												name="auth"
												options={{
													headerShown: false,
													presentation: 'modal',
												}}
											/>
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
												name="submission/[token]"
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
										<StatusBar style="light" />
									</View>
								</NavigationThemeWrapper>
							</AuthProvider>
						</ConvexProvider>
					</PostHogProviderWrapper>
				</I18nProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}
