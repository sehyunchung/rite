// Effect TypeScript schemas using latest API (effect@3.17.6)
// Eliminates undefined pollution by making invalid states impossible
import { Schema as S } from 'effect';

// Base schemas for core data types
export const TimeslotSchema = S.Struct({
	_id: S.String,
	eventId: S.String,
	startTime: S.String,
	endTime: S.String,
	djName: S.String,
	djInstagram: S.String,
	submissionToken: S.String,
});

export const VenueSchema = S.Struct({
	name: S.NonEmptyString,
	address: S.NonEmptyString,
});

export const DeadlinesSchema = S.Struct({
	guestList: S.String,
	promoMaterials: S.String,
});

export const PaymentSchema = S.Struct({
	amount: S.Number.pipe(S.nonNegative()),
	perDJ: S.Number.pipe(S.nonNegative()),
	currency: S.String,
	dueDate: S.String,
});

// Event phase enum matching existing eventStatus.ts
export const EventPhaseSchema = S.Literal(
	'draft',
	'planning',
	'finalized',
	'day_of',
	'completed',
	'cancelled'
);

export const EventCapabilitiesSchema = S.Struct({
	canEdit: S.Boolean,
	canPublish: S.Boolean,
	canAcceptSubmissions: S.Boolean,
	canGenerateContent: S.Boolean,
	canFinalize: S.Boolean,
	showUrgentBanner: S.Boolean,
	showDayOfFeatures: S.Boolean,
});

// Core Event schema that GUARANTEES timeslots exist and are non-empty
// This eliminates all defensive timeslots?.length patterns
export const EventWithTimeslotsSchema = S.Struct({
	_id: S.String,
	name: S.NonEmptyString,
	organizerId: S.String,
	date: S.String,
	venue: VenueSchema,
	description: S.optional(S.String),
	hashtags: S.optional(S.String),
	deadlines: DeadlinesSchema,
	payment: PaymentSchema,
	guestLimitPerDJ: S.Number.pipe(S.positive()),
	status: S.Literal('draft', 'active', 'completed'),
	phase: S.optional(EventPhaseSchema),
	capabilities: S.optional(EventCapabilitiesSchema),
	createdAt: S.String,
	// CRITICAL: NonEmptyArray guarantees timeslots is never empty or undefined
	// This eliminates the need for all timeslots?.length defensive patterns
	timeslots: S.NonEmptyArray(TimeslotSchema),
	submissionCount: S.optional(S.Number.pipe(S.nonNegative())),
});

// Event creation form schema for frontend validation
export const EventFormSchema = S.Struct({
	name: S.NonEmptyString,
	date: S.String, // DateFromString could be used for stricter validation
	venue: VenueSchema,
	description: S.optional(S.String),
	hashtags: S.optional(S.String),
	deadlines: DeadlinesSchema,
	payment: PaymentSchema,
	guestLimitPerDJ: S.Number.pipe(S.positive()),
	// Frontend form requires at least one timeslot
	timeslots: S.NonEmptyArray(
		S.Struct({
			startTime: S.String,
			endTime: S.String,
			djName: S.NonEmptyString,
			djInstagram: S.NonEmptyString,
		})
	),
});

// Branded types for compile-time safety
export type EventId = string & { readonly _brand: 'EventId' };
export type TimeslotId = string & { readonly _brand: 'TimeslotId' };
export type UserId = string & { readonly _brand: 'UserId' };

export const EventIdSchema = S.String.pipe(S.brand('EventId'));
export const TimeslotIdSchema = S.String.pipe(S.brand('TimeslotId'));
export const UserIdSchema = S.String.pipe(S.brand('UserId'));

// Submission schema
export const GuestEntrySchema = S.Struct({
	name: S.NonEmptyString,
	phoneNumber: S.optional(S.String),
});

export const PaymentInfoSchema = S.Struct({
	bankName: S.NonEmptyString,
	accountNumber: S.NonEmptyString,
	accountHolder: S.NonEmptyString,
	residentRegistrationNumber: S.NonEmptyString,
});

export const SubmissionSchema = S.Struct({
	_id: S.String,
	eventId: S.String,
	timeslotId: S.String,
	djName: S.NonEmptyString,
	djInstagram: S.NonEmptyString,
	guestList: S.Array(GuestEntrySchema),
	paymentInfo: PaymentInfoSchema,
	promoMaterials: S.optional(S.Array(S.String)),
	submittedAt: S.String,
	status: S.Literal('pending', 'approved', 'rejected'),
});

// Export derived types for TypeScript usage
export type ValidatedEvent = S.Schema.Type<typeof EventWithTimeslotsSchema>;
export type ValidatedTimeslot = S.Schema.Type<typeof TimeslotSchema>;
export type ValidatedEventForm = S.Schema.Type<typeof EventFormSchema>;
export type ValidatedSubmission = S.Schema.Type<typeof SubmissionSchema>;

// Validation functions using Effect Schema decode
export const validateEvent = S.decodeUnknown(EventWithTimeslotsSchema);
export const validateEventForm = S.decodeUnknown(EventFormSchema);
export const validateTimeslot = S.decodeUnknown(TimeslotSchema);
export const validateSubmission = S.decodeUnknown(SubmissionSchema);
