// RITE Design System - Main Export
// Centralized design tokens for web and mobile platforms

export * from './colors'
export * from './typography'
export * from './spacing'
export * from './shadows'
export * from './radius'

// New theme system exports
export * from './alternative-themes'
export * from './colors-refined'
export * from './colorways'
export * from './josh-comeau-theme'
export * from './light-themes'
export * from './radical-palettes'

// Re-export as unified tokens object
import { colors, webColors, mobileColors } from './colors'
import { typography, typographyVariants } from './typography'
import { spacing, spacingPatterns } from './spacing'
import { webShadows, mobileShadows } from './shadows'
import { radius, radiusPatterns } from './radius'

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows: {
    web: webShadows,
    mobile: mobileShadows,
  },
  // Platform-specific
  web: {
    colors: webColors,
    shadows: webShadows,
  },
  mobile: {
    colors: mobileColors,
    shadows: mobileShadows,
  },
  // Patterns
  patterns: {
    spacing: spacingPatterns,
    radius: radiusPatterns,
    typography: typographyVariants,
  },
} as const

export type DesignTokens = typeof tokens