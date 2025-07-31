// RITE Design System - Color Tokens
// Platform-agnostic color definitions

export const colors = {
  // Core brand colors
  brand: {
    primary: '#E946FF',      // Vibrant pink/magenta
    primaryDark: '#D01FFF',  // Darker variant
    primaryLight: '#F26FFF', // Lighter variant
  },

  // Neutral colors
  neutral: {
    0: '#FFFFFF',
    50: '#F8F8FA',
    100: '#E8E8ED',
    200: '#D1D1D9',
    300: '#A8A8B3',
    400: '#7A7A88',
    500: '#5A5A6A',
    600: '#3A3A4A',
    700: '#2A1F3F',  // Surface color
    800: '#1A0F2F',  // Background color
    900: '#0A0515',  // Deepest dark
  },

  // Semantic colors
  semantic: {
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Functional colors
  functional: {
    textPrimary: '#FFFFFF',
    textSecondary: '#A8A8B3',
    textMuted: '#7A7A88',
    border: '#2A1F3F',
    divider: '#3A3A4A',
    overlay: 'rgba(10, 5, 21, 0.8)',
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