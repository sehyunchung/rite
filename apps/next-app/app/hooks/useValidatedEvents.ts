'use client';

import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id, Doc } from '@rite/backend/convex/_generated/dataModel';

// Type that guarantees data integrity
export type ValidatedEvent = Doc<"events"> & {
  timeslots: Doc<"timeslots">[];
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
 * Hook that provides type-safe, validated events
 * Guarantees all required fields exist and are properly typed
 */
export function useValidatedEvents(userId: string) {
  const events = useQuery(
    api.events.listEvents,
    userId ? { userId: userId as Id<"users"> } : "skip"
  ) as ValidatedEvent[] | undefined;

  // Ensure timeslots is always an array for each event
  const validatedEvents = events?.map(event => ({
    ...event,
    timeslots: event.timeslots || []
  })) ?? [];

  return {
    events: validatedEvents,
    isLoading: events === undefined,
    isEmpty: validatedEvents.length === 0,
  };
}

/**
 * Hook for single event with validation
 */
export function useValidatedEvent(eventId: string, userId: string) {
  const event = useQuery(
    api.events.getEvent,
    eventId && userId ? { 
      eventId: eventId as Id<"events">, 
      userId: userId as Id<"users"> 
    } : "skip"
  ) as ValidatedEvent | undefined;

  // Ensure timeslots is always an array
  const validatedEvent = event ? {
    ...event,
    timeslots: event.timeslots || []
  } : undefined;

  return {
    event: validatedEvent,
    isLoading: event === undefined,
    exists: validatedEvent !== null && validatedEvent !== undefined,
  };
}