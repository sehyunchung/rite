/**
 * ThemeSwitcher component for mobile app
 * Similar to Next.js ThemeSwitcher but adapted for React Native
 */
import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card } from '../lib/ui-native';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';

interface ThemeSwitcherProps {
	showLabels?: boolean;
	orientation?: 'horizontal' | 'vertical';
	size?: 'small' | 'medium' | 'large';
}

export function ThemeSwitcher({
	showLabels = true,
	orientation = 'vertical',
	size = 'medium',
}: ThemeSwitcherProps) {
	const { currentTheme, setTheme, availableThemes, isLoading } = useTheme();
	useI18n(); // Hook called for future i18n support

	const handleThemeChange = async (themeKey: string) => {
		// Type guard to ensure we only accept valid theme keys
		const validThemeKeys = availableThemes.map((t) => t.key) as string[];
		const isValidThemeKey = (key: string): key is import('@rite/ui/design-tokens').ThemeKey => {
			return validThemeKeys.includes(key);
		};

		if (themeKey !== currentTheme && isValidThemeKey(themeKey)) {
			await setTheme(themeKey);
		}
	};

	if (isLoading) {
		return (
			<View className="p-2">
				<Typography variant="caption" color="secondary">
					Loading themes...
				</Typography>
			</View>
		);
	}

	const isHorizontal = orientation === 'horizontal';
	const containerClass = isHorizontal ? 'flex-row gap-3' : 'gap-3';

	return (
		<View>
			{showLabels && (
				<Typography variant="label" color="default" className="mb-3">
					Theme
				</Typography>
			)}

			<View className={containerClass}>
				{availableThemes.map((theme) => {
					const isSelected = theme.key === currentTheme;

					return (
						<TouchableOpacity
							key={theme.key}
							onPress={() => handleThemeChange(theme.key)}
							className={isHorizontal ? 'flex-1' : ''}
						>
							<Card
								className={`p-4 ${
									isSelected
										? 'bg-brand-primary border-brand-primary'
										: 'bg-neutral-700 border-neutral-600'
								} border-2`}
							>
								<View className="items-center">
									{/* Theme indicator */}
									<View
										className={`w-8 h-8 rounded-full mb-2 ${
											theme.type === 'dark'
												? 'bg-neutral-800 border-neutral-400'
												: 'bg-neutral-100 border-neutral-600'
										} border-2`}
									/>

									<Typography
										variant="button"
										color={isSelected ? 'primary' : 'default'}
										className="text-center mb-1"
									>
										{theme.name}
									</Typography>

									<Typography
										variant="caption"
										color={isSelected ? 'primary' : 'secondary'}
										className="text-center"
									>
										{theme.type}
									</Typography>

									{showLabels && (
										<Typography
											variant="caption"
											color={isSelected ? 'primary' : 'secondary'}
											className="text-center mt-1 text-xs"
										>
											{theme.description}
										</Typography>
									)}
								</View>
							</Card>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

/**
 * Compact theme switcher for tab bars or navigation
 */
export function CompactThemeSwitcher() {
	const { currentTheme, setTheme, availableThemes } = useTheme();
	const [showOptions, setShowOptions] = React.useState(false);

	const currentThemeData = availableThemes.find((t) => t.key === currentTheme);

	const toggleOptions = () => setShowOptions(!showOptions);

	const handleThemeSelect = async (themeKey: string) => {
		// Type guard to ensure we only accept valid theme keys
		const validThemeKeys = availableThemes.map((t) => t.key) as string[];
		const isValidThemeKey = (key: string): key is import('@rite/ui/design-tokens').ThemeKey => {
			return validThemeKeys.includes(key);
		};

		if (isValidThemeKey(themeKey)) {
			await setTheme(themeKey);
		}
		setShowOptions(false);
	};

	return (
		<View className="relative">
			<TouchableOpacity
				onPress={toggleOptions}
				className="flex-row items-center p-2 bg-neutral-700 rounded-lg"
			>
				<View
					className={`w-4 h-4 rounded-full mr-2 ${
						currentThemeData?.type === 'dark'
							? 'bg-neutral-800 border-neutral-400'
							: 'bg-neutral-100 border-neutral-600'
					} border`}
				/>
				<Typography variant="button" color="default" className="mr-2">
					{currentThemeData?.name || 'Theme'}
				</Typography>
				<Ionicons
					name={showOptions ? 'chevron-up' : 'chevron-down'}
					size={16}
					color="#8C8CA3"
				/>
			</TouchableOpacity>

			{showOptions && (
				<View className="absolute top-full left-0 right-0 mt-1 z-10">
					<Card className="bg-neutral-700 border-neutral-600 p-2">
						{availableThemes.map((theme) => (
							<TouchableOpacity
								key={theme.key}
								onPress={() => handleThemeSelect(theme.key)}
								className="flex-row items-center p-2 rounded"
							>
								<View
									className={`w-3 h-3 rounded-full mr-3 ${
										theme.type === 'dark'
											? 'bg-neutral-800 border-neutral-400'
											: 'bg-neutral-100 border-neutral-600'
									} border`}
								/>
								<View className="flex-1">
									<Typography variant="body" color="default">
										{theme.name}
									</Typography>
									<Typography variant="caption" color="secondary">
										{theme.type}
									</Typography>
								</View>
								{theme.key === currentTheme && (
									<Ionicons name="checkmark" size={16} color="#7C7CFF" />
								)}
							</TouchableOpacity>
						))}
					</Card>
				</View>
			)}
		</View>
	);
}
