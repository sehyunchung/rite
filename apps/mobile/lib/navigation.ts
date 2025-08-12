import { Href } from 'expo-router';
import type { Id } from '@rite/backend/convex/_generated/dataModel';

/**
 * Type-safe navigation helper for dynamic routes
 * Ensures proper typing for Expo Router navigation
 */
export const createEventRoute = (eventId: Id<'events'>): Href => {
	return `/events/${eventId}` as Href;
};

export const createEventEditRoute = (eventId: string): Href => {
	return `/events/${eventId}/edit` as Href;
};

export const createEventSubmissionsRoute = (eventId: string): Href => {
	return `/events/${eventId}/submissions` as Href;
};

// Export all route creators for easy access
export const routes = {
	event: createEventRoute,
	eventEdit: createEventEditRoute,
	eventSubmissions: createEventSubmissionsRoute,
} as const;
