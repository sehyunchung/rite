// RITE Design System - Main Export
// Centralized design tokens for web and mobile platforms

export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './radius';

// Theme system exports
export * from './themes';

// Re-export as unified tokens object
import { typography, typographyVariants } from './typography';
import { spacing, spacingPatterns } from './spacing';
import { webShadows, mobileShadows } from './shadows';
import { radius, radiusPatterns } from './radius';

export const tokens = {
	typography,
	spacing,
	radius,
	shadows: {
		web: webShadows,
		mobile: mobileShadows,
	},
	// Platform-specific
	web: {
		shadows: webShadows,
	},
	mobile: {
		shadows: mobileShadows,
	},
	// Patterns
	patterns: {
		spacing: spacingPatterns,
		radius: radiusPatterns,
		typography: typographyVariants,
	},
} as const;

export type DesignTokens = typeof tokens;
