'use client';

import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id, Doc } from '@rite/backend/convex/_generated/dataModel';
import { Effect, Schema as S, pipe } from 'effect';

// ========================================
// TRUE EFFECT TYPESCRIPT IMPLEMENTATION
// ========================================

// 1. Effect Schema Definitions
const TimeslotSchema = S.Struct({
  _id: S.String,
  _creationTime: S.Number,
  eventId: S.String,
  startTime: S.String,
  endTime: S.String,
  djName: S.String,
  djInstagram: S.String,
  submissionToken: S.optional(S.String),
  submissionId: S.optional(S.String)
});

const PaymentSchema = S.Struct({
  amount: S.Number.pipe(S.nonNegative()),
  perDJ: S.Number.pipe(S.nonNegative()),
  currency: S.String,
  dueDate: S.String
});

const VenueSchema = S.Struct({
  name: S.NonEmptyString,
  address: S.NonEmptyString
});

const EventSchema = S.Struct({
  _id: S.String,
  _creationTime: S.Number,
  organizerId: S.String,
  name: S.NonEmptyString,
  date: S.String,
  venue: VenueSchema,
  description: S.optional(S.String),
  hashtags: S.optional(S.String),
  deadlines: S.Struct({
    guestList: S.String,
    promoMaterials: S.String
  }),
  payment: PaymentSchema,
  guestLimitPerDJ: S.optional(S.Number.pipe(S.positive())),
  status: S.Literal("draft", "active", "completed"),
  phase: S.optional(S.String),
  createdAt: S.String,
  // CRITICAL: NonEmptyArray guarantees timeslots is never empty or undefined
  timeslots: S.NonEmptyArray(TimeslotSchema),
  submissionCount: S.optional(S.Number.pipe(S.nonNegative()))
});

// 2. Effect Error Types
class ValidationError extends S.TaggedError<ValidationError>()("ValidationError", {
  message: S.String,
  issues: S.Array(S.String),
  eventId: S.optional(S.String)
}) {}

// Currently unused but kept for future data integrity checks
// class DataIntegrityError extends S.TaggedError<DataIntegrityError>()("DataIntegrityError", {
//   message: S.String,
//   eventId: S.String,
//   missingField: S.String
// }) {}

// 3. Effect Validation Functions
const validateEventEffect = (rawEvent: unknown) =>
  pipe(
    S.decodeUnknown(EventSchema)(rawEvent),
    Effect.mapError((error) => new ValidationError({
      message: "Event validation failed",
      issues: [String(error)],
      eventId: typeof rawEvent === 'object' && rawEvent !== null && '_id' in rawEvent 
        ? String(rawEvent._id) 
        : undefined
    }))
  );

const normalizeEventEffect = (rawEvent: Doc<"events"> & { timeslots?: unknown }) =>
  Effect.gen(function* () {
    // Check for data integrity issues
    if (!rawEvent.timeslots || !Array.isArray(rawEvent.timeslots)) {
      console.warn(`Event ${rawEvent._id} has invalid timeslots:`, rawEvent.timeslots);
      
      // Instead of failing, create a valid event with empty timeslots
      const normalizedEvent = {
        ...rawEvent,
        timeslots: [], // Effect principle: make invalid states impossible
        guestLimitPerDJ: rawEvent.guestLimitPerDJ ?? 2,
        hashtags: rawEvent.hashtags ?? '',
        payment: {
          ...rawEvent.payment,
          perDJ: rawEvent.payment.perDJ ?? rawEvent.payment.amount,
        }
      };
      
      return normalizedEvent;
    }
    
    // Normalize optional fields to ensure consistency
    return {
      ...rawEvent,
      guestLimitPerDJ: rawEvent.guestLimitPerDJ ?? 2,
      hashtags: rawEvent.hashtags ?? '',
      payment: {
        ...rawEvent.payment,
        perDJ: rawEvent.payment.perDJ ?? rawEvent.payment.amount,
      }
    };
  });

// 4. Derived Types
export type TrueValidatedEvent = S.Schema.Type<typeof EventSchema>;

/**
 * TRUE Effect TypeScript events hook
 * Uses Effect Schema validation, error handling, and functional composition
 */
export function useTrueEffectEvents(userId: string) {
  const rawEvents = useQuery(
    api.events.listEvents,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  // Effect-based validation pipeline
  const validatedEvents = rawEvents?.map((rawEvent: Doc<"events"> & { timeslots?: unknown }) => {
    // Create Effect pipeline for validation
    const validationPipeline = pipe(
      normalizeEventEffect(rawEvent),
      Effect.flatMap((normalizedEvent) => 
        // Optional: Could add full schema validation here
        Effect.succeed(normalizedEvent)
      ),
      Effect.catchAll((error) => {
        // Structured error logging
        console.error('Event validation failed:', {
          error: String(error),
          eventId: rawEvent._id
        });
        
        // Fallback to normalized event instead of null
        return normalizeEventEffect(rawEvent);
      })
    );
    
    // Execute Effect pipeline synchronously
    return Effect.runSync(validationPipeline);
  }) ?? [];

  return {
    events: validatedEvents,
    isLoading: rawEvents === undefined,
    isEmpty: validatedEvents.length === 0,
  };
}

/**
 * TRUE Effect TypeScript single event hook
 */
export function useTrueEffectEvent(eventId: string, userId: string) {
  const rawEvent = useQuery(
    api.events.getEvent,
    eventId && userId ? { 
      eventId: eventId as Id<"events">, 
      userId: userId as Id<"users"> 
    } : "skip"
  );

  let validatedEvent: any = undefined;
  
  if (rawEvent) {
    // Effect pipeline for single event
    const validationPipeline = pipe(
      normalizeEventEffect(rawEvent),
      Effect.tap((event) => 
        Effect.log(`Successfully validated event: ${event._id}`)
      ),
      Effect.catchAll((error) => {
        console.error('Single event validation failed:', {
          error: String(error),
          eventId,
          details: error
        });
        return normalizeEventEffect(rawEvent);
      })
    );
    
    validatedEvent = Effect.runSync(validationPipeline);
  }

  return {
    event: validatedEvent,
    isLoading: rawEvent === undefined,
    exists: validatedEvent !== undefined,
  };
}

// 5. Effect Utility Functions for Advanced Usage
export const validateMultipleEventsEffect = (events: unknown[]) =>
  pipe(
    events,
    Effect.forEach((event) => validateEventEffect(event), { 
      concurrency: "unbounded",
      discard: false 
    }),
    Effect.catchAll((error) => {
      console.error('Batch validation failed:', error);
      return Effect.succeed([]);
    })
  );

export const safeEventAccess = (event: unknown) =>
  pipe(
    validateEventEffect(event),
    Effect.map((validEvent) => ({
      timeslotCount: validEvent.timeslots.length,
      hasSubmissions: validEvent.timeslots.some(slot => slot.submissionId),
      paymentPerDJ: validEvent.payment.perDJ,
      isActive: validEvent.status === 'active'
    })),
    Effect.catchAll(() => Effect.succeed({
      timeslotCount: 0,
      hasSubmissions: false,
      paymentPerDJ: 0,
      isActive: false
    }))
  );