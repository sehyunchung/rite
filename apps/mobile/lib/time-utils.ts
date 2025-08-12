/**
 * Utility functions for time formatting
 */

/**
 * Format a time string (HH:MM) to a readable format
 * @param timeString - Time in HH:MM format (e.g., "22:00", "09:30")
 * @param format12hour - Whether to use 12-hour format (default: true)
 * @returns Formatted time string
 */
export function formatTime(timeString: string | number, format12hour: boolean = true): string {
	if (!timeString) return 'No time set';

	// Convert to string if it's a number
	const timeStr = String(timeString);

	// Check if it's in HH:MM format
	const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
	const match = timeStr.match(timeRegex);

	if (!match) {
		// Try to parse as a date string
		const date = new Date(timeStr);
		if (isNaN(date.getTime())) {
			return 'Invalid time';
		}

		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: format12hour,
		});
	}

	// Parse HH:MM format
	const [, hourStr, minuteStr] = match;
	let hour = parseInt(hourStr, 10);
	const minute = parseInt(minuteStr, 10);

	if (!format12hour) {
		return `${hourStr.padStart(2, '0')}:${minuteStr}`;
	}

	// Convert to 12-hour format
	const period = hour >= 12 ? 'PM' : 'AM';
	if (hour === 0) {
		hour = 12;
	} else if (hour > 12) {
		hour -= 12;
	}

	return `${hour}:${minuteStr} ${period}`;
}

/**
 * Validate if a time string is in valid HH:MM format
 * @param timeString - Time string to validate
 * @returns True if valid, false otherwise
 */
export function isValidTimeString(timeString: string): boolean {
	const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
	return timeRegex.test(timeString);
}

/**
 * Convert a Date object to HH:MM string
 * @param date - Date object
 * @returns Time in HH:MM format
 */
export function dateToTimeString(date: Date): string {
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
}

/**
 * Create a Date object from a time string (HH:MM) using today's date
 * @param timeString - Time in HH:MM format
 * @returns Date object or null if invalid
 */
export function timeStringToDate(timeString: string): Date | null {
	if (!isValidTimeString(timeString)) {
		return null;
	}

	const [hourStr, minuteStr] = timeString.split(':');
	const hour = parseInt(hourStr, 10);
	const minute = parseInt(minuteStr, 10);

	const date = new Date();
	date.setHours(hour, minute, 0, 0);

	return date;
}
