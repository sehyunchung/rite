import { createTamagui, createFont } from '@tamagui/core'
import { createAnimations } from '@tamagui/animations-react-native'
import { themes } from './design-tokens/themes'

// Create animations
const animations = createAnimations({
  bouncy: {
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    damping: 20,
    stiffness: 60,
  },
  quick: {
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
})

// Note: Tamagui supports HSL colors natively on both web and mobile

// Create font using SUIT Variable
const font = createFont({
  family: 'var(--font-suit), SUIT Variable, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  size: {
    1: 10,
    2: 12,
    3: 14,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 28,
    9: 32,
    10: 36,
    11: 40,
    12: 48,
    13: 56,
    14: 64,
    15: 72,
    16: 96,
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 22,
    4: 24,
    5: 28,
    6: 30,
    7: 34,
    8: 40,
    9: 44,
    10: 48,
    11: 52,
    12: 64,
    13: 72,
    14: 80,
    15: 88,
    16: 112,
  },
  weight: {
    100: '100',
    200: '200',
    300: '300',
    400: '400',
    500: '500',
    600: '600',
    700: '700',
    800: '800',
    900: '900',
  },
  letterSpacing: {
    1: -0.5,
    2: -0.25,
    3: 0,
    4: 0.25,
    5: 0.5,
  },
})

// Extract tokens from Josh Comeau theme
const joshTheme = themes.joshComeau
const joshLightTheme = themes.joshComeauLight

