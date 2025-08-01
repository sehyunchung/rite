import { usePostHog } from 'posthog-react-native'
import { DJ_PLATFORM_EVENTS } from '@rite/posthog-config'

export function usePostHogTracking() {
  const posthog = usePostHog()
  
  // Authentication tracking
  const trackSignIn = (provider: string, isNewUser: boolean, userId?: string) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.USER_SIGNED_IN, {
      provider,
      is_new_user: isNewUser,
      timestamp: new Date().toISOString(),
      platform: 'mobile'
    })
    
    // Identify user for better tracking
    if (userId) {
      posthog?.identify(userId, {
        signup_date: isNewUser ? new Date().toISOString() : undefined,
        auth_provider: provider,
        platform: 'mobile'
      })
    }
  }
  
  const trackSignUp = (provider: string, userId: string) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.USER_SIGNED_UP, {
      provider,
      platform: 'mobile',
      timestamp: new Date().toISOString()
    })
    
    posthog?.identify(userId, {
      signup_date: new Date().toISOString(),
      auth_provider: provider,
      platform: 'mobile',
      events_created: 0,
      submissions_made: 0
    })
  }
  
  const trackOAuthConnection = (provider: 'instagram' | 'google', success: boolean, error?: string) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.OAUTH_CONNECTED, {
      provider,
      success,
      error_type: success ? undefined : error || 'connection_failed',
      platform: 'mobile'
    })
  }
  
  // Event management tracking
  const trackEventCreation = (eventType: string, hasInstagramConnection: boolean, timeslotsCount: number) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.EVENT_CREATED, {
      event_type: eventType,
      has_instagram_connection: hasInstagramConnection,
      timeslots_count: timeslotsCount,
      platform: 'mobile'
    })
  }
  
  const trackEventView = (eventId: string, eventType: string, isOwner: boolean) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.EVENT_VIEWED, {
      event_id: eventId,
      event_type: eventType,
      is_owner: isOwner,
      platform: 'mobile'
    })
  }
  
  // DJ submission tracking
  const trackSubmissionStarted = (eventId: string, timeslotId: string) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.SUBMISSION_STARTED, {
      event_id: eventId,
      timeslot_id: timeslotId,
      platform: 'mobile'
    })
  }
  
  const trackSubmissionCompleted = (submissionId: string, eventId: string, fileType: string, fileSizeMB?: number) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.SUBMISSION_COMPLETED, {
      submission_id: submissionId,
      event_id: eventId,
      file_type: fileType,
      file_size_mb: fileSizeMB,
      platform: 'mobile'
    })
  }
  
  // Navigation tracking (screen views are auto-captured by PostHog)
  const trackScreenView = (screenName: string, params?: Record<string, any>) => {
    posthog?.screen(screenName, {
      ...params,
      platform: 'mobile'
    })
  }
  
  // Feature usage tracking
  const trackFeatureUsage = {
    qrCodeScanned: (eventId: string) => {
      posthog?.capture(DJ_PLATFORM_EVENTS.QR_CODE_SCANNED, {
        event_id: eventId,
        platform: 'mobile'
      })
    },
    
    instagramProfileViewed: (profileId: string) => {
      posthog?.capture(DJ_PLATFORM_EVENTS.INSTAGRAM_PROFILE_VIEWED, {
        profile_id: profileId,
        platform: 'mobile'
      })
    },
    
    appBackgrounded: () => {
      posthog?.capture('app_backgrounded', {
        platform: 'mobile'
      })
    },
    
    appForegrounded: () => {
      posthog?.capture('app_foregrounded', {
        platform: 'mobile'
      })
    }
  }
  
  return {
    // Auth
    trackSignIn,
    trackSignUp,
    trackOAuthConnection,
    
    // Events
    trackEventCreation,
    trackEventView,
    
    // Submissions
    trackSubmissionStarted,
    trackSubmissionCompleted,
    
    // Navigation
    trackScreenView,
    
    // Features
    trackFeatureUsage,
    
    // Direct posthog access
    posthog
  }
}