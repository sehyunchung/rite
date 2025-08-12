import { PostHogConfig } from 'posthog-js';
import { DJ_PLATFORM_EVENTS } from './config';

// Brand types for better type safety
export type EventId = string & { readonly __brand: 'EventId' };
export type TimeslotId = string & { readonly __brand: 'TimeslotId' };
export type SubmissionId = string & { readonly __brand: 'SubmissionId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type ProfileId = string & { readonly __brand: 'ProfileId' };

// Helper functions to create branded types
export const createEventId = (id: string): EventId => id as EventId;
export const createTimeslotId = (id: string): TimeslotId => id as TimeslotId;
export const createSubmissionId = (id: string): SubmissionId => id as SubmissionId;
export const createUserId = (id: string): UserId => id as UserId;
export const createProfileId = (id: string): ProfileId => id as ProfileId;

export interface RitePostHogConfig extends Partial<PostHogConfig> {
	platform: 'web' | 'mobile';
	environment: 'development' | 'staging' | 'production';
}

export interface PostHogUser {
	id: UserId;
	email?: string;
	name?: string;
	avatar_url?: string;
	signup_date: string;
	plan_type: 'free' | 'pro' | 'enterprise';
	instagram_connected: boolean;
	events_created: number;
	submissions_made: number;
}

export interface PostHogEventContext {
	page_title?: string;
	page_url?: string;
	referrer?: string;
	locale: string;
	user_agent?: string;
	screen_resolution?: string;
}

export interface BaseEventProperties {
	platform: 'web' | 'mobile';
	user_id?: UserId;
	session_id?: string;
	locale?: string;
	timestamp?: string;
}

// Specific event property interfaces
export interface EventCreationProperties extends BaseEventProperties {
	event_type: string;
	has_instagram_connection: boolean;
	timeslots_count: number;
}

export interface EventViewProperties extends BaseEventProperties {
	event_id: EventId;
	event_type: string;
	is_owner: boolean;
}

export interface DJSubmissionProperties extends BaseEventProperties {
	event_id: EventId;
	timeslot_id: TimeslotId;
	submission_type: 'audio' | 'video' | 'mixed';
	file_size_mb?: number;
}

export interface SubmissionCompletedProperties extends BaseEventProperties {
	submission_id: SubmissionId;
	event_id: EventId;
	file_type: string;
	file_size_mb?: number;
}

export interface AuthenticationProperties extends BaseEventProperties {
	provider: 'google' | 'instagram' | 'apple';
	is_new_user: boolean;
	signup_source?: string;
}

export interface OAuthConnectionProperties extends BaseEventProperties {
	provider: 'google' | 'instagram' | 'apple';
	success: boolean;
	error_type?: string;
}

export interface QRCodeProperties extends BaseEventProperties {
	event_id: EventId;
}

export interface InstagramProfileProperties extends BaseEventProperties {
	profile_id: ProfileId;
}

export interface TimeslotProperties extends BaseEventProperties {
	event_id: EventId;
	timeslot_id: TimeslotId;
}

// Event properties mapping for type safety
export interface EventPropertiesMap {
	[DJ_PLATFORM_EVENTS.USER_SIGNED_IN]: AuthenticationProperties;
	[DJ_PLATFORM_EVENTS.USER_SIGNED_UP]: AuthenticationProperties;
	[DJ_PLATFORM_EVENTS.OAUTH_CONNECTED]: OAuthConnectionProperties;
	[DJ_PLATFORM_EVENTS.EVENT_CREATED]: EventCreationProperties;
	[DJ_PLATFORM_EVENTS.EVENT_VIEWED]: EventViewProperties;
	[DJ_PLATFORM_EVENTS.SUBMISSION_STARTED]: DJSubmissionProperties;
	[DJ_PLATFORM_EVENTS.SUBMISSION_COMPLETED]: SubmissionCompletedProperties;
	[DJ_PLATFORM_EVENTS.TIMESLOT_SELECTED]: TimeslotProperties;
	[DJ_PLATFORM_EVENTS.TIMESLOT_BOOKED]: TimeslotProperties;
	[DJ_PLATFORM_EVENTS.INSTAGRAM_PROFILE_VIEWED]: InstagramProfileProperties;
	[DJ_PLATFORM_EVENTS.QR_CODE_GENERATED]: QRCodeProperties;
	[DJ_PLATFORM_EVENTS.QR_CODE_SCANNED]: QRCodeProperties;
}

// Type-safe event tracking function signature
export type TrackEvent = <T extends keyof EventPropertiesMap>(
	event: T,
	properties: EventPropertiesMap[T]
) => void;
