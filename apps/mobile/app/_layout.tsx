import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import './index.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ConvexProvider } from '../providers/ConvexProvider';
import { PostHogProviderWrapper } from '../providers/PostHogProvider';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import AppNavigator from '../components/AppNavigator';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'SUIT-Regular': require('../assets/fonts/SUIT-Regular.otf'),
    'SUIT-Medium': require('../assets/fonts/SUIT-Medium.otf'),
    'SUIT-SemiBold': require('../assets/fonts/SUIT-SemiBold.otf'),
    'SUIT-Bold': require('../assets/fonts/SUIT-Bold.otf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (error) {
    console.error('Font loading error:', error);
  }

  if (!loaded) {
    // Show loading screen while fonts load
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'hsl(210deg 15% 12%)' }}>
        <Text style={{ color: 'hsl(225deg 100% 75%)', fontSize: 24 }}>Loading fonts...</Text>
      </View>
    );
  }

  // Custom RITE dark theme using Josh Comeau colors
  const RiteDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: 'hsl(225deg 100% 75%)',     // Josh Comeau primary
      background: 'hsl(210deg 15% 12%)',   // Josh Comeau neutral-800
      card: 'hsl(210deg 15% 18%)',         // Josh Comeau neutral-700
      text: 'hsl(210deg 10% 90%)',         // Josh Comeau textPrimary
      border: 'hsl(210deg 15% 18%)',       // Josh Comeau border
      notification: 'hsl(225deg 100% 75%)', // Josh Comeau primary
    },
  };

  return (
    <ErrorBoundary>
      <PostHogProviderWrapper>
        <ConvexProvider>
          <AuthProvider>
            <ThemeProvider value={RiteDarkTheme}>
              <AppNavigator />
              <StatusBar style="light" />
            </ThemeProvider>
          </AuthProvider>
        </ConvexProvider>
      </PostHogProviderWrapper>
    </ErrorBoundary>
  );
}
