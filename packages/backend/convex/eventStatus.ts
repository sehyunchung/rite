import { type Doc } from './_generated/dataModel';

// Event phases enum
export const EventPhase = {
	DRAFT: 'draft',
	PLANNING: 'planning',
	FINALIZED: 'finalized',
	DAY_OF: 'day_of',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
} as const;

export type EventPhaseType = (typeof EventPhase)[keyof typeof EventPhase];

// Phase metadata for UI
export const EventPhaseInfo = {
	[EventPhase.DRAFT]: {
		label: 'Draft',
		color: 'secondary',
		icon: 'edit',
		description: 'Event is being planned',
	},
	[EventPhase.PLANNING]: {
		label: 'Planning',
		color: 'warning',
		icon: 'calendar',
		description: 'Accepting DJ submissions',
	},
	[EventPhase.FINALIZED]: {
		label: 'Finalized',
		color: 'info',
		icon: 'lock',
		description: 'Lineup locked, preparing for event',
	},
	[EventPhase.DAY_OF]: {
		label: 'Event Day',
		color: 'primary',
		icon: 'music',
		description: 'The event is happening today!',
	},
	[EventPhase.COMPLETED]: {
		label: 'Completed',
		color: 'success',
		icon: 'check-circle',
		description: 'Event has ended',
	},
	[EventPhase.CANCELLED]: {
		label: 'Cancelled',
		color: 'destructive',
		icon: 'x-circle',
		description: 'Event was cancelled',
	},
} as const;

// Event capabilities type
export interface EventCapabilities {
	canEdit: boolean;
	canPublish: boolean;
	canAcceptSubmissions: boolean;
	canGenerateContent: boolean;
	canFinalize: boolean;
	showUrgentBanner: boolean;
	showDayOfFeatures: boolean;
}

// Helper to check if it's the same day
function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

// Helper to check if event has required info for publishing
function hasRequiredInfo(event: Doc<'events'>): boolean {
	return !!(
		event.name &&
		event.date &&
		event.venue?.name &&
		event.venue?.address &&
		event.deadlines?.guestList &&
		event.deadlines?.promoMaterials
	);
}

// Compute event capabilities based on current state
export function computeEventCapabilities(
	event: Doc<'events'>,
	timeslots: Doc<'timeslots'>[],
	submissions: Doc<'submissions'>[]
): EventCapabilities {
	const now = new Date();
	const eventDate = new Date(event.date);
	const submissionDeadline = new Date(event.deadlines.promoMaterials);
	const guestListDeadline = new Date(event.deadlines.guestList);

	// Use phase if available, otherwise fall back to legacy status mapping
	const phase = event.phase || mapLegacyStatus(event.status);

	// Auto-detect if it's event day
	const isEventDay = isSameDay(now, eventDate);
	const isEventPast = eventDate < now && !isSameDay(now, eventDate);

	// Check submission status
	const hasAllSubmissions =
		timeslots.length > 0 &&
		timeslots.every((slot) => submissions.some((sub) => sub.timeslotId === slot._id));

	// Compute capabilities based on phase and business rules
	switch (phase) {
		case EventPhase.DRAFT:
			return {
				canEdit: true,
				canPublish: hasRequiredInfo(event) && timeslots.length > 0,
				canAcceptSubmissions: false,
				canGenerateContent: false,
				canFinalize: false,
				showUrgentBanner: false,
				showDayOfFeatures: false,
			};

		case EventPhase.PLANNING:
			return {
				canEdit: true,
				canPublish: false,
				canAcceptSubmissions: now < submissionDeadline,
				canGenerateContent: timeslots.length > 0,
				canFinalize: now > submissionDeadline && hasAllSubmissions,
				showUrgentBanner: now > submissionDeadline && !hasAllSubmissions,
				showDayOfFeatures: false,
			};

		case EventPhase.FINALIZED:
			return {
				canEdit: false, // Limited editing only
				canPublish: false,
				canAcceptSubmissions: false,
				canGenerateContent: true,
				canFinalize: false,
				showUrgentBanner: isEventDay,
				showDayOfFeatures: isEventDay,
			};

		case EventPhase.DAY_OF:
			return {
				canEdit: false,
				canPublish: false,
				canAcceptSubmissions: false,
				canGenerateContent: true,
				canFinalize: false,
				showUrgentBanner: true,
				showDayOfFeatures: true,
			};

		case EventPhase.COMPLETED:
		case EventPhase.CANCELLED:
			return {
				canEdit: false,
				canPublish: false,
				canAcceptSubmissions: false,
				canGenerateContent: false,
				canFinalize: false,
				showUrgentBanner: false,
				showDayOfFeatures: false,
			};

		default:
			// Safe defaults
			return {
				canEdit: false,
				canPublish: false,
				canAcceptSubmissions: false,
				canGenerateContent: false,
				canFinalize: false,
				showUrgentBanner: false,
				showDayOfFeatures: false,
			};
	}
}

