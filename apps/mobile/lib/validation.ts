/**
 * Validation utilities for mobile app
 * Provides type-safe validation functions for Convex IDs
 */

import { Id } from '@rite/backend/convex/_generated/dataModel';

/**
 * Type guard to check if a value is a valid Convex ID string
 * @param value - The value to check
 * @returns True if the value is a non-empty string
 */
function isValidIdString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a valid event ID
 * This uses TypeScript's type predicate to avoid type casting
 */
export function isValidEventId(value: unknown): value is Id<'events'> {
	// In a real application, you might want to check the ID format
	// For now, we just check it's a non-empty string
	return isValidIdString(value);
}

/**
 * Type guard to check if a value is a valid user ID
 */
export function isValidUserId(value: unknown): value is Id<'users'> {
	return isValidIdString(value);
}

/**
 * Validates and returns an event ID or null
 * Uses type guard to ensure type safety without casting
 */
export function validateEventId(value: unknown): Id<'events'> | null {
	if (isValidEventId(value)) {
		return value; // TypeScript knows this is Id<"events"> due to type guard
	}
	return null;
}

/**
 * Validates and returns a user ID or null
 * Uses type guard to ensure type safety without casting
 */
export function validateUserId(value: unknown): Id<'users'> | null {
	if (isValidUserId(value)) {
		return value; // TypeScript knows this is Id<"users"> due to type guard
	}
	return null;
}

/**
 * Generic ID validation for any table
 * @deprecated Use specific validators instead
 */
export function validateId(value: unknown, _table: string): string | null {
	if (isValidIdString(value)) {
		return value;
	}
	return null;
}
