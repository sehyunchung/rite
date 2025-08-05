/**
 * Validation utilities for mobile app
 * Provides type-safe validation functions for Convex IDs and other types
 */

import { Id } from '@rite/backend/convex/_generated/dataModel';

/**
 * Validates and converts a string to a Convex event ID
 * @param value - The value to validate
 * @returns The validated ID or null if invalid
 */
export function validateEventId(value: string | null | undefined): Id<"events"> | null {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  // Basic validation - Convex IDs are non-empty strings
  if (value.trim().length === 0) {
    return null;
  }
  
  // Return the value as the proper ID type
  // This is still a type assertion, but it's centralized and validated
  return value as Id<"events">;
}

/**
 * Validates and converts a string to a Convex user ID
 * @param value - The value to validate
 * @returns The validated ID or null if invalid
 */
export function validateUserId(value: string | null | undefined): Id<"users"> | null {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  if (value.trim().length === 0) {
    return null;
  }
  
  return value as Id<"users">;
}

/**
 * Generic validation function for any table
 * @param value - The value to validate
 * @param _table - The table name (for documentation purposes)
 * @returns The validated ID or null if invalid
 */
export function validateId(value: string | null | undefined, _table: string): any {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  if (value.trim().length === 0) {
    return null;
  }
  
  return value;
}

/**
 * Type guard to check if a value is a valid event ID
 */
export function isValidEventId(value: string | null | undefined): value is Id<"events"> {
  return validateEventId(value) !== null;
}

/**
 * Type guard to check if a value is a valid user ID
 */
export function isValidUserId(value: string | null | undefined): value is Id<"users"> {
  return validateUserId(value) !== null;
}