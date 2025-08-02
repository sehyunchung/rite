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
        // Brand colors using CSS variables for dynamic theming
        'brand-primary': 'var(--brand-primary, #E946FF)',
        'brand-primary-dark': 'var(--brand-primary-dark, #D01FFF)',
        'brand-primary-light': 'var(--brand-primary-light, #F26FFF)',
        
        // Neutral palette using CSS variables
        neutral: {
          0: 'var(--neutral-0, #FFFFFF)',
          50: 'var(--neutral-50, #F8F8FA)',
          100: 'var(--neutral-100, #E8E8ED)',
          200: 'var(--neutral-200, #D1D1D9)',
          300: 'var(--neutral-300, #A8A8B3)',
          400: 'var(--neutral-400, #7A7A88)',
          500: 'var(--neutral-500, #5A5A6A)',
          600: 'var(--neutral-600, #3A3A4A)',
          700: 'var(--neutral-700, #2A1F3F)',
          800: 'var(--neutral-800, #1A0F2F)',
          900: 'var(--neutral-900, #0A0515)',
        },
        
        // Semantic colors using CSS variables
        success: 'var(--color-success, #4ADE80)',
        warning: 'var(--color-warning, #FBBF24)',
        error: 'var(--color-error, #EF4444)',
        info: 'var(--color-info, #3B82F6)',
        
        // Component colors using CSS variables
        border: 'var(--border-default, #2A1F3F)',
        input: 'var(--neutral-700, #2A1F3F)',
        ring: 'var(--brand-primary, #E946FF)',
        background: 'var(--bg-primary, #1A0F2F)',
        foreground: 'var(--text-primary, #FFFFFF)',
        primary: {
          DEFAULT: 'var(--brand-primary, #E946FF)',
          foreground: 'var(--neutral-0, #FFFFFF)',
        },
        secondary: {
          DEFAULT: 'var(--neutral-600, #3A3A4A)',
          foreground: 'var(--text-primary, #FFFFFF)',
        },
        destructive: {
          DEFAULT: 'var(--color-error, #EF4444)',
          foreground: 'var(--neutral-0, #FFFFFF)',
        },
        muted: {
          DEFAULT: 'var(--neutral-700, #2A1F3F)',
          foreground: 'var(--text-secondary, #A8A8B3)',
        },
        accent: {
          DEFAULT: 'var(--neutral-600, #3A3A4A)',
          foreground: 'var(--text-primary, #FFFFFF)',
        },
        popover: {
          DEFAULT: 'var(--bg-elevated, #2A1F3F)',
          foreground: 'var(--text-primary, #FFFFFF)',
        },
        card: {
          DEFAULT: 'var(--bg-elevated, #2A1F3F)',
          foreground: 'var(--text-primary, #FFFFFF)',
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