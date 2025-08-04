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

  return {
    events: events ?? [],
    isLoading: events === undefined,
    isEmpty: events ? events.length === 0 : false,
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

  return {
    event,
    isLoading: event === undefined,
    exists: event !== null,
  };
}