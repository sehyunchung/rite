import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ConvexProvider } from '../providers/ConvexProvider';
import ErrorBoundary from '../components/ErrorBoundary';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A0F2F' }}>
        <Text style={{ color: '#E946FF', fontSize: 24 }}>Loading fonts...</Text>
      </View>
    );
  }

  // Custom RITE dark theme
  const RiteDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#E946FF',
      background: '#1A0F2F',
      card: '#2A1F3F',
      text: '#FFFFFF',
      border: '#2A1F3F',
      notification: '#E946FF',
    },
  };

  return (
    <ErrorBoundary>
      <ConvexProvider>
        <ThemeProvider value={RiteDarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </ConvexProvider>
    </ErrorBoundary>
  );
}
