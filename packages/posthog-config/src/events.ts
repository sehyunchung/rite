import { DJPlatformEvents } from './config';
import {
	BaseEventProperties,
	EventCreationProperties,
	DJSubmissionProperties,
	AuthenticationProperties,
} from './types';

export function createEventTracker<T extends Record<string, any>>(
	eventName: DJPlatformEvents,
	defaultProperties?: Partial<T>
) {
	return (properties?: T) => ({
		event: eventName,
		properties: { ...defaultProperties, ...properties },
	});
}

export class DJPlatformAnalytics {
	// User Journey Tracking
	static trackUserJourney = {
		onboarding: {
			started: () => ({ event: 'onboarding_started' }),
			profileCompleted: () => ({ event: 'profile_completed' }),
			instagramConnected: () => ({ event: 'instagram_connected' }),
			firstEventViewed: () => ({ event: 'first_event_viewed' }),
		},

		eventCreation: {
			started: (type: string) => ({
				event: 'event_creation_started',
				properties: { event_type: type },
			}),
			timeslotAdded: (count: number) => ({
				event: 'timeslot_added',
				properties: { total_timeslots: count },
			}),
			published: (eventId: string) => ({
				event: 'event_published',
				properties: { event_id: eventId },
			}),
		},

		djSubmission: {
			started: (eventId: string) => ({
				event: 'submission_started',
				properties: { event_id: eventId },
			}),
			fileUploaded: (fileType: string, sizeMB: number) => ({
				event: 'submission_file_uploaded',
				properties: { file_type: fileType, file_size_mb: sizeMB },
			}),
			completed: (submissionId: string) => ({
				event: 'submission_completed',
				properties: { submission_id: submissionId },
			}),
		},
	};

	// Performance Monitoring
	static trackPerformance = {
		pageLoad: (pageName: string, loadTime: number) => ({
			event: 'page_performance',
			properties: {
				page_name: pageName,
				load_time_ms: loadTime,
				performance_rating: loadTime < 1000 ? 'good' : loadTime < 3000 ? 'fair' : 'poor',
			},
		}),

		apiCall: (endpoint: string, duration: number, status: number) => ({
			event: 'api_performance',
			properties: {
				endpoint,
				duration_ms: duration,
				status_code: status,
				success: status >= 200 && status < 300,
			},
		}),
	};

	// Feature Usage
	static trackFeatureUsage = {
		qrCodeGenerated: (eventId: string) => ({
			event: 'qr_code_generated',
			properties: { event_id: eventId },
		}),

		instagramProfileViewed: (profileId: string) => ({
			event: 'instagram_profile_viewed',
			properties: { profile_id: profileId },
		}),

		languageSwitched: (from: string, to: string) => ({
			event: 'language_switched',
			properties: { from_locale: from, to_locale: to },
		}),
	};
}