export const config = createTamagui({
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  
  fonts: {
    body: font,
    heading: font,
  },

  tokens: {
    color: {
      // Brand colors
      brandPrimary: joshTheme.brand.primary,
      brandPrimaryDark: joshTheme.brand.primaryDark,
      brandPrimaryLight: joshTheme.brand.primaryLight,
      
      // Neutral colors - dark theme
      neutral0Dark: joshTheme.neutral[0],
      neutral100Dark: joshTheme.neutral[100],
      neutral200Dark: joshTheme.neutral[200],
      neutral300Dark: joshTheme.neutral[300],
      neutral400Dark: joshTheme.neutral[400],
      neutral500Dark: joshTheme.neutral[500],
      neutral600Dark: joshTheme.neutral[600],
      neutral700Dark: joshTheme.neutral[700],
      neutral800Dark: joshTheme.neutral[800],
      neutral900Dark: joshTheme.neutral[900],
      
      // Neutral colors - light theme
      neutral0Light: joshLightTheme.neutral[0],
      neutral100Light: joshLightTheme.neutral[100],
      neutral200Light: joshLightTheme.neutral[200],
      neutral300Light: joshLightTheme.neutral[300],
      neutral400Light: joshLightTheme.neutral[400],
      neutral500Light: joshLightTheme.neutral[500],
      neutral600Light: joshLightTheme.neutral[600],
      neutral700Light: joshLightTheme.neutral[700],
      neutral800Light: joshLightTheme.neutral[800],
      neutral900Light: joshLightTheme.neutral[900],
      
      // Semantic colors
      success: joshTheme.semantic.success,
      warning: joshTheme.semantic.warning,
      error: joshTheme.semantic.error,
      info: joshTheme.semantic.info,
      
      // Accent color
      accent: joshTheme.accent,
    },
    
    space: {
      0: 0,
      0.5: 2,
      1: 4,
      1.5: 6,
      2: 8,
      2.5: 10,
      3: 12,
      3.5: 14,
      4: 16,
      4.5: 18,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
      11: 44,
      12: 48,
      14: 56,
      16: 64,
      20: 80,
      24: 96,
      28: 112,
      32: 128,
      36: 144,
      40: 160,
      44: 176,
      48: 192,
      52: 208,
      56: 224,
      60: 240,
      64: 256,
      72: 288,
      80: 320,
      96: 384,
    },
    
    size: {
      0: 0,
      0.5: 2,
      1: 4,
      1.5: 6,
      2: 8,
      2.5: 10,
      3: 12,
      3.5: 14,
      4: 16,
      4.5: 18,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
      11: 44,
      12: 48,
      14: 56,
      16: 64,
      20: 80,
      24: 96,
      28: 112,
      32: 128,
    },
    
    radius: {
      0: 0,
      1: 3,
      2: 6,
      3: 9,
      4: 12,
      5: 15,
      6: 18,
      7: 21,
      8: 24,
      9: 27,
      10: 30,
      11: 33,
      12: 36,
      true: 12,
    },
    
    zIndex: {
      0: 0,
      1: 100,
      2: 200,
      3: 300,
      4: 400,
      5: 500,
    },
  },

  themes: {
    // Dark theme (Josh Comeau)
    dark: {
      // Background colors
      background: joshTheme.neutral[800],  // Use neutral scale for primary background
      backgroundHover: joshTheme.neutral[700],
      backgroundPress: joshTheme.functional.backgroundSubtle,
      backgroundFocus: joshTheme.neutral[700],
      backgroundStrong: joshTheme.functional.backgroundElevated,
      backgroundTransparent: 'transparent',
      
      // Text colors
      color: joshTheme.functional.textPrimary,
      colorHover: joshTheme.functional.textPrimary,
      colorPress: joshTheme.functional.textSecondary,
      colorFocus: joshTheme.functional.textPrimary,
      colorTransparent: 'transparent',
      
      // Border colors
      borderColor: joshTheme.functional.border,
      borderColorHover: joshTheme.functional.borderStrong,
      borderColorFocus: joshTheme.brand.primary,
      borderColorPress: joshTheme.functional.borderStrong,
      
      // Shadows
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowColorHover: 'rgba(0,0,0,0.6)',
      shadowColorPress: 'rgba(0,0,0,0.4)',
      shadowColorFocus: 'rgba(0,0,0,0.5)',
      
      // Button specific
      buttonPrimaryBg: joshTheme.brand.primary,
      buttonPrimaryBgHover: joshTheme.brand.primaryDark,
      buttonPrimaryText: 'white',  // White text on primary button
      
      // Semantic colors
      successBg: joshTheme.semantic.success,
      errorBg: joshTheme.semantic.error,
      warningBg: joshTheme.semantic.warning,
      infoBg: joshTheme.semantic.info,
    },
    
    // Light theme (Josh Comeau Light)
    light: {
      // Background colors
      background: joshLightTheme.neutral[900],  // Light background
      backgroundHover: joshLightTheme.neutral[800],
      backgroundPress: joshLightTheme.functional.backgroundSubtle,
      backgroundFocus: joshLightTheme.neutral[800],
      backgroundStrong: joshLightTheme.functional.backgroundElevated,
      backgroundTransparent: 'transparent',
      
      // Text colors
      color: joshLightTheme.functional.textPrimary,
      colorHover: joshLightTheme.functional.textPrimary,
      colorPress: joshLightTheme.functional.textSecondary,
      colorFocus: joshLightTheme.functional.textPrimary,
      colorTransparent: 'transparent',
      
      // Border colors
      borderColor: joshLightTheme.functional.border,
      borderColorHover: joshLightTheme.functional.borderStrong,
      borderColorFocus: joshLightTheme.brand.primary,
      borderColorPress: joshLightTheme.functional.borderStrong,
      
      // Shadows
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowColorHover: 'rgba(0,0,0,0.15)',
      shadowColorPress: 'rgba(0,0,0,0.05)',
      shadowColorFocus: 'rgba(0,0,0,0.1)',
      
      // Button specific
      buttonPrimaryBg: joshLightTheme.brand.primary,
      buttonPrimaryBgHover: joshLightTheme.brand.primaryDark,
      buttonPrimaryText: 'white',  // White text on primary button
      
      // Semantic colors
      successBg: joshLightTheme.semantic.success,
      errorBg: joshLightTheme.semantic.error,
      warningBg: joshLightTheme.semantic.warning,
      infoBg: joshLightTheme.semantic.info,
    },
  },
  
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
})

export type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config