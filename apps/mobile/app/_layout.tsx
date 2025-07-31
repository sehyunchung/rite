import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ConvexProvider } from '../providers/ConvexProvider';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
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
