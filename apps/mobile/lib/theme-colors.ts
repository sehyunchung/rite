/**
 * Theme color values for React Native components that require explicit colors
 * These are the resolved color values from the Josh Comeau dark theme design system
 * Use these only when Tailwind classes cannot be used (e.g., ActivityIndicator, StyleSheet colors)
 */

// Josh Comeau theme colors from the design system
export const themeColors = {
	brand: {
		primary: 'hsl(225, 100%, 75%)', // #7C7CFF
		primaryDark: 'hsl(225, 100%, 60%)', // #5C5CFF
		primaryLight: 'hsl(225, 100%, 85%)', // #9C9CFF
	},
	neutral: {
		0: 'hsl(210, 25%, 96%)', // #F5F5F8 - White/lightest
		50: 'hsl(210, 25%, 88%)', // #DDDDE5
		100: 'hsl(210, 20%, 77%)', // #C4C4D1
		200: 'hsl(210, 14%, 66%)', // #A8A8BD
		300: 'hsl(210, 12%, 55%)', // #8C8CA3
		400: 'hsl(210, 8%, 50%)', // #70707F
		500: 'hsl(210, 9%, 40%)', // #616166
		600: 'hsl(210, 10%, 30%)', // #47474D
		700: 'hsl(210, 15%, 18%)', // #26262E
		800: 'hsl(210, 15%, 12%)', // #1A1A1F - Primary dark background
		900: 'hsl(210, 15%, 6%)', // #0F0F10 - Darkest
	},
	functional: {
		textPrimary: 'hsl(210, 10%, 90%)', // #E0E0E6
		textSecondary: 'hsl(210, 12%, 55%)', // #8C8CA3
		textMuted: 'hsl(210, 8%, 50%)', // #70707F
		textDisabled: 'hsl(210, 10%, 30%)', // #47474D
		textInverse: 'hsl(210, 15%, 6%)', // #0F0F10

		border: 'hsl(210, 15%, 18%)', // #26262E
		borderStrong: 'hsl(210, 10%, 30%)', // #47474D
		borderSubtle: 'hsl(210, 15%, 12%)', // #1A1A1F

		backgroundElevated: 'hsl(210, 25%, 25%)', // #383845
		backgroundSubtle: 'hsl(210, 15%, 6%)', // #0F0F10
	},
	interactive: {
		hover: 'hsl(225, 100%, 75%, 0.1)',
		active: 'hsl(225, 100%, 75%, 0.15)',
		focus: 'hsl(225, 100%, 75%)',
		disabled: 'hsl(210, 10%, 30%)',
	},
	semantic: {
		success: 'hsl(160, 100%, 40%)', // #00CC66
		warning: 'hsl(40, 100%, 50%)', // #FFCC00
		error: 'hsl(340, 95%, 60%)', // #FF3366
		info: 'hsl(225, 100%, 80%)', // #9999FF
	},
	// Legacy aliases for compatibility
	text: {
		primary: 'hsl(210, 10%, 90%)', // #E0E0E6
		secondary: 'hsl(210, 12%, 55%)', // #8C8CA3
	},
} as const;

// Helper to convert HSL to hex if needed by some components
export function hslToHex(hsl: string): string {
	// For now, return the known hex values
	const hslToHexMap: Record<string, string> = {
		'hsl(225, 100%, 75%)': '#7C7CFF',
		'hsl(225, 100%, 60%)': '#5C5CFF',
		'hsl(225, 100%, 85%)': '#9C9CFF',
		'hsl(210, 10%, 90%)': '#E0E0E6',
		'hsl(210, 12%, 55%)': '#8C8CA3',
		'hsl(340, 95%, 60%)': '#FF3366',
	};
	return hslToHexMap[hsl] || hsl;
}
