import { tokens } from '@rite/ui/design-tokens'
import tailwindAnimate from 'tailwindcss-animate'

// Convert numeric values to pixel strings
const pxValue = (value) => `${value}px`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  prefix: '',
  // Design system tokens will be added to theme.extend
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        'suit': ['var(--font-suit)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'sans': ['var(--font-suit)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Brand colors from design system
        'brand-primary': tokens.colors.brand.primary,
        'brand-primary-dark': tokens.colors.brand.primaryDark,
        'brand-primary-light': tokens.colors.brand.primaryLight,
        
        // Neutral palette
        neutral: tokens.colors.neutral,
        
        // Semantic colors
        success: tokens.colors.semantic.success,
        warning: tokens.colors.semantic.warning,
        error: tokens.colors.semantic.error,
        info: tokens.colors.semantic.info,
        
        // Keep CSS variable fallbacks for gradual migration
        border: tokens.colors.functional.border,
        input: tokens.colors.neutral[700],
        ring: tokens.colors.brand.primary,
        background: tokens.colors.neutral[800],
        foreground: tokens.colors.functional.textPrimary,
        primary: {
          DEFAULT: tokens.colors.brand.primary,
          foreground: tokens.colors.neutral[0],
        },
        secondary: {
          DEFAULT: tokens.colors.neutral[600],
          foreground: tokens.colors.functional.textPrimary,
        },
        destructive: {
          DEFAULT: tokens.colors.semantic.error,
          foreground: tokens.colors.neutral[0],
        },
        muted: {
          DEFAULT: tokens.colors.neutral[700],
          foreground: tokens.colors.functional.textSecondary,
        },
        accent: {
          DEFAULT: tokens.colors.neutral[600],
          foreground: tokens.colors.functional.textPrimary,
        },
        popover: {
          DEFAULT: tokens.colors.neutral[700],
          foreground: tokens.colors.functional.textPrimary,
        },
        card: {
          DEFAULT: tokens.colors.neutral[700],
          foreground: tokens.colors.functional.textPrimary,
        },
      },
      spacing: Object.fromEntries(
        Object.entries(tokens.spacing).map(([key, value]) => [key, pxValue(value)])
      ),
      borderRadius: {
        ...Object.fromEntries(
          Object.entries(tokens.radius).map(([key, value]) => [
            key,
            value === 9999 ? '9999px' : pxValue(value)
          ])
        ),
        // Keep legacy values
        lg: pxValue(tokens.radius.lg),
        md: pxValue(tokens.radius.md),
        sm: pxValue(tokens.radius.sm),
      },
      fontSize: Object.fromEntries(
        Object.entries(tokens.typography.fontSize).map(([key, value]) => [
          key,
          [`${value / 16}rem`, { lineHeight: tokens.typography.lineHeight.normal }]
        ])
      ),
      fontWeight: tokens.typography.fontWeight,
      lineHeight: tokens.typography.lineHeight,
      letterSpacing: tokens.typography.letterSpacing,
      boxShadow: {
        ...tokens.web.shadows,
        // Keep the xs shadow override
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindAnimate],
}