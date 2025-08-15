import { tokens } from '@rite/ui/design-tokens';
import tailwindAnimate from 'tailwindcss-animate';

// Convert numeric values to pixel strings
const pxValue = (value) => `${value}px`;

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
				suit: [
					'var(--font-suit)',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'sans-serif',
				],
				sans: [
					'var(--font-suit)',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'sans-serif',
				],
			},
			colors: {
				// Brand colors using CSS variables for dynamic theming
				'brand-primary': 'var(--brand-primary, hsl(293deg 100% 66%))',
				'brand-primary-dark': 'var(--brand-primary-dark, hsl(293deg 100% 58%))',
				'brand-primary-light': 'var(--brand-primary-light, hsl(293deg 100% 72%))',

				// Neutral palette using CSS variables
				neutral: {
					0: 'var(--neutral-0, hsl(0deg 0% 100%))',
					50: 'var(--neutral-50, hsl(235deg 60% 97%))',
					100: 'var(--neutral-100, hsl(235deg 25% 93%))',
					200: 'var(--neutral-200, hsl(235deg 20% 86%))',
					300: 'var(--neutral-300, hsl(235deg 15% 75%))',
					400: 'var(--neutral-400, hsl(235deg 12% 63%))',
					500: 'var(--neutral-500, hsl(235deg 10% 50%))',
					600: 'var(--neutral-600, hsl(235deg 12% 37%))',
					700: 'var(--neutral-700, hsl(254deg 25% 25%))',
					800: 'var(--neutral-800, hsl(254deg 35% 15%))',
					900: 'var(--neutral-900, hsl(254deg 40% 8%))',
				},

				// Semantic colors using CSS variables
				success: 'var(--color-success, hsl(152deg 68% 62%))',
				warning: 'var(--color-warning, hsl(45deg 100% 62%))',
				error: 'var(--color-error, hsl(0deg 75% 67%))',
				info: 'var(--color-info, hsl(218deg 100% 69%))',

				// Component colors using CSS variables
				border: 'var(--border, hsl(210deg 20% 77%))',
				'border-strong': 'var(--border-strong, hsl(210deg 14% 66%))',
				input: 'var(--bg-secondary, hsl(210deg 25% 88%))',
				ring: 'var(--brand-primary, hsl(225deg 100% 65%))',
				background: 'var(--bg-primary, hsl(210deg 25% 96%))',
				foreground: 'var(--text-primary, hsl(210deg 15% 12%))',

				// Background colors using CSS variables
				'bg-primary': 'var(--bg-primary, hsl(210deg 25% 96%))',
				'bg-secondary': 'var(--bg-secondary, hsl(210deg 25% 88%))',
				'bg-tertiary': 'var(--bg-tertiary, hsl(210deg 20% 77%))',
				'bg-elevated': 'var(--bg-elevated, hsl(210deg 25% 88%))',

				// Text colors using CSS variables
				'text-primary': 'var(--text-primary, hsl(210deg 15% 12%))',
				'text-secondary': 'var(--text-secondary, hsl(210deg 10% 30%))',
				'text-muted': 'var(--text-muted, hsl(210deg 8% 50%))',
				'text-disabled': 'var(--text-disabled, hsl(210deg 12% 55%))',
				primary: {
					DEFAULT: 'var(--brand-primary, hsl(225deg 100% 65%))',
					foreground: 'var(--button-primary-text, hsl(210deg 25% 96%))',
				},
				secondary: {
					DEFAULT: 'var(--bg-tertiary, hsl(210deg 20% 77%))',
					foreground: 'var(--text-primary, hsl(210deg 15% 12%))',
				},
				destructive: {
					DEFAULT: 'var(--color-error, hsl(340deg 95% 50%))',
					foreground: 'var(--button-primary-text, hsl(210deg 25% 96%))',
				},
				muted: {
					DEFAULT: 'var(--bg-secondary, hsl(210deg 25% 88%))',
					foreground: 'var(--text-secondary, hsl(210deg 10% 30%))',
				},
				accent: {
					DEFAULT: 'var(--bg-tertiary, hsl(210deg 20% 77%))',
					foreground: 'var(--text-primary, hsl(210deg 15% 12%))',
				},
				popover: {
					DEFAULT: 'var(--bg-elevated, hsl(210deg 25% 88%))',
					foreground: 'var(--text-primary, hsl(210deg 15% 12%))',
				},
				card: {
					DEFAULT: 'var(--bg-elevated, hsl(210deg 25% 88%))',
					foreground: 'var(--text-primary, hsl(210deg 15% 12%))',
				},
			},
			spacing: Object.fromEntries(
				Object.entries(tokens.spacing).map(([key, value]) => [key, pxValue(value)])
			),
			borderRadius: {
				...Object.fromEntries(
					Object.entries(tokens.radius).map(([key, value]) => [
						key,
						value === 9999 ? '9999px' : pxValue(value),
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
					[`${value / 16}rem`, { lineHeight: tokens.typography.lineHeight.normal }],
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
};
