'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@rite/ui';
import { Moon, Sun, Monitor } from 'lucide-react';
import { alternativeThemes, generateThemeCSS } from '@rite/ui/design-tokens';

type ThemeMode = 'dark' | 'light' | 'system';
type ActualTheme = 'joshComeau' | 'joshComeauLight';

export function ThemeSwitcher() {
	const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

	// System theme detection
	const getSystemTheme = (): ActualTheme => {
		if (typeof window !== 'undefined' && window.matchMedia) {
			return window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'joshComeau'
				: 'joshComeauLight';
		}
		return 'joshComeau'; // fallback to dark
	};

	// Calculate actual theme based on mode
	const calculateActualTheme = useCallback((mode: ThemeMode): ActualTheme => {
		switch (mode) {
			case 'dark':
				return 'joshComeau';
			case 'light':
				return 'joshComeauLight';
			case 'system':
				return getSystemTheme();
			default:
				return 'joshComeau';
		}
	}, []);

	// Apply theme to DOM
	const applyTheme = (themeKey: ActualTheme) => {
		const theme = alternativeThemes[themeKey];
		const css = generateThemeCSS(theme);

		// Remove existing theme style
		const existingStyle = document.getElementById('rite-theme-style');
		if (existingStyle) {
			existingStyle.remove();
		}

		// Add new theme style
		const style = document.createElement('style');
		style.id = 'rite-theme-style';
		style.textContent = css;
		document.head.appendChild(style);
	};

	// Load theme from localStorage on mount
	useEffect(() => {
		const savedMode = localStorage.getItem('rite-theme-mode') as ThemeMode;
		const validModes: ThemeMode[] = ['dark', 'light', 'system'];

		const initialMode = savedMode && validModes.includes(savedMode) ? savedMode : 'dark';
		setThemeMode(initialMode);

		const theme = calculateActualTheme(initialMode);
		applyTheme(theme);
	}, [calculateActualTheme]);

	// Listen for system theme changes when in system mode
	useEffect(() => {
		if (themeMode !== 'system') return;

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = () => {
			const newTheme = calculateActualTheme('system');
			applyTheme(newTheme);
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, [themeMode, calculateActualTheme]);

	// Finite state machine: dark → light → system → dark
	const cycleTheme = () => {
		const nextMode: ThemeMode =
			themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'system' : 'dark';

		setThemeMode(nextMode);
		localStorage.setItem('rite-theme-mode', nextMode);

		const newTheme = calculateActualTheme(nextMode);
		applyTheme(newTheme);
	};

	const getThemeInfo = () => {
		switch (themeMode) {
			case 'dark':
				return { icon: Moon, label: 'Dark', next: 'light' };
			case 'light':
				return { icon: Sun, label: 'Light', next: 'system' };
			case 'system':
				return { icon: Monitor, label: 'System', next: 'dark' };
			default:
				return { icon: Moon, label: 'Dark', next: 'light' };
		}
	};

	const themeInfo = getThemeInfo();
	const IconComponent = themeInfo.icon;

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={cycleTheme}
			className="flex items-center gap-2"
			title={`Switch to ${themeInfo.next} mode`}
		>
			<IconComponent className="w-4 h-4" />
			<span className="hidden sm:inline">{themeInfo.label}</span>
		</Button>
	);
}
