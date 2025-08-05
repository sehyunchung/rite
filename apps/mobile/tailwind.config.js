const { tokens } = require('@rite/ui/design-tokens');

// Josh Comeau theme static values for mobile (from themes.ts)
const defaultTheme = {
  brand: {
    primary: 'hsl(225, 100%, 75%)',      // #7C7CFF
    primaryDark: 'hsl(225, 100%, 60%)',  // #5C5CFF
    primaryLight: 'hsl(225, 100%, 85%)', // #9C9CFF
  },
  neutral: {
    0: 'hsl(210, 25%, 96%)',     // #F5F5F8
    50: 'hsl(210, 25%, 88%)',    // #DDDDE5
    100: 'hsl(210, 20%, 77%)',   // #C4C4D1
    200: 'hsl(210, 14%, 66%)',   // #A8A8BD
    300: 'hsl(210, 12%, 55%)',   // #8C8CA3
    400: 'hsl(210, 8%, 50%)',    // #70707F
    500: 'hsl(210, 9%, 40%)',    // #616166
    600: 'hsl(210, 10%, 30%)',   // #47474D
    700: 'hsl(210, 15%, 18%)',   // #26262E
    800: 'hsl(210, 15%, 12%)',   // #1A1A1F
    900: 'hsl(210, 15%, 6%)',    // #0F0F10
  },
  semantic: {
    success: 'hsl(160, 100%, 40%)',  // #00CC66
    warning: 'hsl(40, 100%, 50%)',   // #FFCC00
    error: 'hsl(340, 95%, 60%)',     // #FF3366
    info: 'hsl(225, 100%, 80%)',     // #9999FF
  },
  functional: {
    textPrimary: 'hsl(210, 10%, 90%)',     // #E0E0E6
    textSecondary: 'hsl(210, 12%, 55%)',   // #8C8CA3
    textMuted: 'hsl(210, 8%, 50%)',        // #70707F
    border: 'hsl(210, 15%, 18%)',          // #26262E
  },
};

// Convert numeric values to pixel strings
const pxValue = (value) => `${value}px`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'suit': ['SUIT', ...tokens.typography.fontFamily.sans],
        'sans': ['SUIT', ...tokens.typography.fontFamily.sans],
      },
      colors: {
        // Brand colors from design system (with CSS variable fallback for web)
        'brand-primary': 'var(--brand-primary, hsl(225, 100%, 75%))',
        'brand-primary-dark': 'var(--brand-primary-dark, hsl(225, 100%, 60%))',
        'brand-primary-light': 'var(--brand-primary-light, hsl(225, 100%, 85%))',
        
        // Neutral palette (with CSS variable fallback for web)
        neutral: {
          0: 'var(--neutral-0, hsl(210, 25%, 96%))',
          50: 'var(--neutral-50, hsl(210, 25%, 88%))',
          100: 'var(--neutral-100, hsl(210, 20%, 77%))',
          200: 'var(--neutral-200, hsl(210, 14%, 66%))',
          300: 'var(--neutral-300, hsl(210, 12%, 55%))',
          400: 'var(--neutral-400, hsl(210, 8%, 50%))',
          500: 'var(--neutral-500, hsl(210, 9%, 40%))',
          600: 'var(--neutral-600, hsl(210, 10%, 30%))',
          700: 'var(--neutral-700, hsl(210, 15%, 18%))',
          800: 'var(--neutral-800, hsl(210, 15%, 12%))',
          900: 'var(--neutral-900, hsl(210, 15%, 6%))',
        },
        
        // Semantic colors
        success: defaultTheme.semantic.success,
        warning: defaultTheme.semantic.warning,
        error: defaultTheme.semantic.error,
        info: defaultTheme.semantic.info,
        
        // Functional colors
        border: defaultTheme.functional.border,
        background: defaultTheme.neutral[800],
        foreground: defaultTheme.functional.textPrimary,
        
        // Text colors for Typography component (with CSS variable fallback for web)
        'text-primary': 'var(--text-primary, hsl(210, 10%, 90%))',
        'text-secondary': 'var(--text-secondary, hsl(210, 12%, 55%))',
        'text-muted': 'var(--text-muted, hsl(210, 8%, 50%))',
        primary: {
          DEFAULT: defaultTheme.brand.primary,
          foreground: defaultTheme.neutral[0],
        },
        secondary: {
          DEFAULT: defaultTheme.neutral[600],
          foreground: defaultTheme.functional.textPrimary,
        },
        muted: {
          DEFAULT: defaultTheme.neutral[700],
          foreground: defaultTheme.functional.textSecondary,
        },
      },
      spacing: Object.fromEntries(
        Object.entries(tokens.spacing).map(([key, value]) => [key, pxValue(value)])
      ),
      borderRadius: Object.fromEntries(
        Object.entries(tokens.radius).map(([key, value]) => [
          key,
          value === 9999 ? '9999px' : pxValue(value)
        ])
      ),
      fontSize: Object.fromEntries(
        Object.entries(tokens.typography.fontSize).map(([key, value]) => [
          key,
          [pxValue(value), { lineHeight: tokens.typography.lineHeight.normal }]
        ])
      ),
      fontWeight: tokens.typography.fontWeight,
      lineHeight: tokens.typography.lineHeight,
      letterSpacing: tokens.typography.letterSpacing,
    },
  },
  plugins: [],
}