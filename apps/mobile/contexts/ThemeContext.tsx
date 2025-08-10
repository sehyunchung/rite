/**
 * Theme Context for managing dynamic theme switching in mobile app
 * Provides real-time theme switching similar to Next.js ThemeSwitcher
 */
import * as React from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { themes, generateThemeCSS, type ThemeKey } from '@rite/ui/design-tokens';

interface ThemeContextType {
  currentTheme: ThemeKey;
  setTheme: (theme: ThemeKey) => Promise<void>;
  availableThemes: Array<{
    key: ThemeKey;
    name: string;
    description: string;
    type: 'light' | 'dark';
  }>;
  isLoading: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | null>(null);

// Storage key for persisted theme preference
const THEME_STORAGE_KEY = 'user-theme';
const DEFAULT_THEME: ThemeKey = 'joshComeau';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = React.useState<ThemeKey>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = React.useState(true);

  // Available themes list
  const availableThemes = React.useMemo(() => {
    return Object.entries(themes).map(([key, theme]) => ({
      key: key as ThemeKey,
      name: theme.name,
      description: theme.description,
      type: theme.type,
    }));
  }, []);

  // Get stored theme preference
  const getStoredTheme = React.useCallback(async (): Promise<ThemeKey | null> => {
    try {
      const storedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (storedTheme && storedTheme in themes) {
        return storedTheme as ThemeKey;
      }
    } catch (error) {
      console.warn('Failed to get stored theme:', error);
    }
    return null;
  }, []);

  // Store theme preference
  const storeTheme = React.useCallback(async (theme: ThemeKey): Promise<void> => {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to store theme:', error);
    }
  }, []);

  // Apply theme to DOM (web only)
  const applyThemeToDOM = React.useCallback((theme: ThemeKey) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const themeData = themes[theme];
      const css = generateThemeCSS(themeData);
      
      // Remove existing theme style element
      const existingStyle = document.getElementById('dynamic-theme-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Inject new theme CSS
      const style = document.createElement('style');
      style.id = 'dynamic-theme-styles';
      style.textContent = css;
      document.head.appendChild(style);
      
      // Update theme-color meta tag
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.setAttribute('content', themeData.brand.primary);
    }
  }, []);

  // Initialize theme on mount
  React.useEffect(() => {
    async function initializeTheme() {
      try {
        const storedTheme = await getStoredTheme();
        const initialTheme = storedTheme || DEFAULT_THEME;
        
        setCurrentTheme(initialTheme);
        applyThemeToDOM(initialTheme);
      } catch (error) {
        console.warn('Failed to initialize theme:', error);
        setCurrentTheme(DEFAULT_THEME);
        applyThemeToDOM(DEFAULT_THEME);
      } finally {
        setIsLoading(false);
      }
    }

    initializeTheme();
  }, [getStoredTheme, applyThemeToDOM]);

  // Handle theme changes
  const setTheme = React.useCallback(
    async (theme: ThemeKey) => {
      try {
        setCurrentTheme(theme);
        applyThemeToDOM(theme);
        await storeTheme(theme);
      } catch (error) {
        console.warn('Failed to set theme:', error);
      }
    },
    [applyThemeToDOM, storeTheme]
  );

  const value = React.useMemo(
    () => ({
      currentTheme,
      setTheme,
      availableThemes,
      isLoading,
    }),
    [currentTheme, setTheme, availableThemes, isLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextType {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get current theme data
 */
export function useCurrentThemeData() {
  const { currentTheme } = useTheme();
  return themes[currentTheme];
}