// RITE Design System - Color Tokens
// Platform-agnostic color definitions

export const colors = {
  // Core brand colors - Josh Comeau theme
  brand: {
    primary: 'hsl(225deg 100% 75%)',      // Josh Comeau primary blue
    primaryDark: 'hsl(225deg 100% 60%)',  // Josh Comeau primaryDark
    primaryLight: 'hsl(225deg 100% 85%)', // Josh Comeau primaryLight
  },

  // Neutral colors - Josh Comeau theme
  neutral: {
    0: 'hsl(210deg 25% 96%)',     // #F5F5F8
    50: 'hsl(210deg 25% 88%)',    // #DDDDE5
    100: 'hsl(210deg 20% 77%)',   // #C4C4D1
    200: 'hsl(210deg 14% 66%)',   // #A8A8BD
    300: 'hsl(210deg 12% 55%)',   // #8C8CA3
    400: 'hsl(210deg 8% 50%)',    // #70707F
    500: 'hsl(210deg 9% 40%)',    // #616166
    600: 'hsl(210deg 10% 30%)',   // #47474D
    700: 'hsl(210deg 15% 18%)',   // #26262E
    800: 'hsl(210deg 15% 12%)',   // #1A1A1F
    900: 'hsl(210deg 15% 6%)',    // #0F0F10
  },

  // Semantic colors - Josh Comeau theme
  semantic: {
    success: 'hsl(160deg 100% 40%)',  // #00CC66
    warning: 'hsl(40deg 100% 50%)',   // #FFCC00
    error: 'hsl(340deg 95% 60%)',     // #FF3366
    info: 'hsl(225deg 100% 80%)',     // #9999FF
  },

  // Functional colors - Josh Comeau theme
  functional: {
    textPrimary: 'hsl(210deg 10% 90%)',     // #E0E0E6
    textSecondary: 'hsl(210deg 12% 55%)',   // #8C8CA3
    textMuted: 'hsl(210deg 8% 50%)',        // #70707F
    border: 'hsl(210deg 15% 18%)',          // #26262E
    divider: 'hsl(210deg 15% 18%)',         // #26262E
    overlay: 'hsl(210deg 15% 6% / 0.75)',   // #0F0F10BF
  },
} as const

// Type-safe color getter
export type ColorToken = keyof typeof colors
export type ColorValue = typeof colors[ColorToken][keyof typeof colors[ColorToken]]

// Platform-specific color mappings
export const webColors = {
  background: colors.neutral[800],
  foreground: colors.functional.textPrimary,
  card: colors.neutral[700],
  'card-foreground': colors.functional.textPrimary,
  popover: colors.neutral[700],
  'popover-foreground': colors.functional.textPrimary,
  primary: colors.brand.primary,
  'primary-foreground': colors.neutral[0],
  secondary: colors.neutral[600],
  'secondary-foreground': colors.functional.textPrimary,
  muted: colors.neutral[700],
  'muted-foreground': colors.functional.textSecondary,
  accent: colors.neutral[600],
  'accent-foreground': colors.functional.textPrimary,
  destructive: colors.semantic.error,
  'destructive-foreground': colors.neutral[0],
  border: colors.functional.border,
  input: colors.neutral[700],
  ring: colors.brand.primary,
} as const

// Mobile (React Native) color mappings
export const mobileColors = {
  background: colors.neutral[800],
  surface: colors.neutral[700],
  primary: colors.brand.primary,
  textPrimary: colors.functional.textPrimary,
  textSecondary: colors.functional.textSecondary,
  border: colors.functional.border,
  divider: colors.functional.divider,
  ...colors.semantic,
} as const