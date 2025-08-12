'use client';

import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id, Doc } from '@rite/backend/convex/_generated/dataModel';

// Type for event with timeslots from API
type EventWithTimeslots = Doc<'events'> & {
	timeslots?: Doc<'timeslots'>[];
	guestLimitPerDJ?: number;
	hashtags?: string;
	payment: Doc<'events'>['payment'] & {
		perDJ?: number;
	};
};

// Type that ensures timeslots is always an array (never undefined)
export type ValidatedEvent = Doc<'events'> & {
	timeslots: Doc<'timeslots'>[];
	guestLimitPerDJ: number;
	hashtags: string;
	payment: {
		amount: number;
		perDJ: number;
		currency: string;
		dueDate: string;
	};
};

/**
 * Effect-inspired events hook that eliminates undefined pollution
 * Ensures timeslots is always an array, never undefined
 */
export function useEffectEvents(userId: string) {
	const rawEvents = useQuery(
		api.events.listEvents,
		userId ? { userId: userId as Id<'users'> } : 'skip'
	);

	// Validate and normalize events to eliminate undefined pollution
	const validatedEvents =
		rawEvents?.map((event: EventWithTimeslots) => {
			// Ensure timeslots is always an array (Effect principle: make invalid states impossible)
			if (!event.timeslots || !Array.isArray(event.timeslots)) {
				console.warn(`Event ${event._id} has invalid timeslots:`, event.timeslots);
				return {
					...event,
					timeslots: [], // Default to empty array instead of undefined
					guestLimitPerDJ: event.guestLimitPerDJ ?? 2,
					hashtags: event.hashtags ?? '',
					payment: {
						...event.payment,
						perDJ: event.payment.perDJ ?? event.payment.amount,
					},
				} as ValidatedEvent;
			}

			return {
				...event,
				guestLimitPerDJ: event.guestLimitPerDJ ?? 2,
				hashtags: event.hashtags ?? '',
				payment: {
					...event.payment,
					perDJ: event.payment.perDJ ?? event.payment.amount,
				},
			} as ValidatedEvent;
		}) ?? [];

	return {
		events: validatedEvents,
		isLoading: rawEvents === undefined,
		isEmpty: validatedEvents.length === 0,
	};
}

/**
 * Effect-inspired single event hook
 */
export function useEffectEvent(eventId: string, userId: string) {
	const rawEvent = useQuery(
		api.events.getEvent,
		eventId && userId
			? {
					eventId: eventId as Id<'events'>,
					userId: userId as Id<'users'>,
				}
			: 'skip'
	);

	let validatedEvent: ValidatedEvent | undefined = undefined;

	if (rawEvent) {
		// Ensure timeslots is always an array (Effect principle: make invalid states impossible)
		if (!rawEvent.timeslots || !Array.isArray(rawEvent.timeslots)) {
			console.warn(`Event ${eventId} has invalid timeslots:`, rawEvent.timeslots);
			validatedEvent = {
				...rawEvent,
				timeslots: [], // Default to empty array instead of undefined
				guestLimitPerDJ: rawEvent.guestLimitPerDJ ?? 2,
				hashtags: rawEvent.hashtags ?? '',
				payment: {
					...rawEvent.payment,
					perDJ: rawEvent.payment.perDJ ?? rawEvent.payment.amount,
				},
			} as ValidatedEvent;
		} else {
			validatedEvent = {
				...rawEvent,
				guestLimitPerDJ: rawEvent.guestLimitPerDJ ?? 2,
				hashtags: rawEvent.hashtags ?? '',
				payment: {
					...rawEvent.payment,
					perDJ: rawEvent.payment.perDJ ?? rawEvent.payment.amount,
				},
			} as ValidatedEvent;
		}
	}

	return {
		event: validatedEvent,
		isLoading: rawEvent === undefined,
		exists: validatedEvent !== undefined,
	};
}
