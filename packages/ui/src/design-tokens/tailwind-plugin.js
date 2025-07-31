// RITE Design System - Tailwind Plugin
// Converts design tokens to Tailwind configuration

const { colors, spacing, radius, typography } = require('./index')

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

module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand colors
        'brand-primary': colors.brand.primary,
        'brand-primary-dark': colors.brand.primaryDark,
        'brand-primary-light': colors.brand.primaryLight,
        
        // Neutrals
        neutral: colors.neutral,
        
        // Semantic
        success: colors.semantic.success,
        warning: colors.semantic.warning,
        error: colors.semantic.error,
        info: colors.semantic.info,
        
        // Functional
        'text-primary': colors.functional.textPrimary,
        'text-secondary': colors.functional.textSecondary,
        'text-muted': colors.functional.textMuted,
        'border-default': colors.functional.border,
        'divider': colors.functional.divider,
        
        // Component-specific (backwards compatibility)
        background: colors.neutral[800],
        foreground: colors.functional.textPrimary,
        card: {
          DEFAULT: colors.neutral[700],
          foreground: colors.functional.textPrimary,
        },
        popover: {
          DEFAULT: colors.neutral[700],
          foreground: colors.functional.textPrimary,
        },
        primary: {
          DEFAULT: colors.brand.primary,
          foreground: colors.neutral[0],
        },
        secondary: {
          DEFAULT: colors.neutral[600],
          foreground: colors.functional.textPrimary,
        },
        muted: {
          DEFAULT: colors.neutral[700],
          foreground: colors.functional.textSecondary,
        },
        accent: {
          DEFAULT: colors.neutral[600],
          foreground: colors.functional.textPrimary,
        },
        destructive: {
          DEFAULT: colors.semantic.error,
          foreground: colors.neutral[0],
        },
        border: colors.functional.border,
        input: colors.neutral[700],
        ring: colors.brand.primary,
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