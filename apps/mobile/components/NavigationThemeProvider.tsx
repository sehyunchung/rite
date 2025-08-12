/**
 * Navigation theme provider that adapts to current theme
 */
import * as React from 'react';
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { useCurrentThemeData } from '../contexts/ThemeContext';

interface NavigationThemeWrapperProps {
	children: React.ReactNode;
}

export function NavigationThemeWrapper({ children }: NavigationThemeWrapperProps) {
	const themeData = useCurrentThemeData();

	// Create navigation theme based on current theme
	const navigationTheme = React.useMemo(() => {
		const baseTheme = themeData.type === 'dark' ? DarkTheme : DefaultTheme;

		return {
			...baseTheme,
			colors: {
				...baseTheme.colors,
				primary: themeData.brand.primary,
				background:
					themeData.type === 'dark'
						? themeData.neutral[800]
						: themeData.functional.backgroundSubtle,
				card:
					themeData.type === 'dark'
						? themeData.neutral[700]
						: themeData.functional.backgroundElevated,
				text: themeData.functional.textPrimary,
				border: themeData.functional.border,
				notification: themeData.brand.primary,
			},
		};
	}, [themeData]);

	return <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>;
}
