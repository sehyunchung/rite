/**
 * Cross-platform Date Picker component
 * Uses native date picker on mobile and HTML5 input on web
 */
import * as React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Typography } from '../lib/ui-native';
import { Ionicons } from '@expo/vector-icons';

// Conditionally import DateTimePicker only for native platforms
let DateTimePicker: React.ComponentType<{
	value: Date;
	mode: 'date' | 'time' | 'datetime';
	display?: 'default' | 'spinner' | 'compact';
	onChange: (event: unknown, date?: Date) => void;
	minimumDate?: Date;
	maximumDate?: Date;
	textColor?: string;
	themeVariant?: 'light' | 'dark';
}> | null = null;

if (Platform.OS !== 'web') {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const dateTimePickerModule = require('@react-native-community/datetimepicker');
	DateTimePicker = dateTimePickerModule.default;
}

interface DatePickerProps {
	value: Date;
	onChange: (date: Date) => void;
	label?: string;
	placeholder?: string;
	className?: string;
	accessibilityLabel?: string;
	accessibilityHint?: string;
	minDate?: Date;
	maxDate?: Date;
}

export function DatePicker({
	value,
	onChange,
	label,
	placeholder = 'Select date',
	className = '',
	accessibilityLabel,
	accessibilityHint,
	minDate,
	maxDate,
}: DatePickerProps) {
	const [showPicker, setShowPicker] = React.useState(false);

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const handleNativeChange = (_event: unknown, selectedDate?: Date) => {
		setShowPicker(false);
		if (selectedDate) {
			onChange(selectedDate);
		}
	};

	const handleWebChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newDate = new Date(event.target.value);
		if (!isNaN(newDate.getTime())) {
			// Adjust for timezone - ensure we get the date in local time
			const localDate = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60000);
			onChange(localDate);
		}
	};

	// Format date for HTML input (YYYY-MM-DD)
	const formatForHTMLInput = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	if (Platform.OS === 'web') {
		return (
			<View className={className}>
				{label && (
					<Typography variant="label" color="default" className="mb-2">
						{label}
					</Typography>
				)}
				<input
					type="date"
					value={formatForHTMLInput(value)}
					onChange={handleWebChange}
					min={minDate ? formatForHTMLInput(minDate) : undefined}
					max={maxDate ? formatForHTMLInput(maxDate) : undefined}
					className="bg-neutral-700 border border-neutral-600 rounded-xl h-12 px-4 text-white placeholder-neutral-400 focus:border-brand-primary focus:outline-none w-full"
					placeholder={placeholder}
					aria-label={
						accessibilityLabel || `Date selector. Currently selected: ${formatDate(value)}`
					}
					title={accessibilityHint || 'Select a date'}
					style={
						{
							colorScheme: 'dark',
							WebkitAppearance: 'none',
							MozAppearance: 'textfield',
						} as React.CSSProperties
					}
				/>
			</View>
		);
	}

	return (
		<View className={className}>
			{label && (
				<Typography variant="label" color="default" className="mb-2">
					{label}
				</Typography>
			)}
			<TouchableOpacity
				className="bg-neutral-700 border border-neutral-600 rounded-xl h-12 flex-row items-center px-4"
				onPress={() => setShowPicker(true)}
				accessible={true}
				accessibilityRole="button"
				accessibilityLabel={
					accessibilityLabel || `Date selector. Currently selected: ${formatDate(value)}`
				}
				accessibilityHint={accessibilityHint || 'Tap to change the date'}
			>
				<Typography variant="body" color="default" className="flex-1">
					{formatDate(value)}
				</Typography>
				<Ionicons
					name="calendar-outline"
					size={20}
					color="#8C8CA3"
					accessibilityElementsHidden={true}
				/>
			</TouchableOpacity>

			{showPicker && DateTimePicker && (
				<DateTimePicker
					value={value}
					mode="date"
					display={Platform.OS === 'ios' ? 'spinner' : 'default'}
					onChange={handleNativeChange}
					minimumDate={minDate}
					maximumDate={maxDate}
					textColor="white"
					themeVariant="dark"
				/>
			)}
		</View>
	);
}
