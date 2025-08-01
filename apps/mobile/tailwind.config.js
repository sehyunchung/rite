const { tokens } = require('@rite/ui/design-tokens');

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
        'suit': tokens.typography.fontFamily.sans,
        'sans': tokens.typography.fontFamily.sans,
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
        
        // Functional colors
        border: tokens.colors.functional.border,
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
        muted: {
          DEFAULT: tokens.colors.neutral[700],
          foreground: tokens.colors.functional.textSecondary,
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