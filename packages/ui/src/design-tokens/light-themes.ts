// RITE Design System - Light Theme Colorways
// Bright, airy palettes with dark text on light backgrounds

export const lightThemes = {
  // Monochrome Light - Clean, minimal grayscale
  mono: {
    name: 'Pure Monochrome',
    description: 'Clean and minimal grayscale theme',
    brand: {
      primary: '#000000',      // Pure black
      primaryDark: '#111111',
      primaryLight: '#333333',
    },
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    semantic: {
      success: '#525252',  // Dark gray
      warning: '#737373',  // Medium gray
      error: '#000000',    // Black
      info: '#404040',     // Darker gray
    },
    accent: '#888888',     // Medium gray
  },
};

// Helper to generate complete light theme
export const generateLightTheme = (theme: keyof typeof lightThemes) => {
  const palette = lightThemes[theme];
  
  return {
    brand: palette.brand,
    neutral: palette.neutral,
    semantic: palette.semantic,
    functional: {
      textPrimary: palette.neutral[900],      // Dark text on light bg
      textSecondary: palette.neutral[700],    // Slightly lighter
      textMuted: palette.neutral[500],        // Muted text
      textDisabled: palette.neutral[400],     // Disabled text
      textInverse: palette.neutral[0],        // White text for dark surfaces
      
      border: palette.neutral[200],           // Light borders
      borderStrong: palette.neutral[300],     // Stronger borders
      borderSubtle: palette.neutral[100],     // Subtle borders
      
      divider: palette.neutral[200],          // Dividers
      overlay: `${palette.neutral[900]}80`,   // Dark overlay with transparency
      
      backgroundElevated: palette.neutral[50], // Elevated surfaces
      backgroundSubtle: palette.neutral[50], // Subtle background
    },
    interactive: {
      hover: `${palette.brand.primary}1A`,    // 10% opacity
      active: `${palette.brand.primary}26`,   // 15% opacity
      focus: palette.brand.primary,
      disabled: palette.neutral[300],
    },
    accent: palette.accent,
  };
};

export type LightThemeKey = keyof typeof lightThemes;