// Get the appropriate phase based on current state
export function computeEventPhase(
	event: Doc<'events'>,
	timeslots: Doc<'timeslots'>[],
	submissions: Doc<'submissions'>[]
): EventPhaseType {
	const now = new Date();
	const eventDate = new Date(event.date);

	// If already has a phase, check if we need to auto-transition
	if (event.phase) {
		// Auto-transition to day_of if it's event day
		if (event.phase === EventPhase.FINALIZED && isSameDay(now, eventDate)) {
			return EventPhase.DAY_OF;
		}
		return event.phase as EventPhaseType;
	}

	// Otherwise map from legacy status
	return mapLegacyStatus(event.status);
}

// Map legacy status to new phase
function mapLegacyStatus(status: 'draft' | 'active' | 'completed'): EventPhaseType {
	switch (status) {
		case 'draft':
			return EventPhase.DRAFT;
		case 'active':
			return EventPhase.PLANNING;
		case 'completed':
			return EventPhase.COMPLETED;
		default:
			return EventPhase.DRAFT;
	}
}

// Valid phase transitions
export const ValidTransitions: Record<EventPhaseType, EventPhaseType[]> = {
	[EventPhase.DRAFT]: [EventPhase.PLANNING, EventPhase.CANCELLED],
	[EventPhase.PLANNING]: [EventPhase.FINALIZED, EventPhase.CANCELLED],
	[EventPhase.FINALIZED]: [EventPhase.DAY_OF, EventPhase.CANCELLED],
	[EventPhase.DAY_OF]: [EventPhase.COMPLETED],
	[EventPhase.COMPLETED]: [],
	[EventPhase.CANCELLED]: [],
};

// Check if a transition is valid
export function isValidTransition(from: EventPhaseType, to: EventPhaseType): boolean {
	return ValidTransitions[from]?.includes(to) || false;
}

// Get next available actions for an event
export interface EventAction {
	id: string;
	label: string;
	icon: string;
	action: string;
	variant?: 'default' | 'destructive' | 'outline' | 'secondary';
	confirmRequired: boolean;
	confirmMessage?: string;
}

export function getAvailableActions(
	phase: EventPhaseType,
	capabilities: EventCapabilities
): EventAction[] {
	const actions: EventAction[] = [];

	switch (phase) {
		case EventPhase.DRAFT:
			if (capabilities.canPublish) {
				actions.push({
					id: 'publish',
					label: 'Publish Event',
					icon: 'send',
					action: 'PUBLISH_EVENT',
					confirmRequired: true,
					confirmMessage: 'Publishing will make this event visible to DJs. Continue?',
				});
			}
			actions.push({
				id: 'cancel',
				label: 'Cancel',
				icon: 'x',
				action: 'CANCEL_EVENT',
				variant: 'destructive',
				confirmRequired: true,
				confirmMessage: 'Are you sure you want to cancel this event?',
			});
			break;

		case EventPhase.PLANNING:
			if (capabilities.canFinalize) {
				actions.push({
					id: 'finalize',
					label: 'Finalize Lineup',
					icon: 'lock',
					action: 'FINALIZE_EVENT',
					confirmRequired: true,
					confirmMessage:
						'Finalizing will lock the lineup and prevent further submissions. Continue?',
				});
			}
			actions.push({
				id: 'cancel',
				label: 'Cancel Event',
				icon: 'x',
				action: 'CANCEL_EVENT',
				variant: 'destructive',
				confirmRequired: true,
				confirmMessage: 'Are you sure you want to cancel this event? All submissions will be lost.',
			});
			break;

		case EventPhase.FINALIZED:
			if (capabilities.showDayOfFeatures) {
				actions.push({
					id: 'start',
					label: 'Start Event Day',
					icon: 'play',
					action: 'START_EVENT_DAY',
					confirmRequired: false,
				});
			}
			break;

		case EventPhase.DAY_OF:
			actions.push({
				id: 'complete',
				label: 'Mark as Completed',
				icon: 'check',
				action: 'COMPLETE_EVENT',
				confirmRequired: true,
				confirmMessage: 'Mark this event as completed?',
			});
			break;
	}

	return actions;
}
