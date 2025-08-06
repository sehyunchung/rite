// RITE Design System - Tailwind Plugin
// Converts design tokens to Tailwind configuration

import { themes, spacing, radius, typography } from './index'

// Convert numeric spacing to pixel strings
const spacingWithUnits = Object.entries(spacing).reduce((acc, [key, value]) => {
  acc[key] = `${value}px`
  return acc
}, {})

// Convert numeric radius to pixel strings
const radiusWithUnits = Object.entries(radius).reduce((acc, [key, value]) => {
  acc[key] = value === 9999 ? '9999px' : `${value}px`
  return acc
}, {})

// Convert fontSize to rem units
const fontSizeWithUnits = Object.entries(typography.fontSize).reduce((acc, [key, value]) => {
  acc[key] = [`${value / 16}rem`, { lineHeight: typography.lineHeight.normal }]
  return acc
}, {})

export default {
  theme: {
    extend: {
      colors: {
        // Brand colors
        'brand-primary': themes.joshComeau.brand.primary,
        'brand-primary-dark': themes.joshComeau.brand.primaryDark,
        'brand-primary-light': themes.joshComeau.brand.primaryLight,
        
        // Neutrals
        neutral: themes.joshComeau.neutral,
        
        // Semantic
        success: themes.joshComeau.semantic.success,
        warning: themes.joshComeau.semantic.warning,
        error: themes.joshComeau.semantic.error,
        info: themes.joshComeau.semantic.info,
        
        // Functional
        'text-primary': themes.joshComeau.functional.textPrimary,
        'text-secondary': themes.joshComeau.functional.textSecondary,
        'text-muted': themes.joshComeau.functional.textMuted,
        'border-default': themes.joshComeau.functional.border,
        'divider': themes.joshComeau.functional.divider,
        
        // Component-specific (backwards compatibility)
        background: themes.joshComeau.neutral[800],
        foreground: themes.joshComeau.functional.textPrimary,
        card: {
          DEFAULT: themes.joshComeau.neutral[700],
          foreground: themes.joshComeau.functional.textPrimary,
        },
        popover: {
          DEFAULT: themes.joshComeau.neutral[700],
          foreground: themes.joshComeau.functional.textPrimary,
        },
        primary: {
          DEFAULT: themes.joshComeau.brand.primary,
          foreground: themes.joshComeau.neutral[0],
        },
        secondary: {
          DEFAULT: themes.joshComeau.neutral[600],
          foreground: themes.joshComeau.functional.textPrimary,
        },
        muted: {
          DEFAULT: themes.joshComeau.neutral[700],
          foreground: themes.joshComeau.functional.textSecondary,
        },
        accent: {
          DEFAULT: themes.joshComeau.neutral[600],
          foreground: themes.joshComeau.functional.textPrimary,
        },
        destructive: {
          DEFAULT: themes.joshComeau.semantic.error,
          foreground: themes.joshComeau.neutral[0],
        },
        border: themes.joshComeau.functional.border,
        input: themes.joshComeau.neutral[700],
        ring: themes.joshComeau.brand.primary,
      },
      
      spacing: spacingWithUnits,
      
      borderRadius: radiusWithUnits,
      
      fontSize: fontSizeWithUnits,
      
      fontWeight: typography.fontWeight,
      
      lineHeight: typography.lineHeight,
      
      letterSpacing: typography.letterSpacing,
      
      fontFamily: {
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono,
        suit: typography.fontFamily.sans,
      },
      
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow-sm': '0 0 10px rgba(233, 70, 255, 0.3)',
        'glow-md': '0 0 20px rgba(233, 70, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(233, 70, 255, 0.5)',
      },
    },
  },
}