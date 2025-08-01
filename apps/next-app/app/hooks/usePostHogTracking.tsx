'use client'

import { usePostHog } from 'posthog-js/react'
import { DJ_PLATFORM_EVENTS } from '@rite/posthog-config'

export function usePostHogTracking() {
  const posthog = usePostHog()
  
  // Authentication tracking
  const trackSignIn = (provider: string, isNewUser: boolean, userId?: string) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.USER_SIGNED_IN, {
      provider,
      is_new_user: isNewUser,
      timestamp: new Date().toISOString(),
      platform: 'web'
    })
    
    // Identify user for better tracking
    if (userId) {
      posthog?.identify(userId, {
        signup_date: isNewUser ? new Date().toISOString() : undefined,
        auth_provider: provider,
        platform: 'web'
      })
    }
  }
  
  const trackSignUp = (provider: string, userId: string) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.USER_SIGNED_UP, {
      provider,
      platform: 'web',
      timestamp: new Date().toISOString()
    })
    
    posthog?.identify(userId, {
      signup_date: new Date().toISOString(),
      auth_provider: provider,
      platform: 'web',
      events_created: 0,
      submissions_made: 0
    })
  }
  
  const trackOAuthConnection = (provider: 'instagram' | 'google', success: boolean, error?: string) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.OAUTH_CONNECTED, {
      provider,
      success,
      error_type: success ? undefined : error || 'connection_failed',
      platform: 'web'
    })
  }
  
  // Event management tracking
  const trackEventCreation = (eventType: string, hasInstagramConnection: boolean, timeslotsCount: number) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.EVENT_CREATED, {
      event_type: eventType,
      has_instagram_connection: hasInstagramConnection,
      timeslots_count: timeslotsCount,
      platform: 'web'
    })
  }
  
  const trackEventView = (eventId: string, eventType: string, isOwner: boolean) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.EVENT_VIEWED, {
      event_id: eventId,
      event_type: eventType,
      is_owner: isOwner,
      platform: 'web'
    })
  }
  
  // DJ submission tracking
  const trackSubmissionStarted = (eventId: string, timeslotId: string) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.SUBMISSION_STARTED, {
      event_id: eventId,
      timeslot_id: timeslotId,
      platform: 'web'
    })
  }
  
  const trackSubmissionCompleted = (submissionId: string, eventId: string, fileType: string, fileSizeMB?: number) => {
    posthog?.capture(DJ_PLATFORM_EVENTS.SUBMISSION_COMPLETED, {
      submission_id: submissionId,
      event_id: eventId,
      file_type: fileType,
      file_size_mb: fileSizeMB,
      platform: 'web'
    })
  }
  
  // Feature usage tracking
  const trackFeatureUsage = {
    qrCodeGenerated: (eventId: string) => {
      posthog?.capture(DJ_PLATFORM_EVENTS.QR_CODE_GENERATED, {
        event_id: eventId,
        platform: 'web'
      })
    },
    
    instagramProfileViewed: (profileId: string) => {
      posthog?.capture(DJ_PLATFORM_EVENTS.INSTAGRAM_PROFILE_VIEWED, {
        profile_id: profileId,
        platform: 'web'
      })
    },
    
    languageSwitched: (from: string, to: string) => {
      posthog?.capture('language_switched', {
        from_locale: from,
        to_locale: to,
        platform: 'web'
      })
    }
  }
  
  // Performance tracking
  const trackPerformance = {
    pageLoad: (pageName: string, loadTime: number) => {
      posthog?.capture('page_performance', {
        page_name: pageName,
        load_time_ms: loadTime,
        performance_rating: loadTime < 1000 ? 'good' : loadTime < 3000 ? 'fair' : 'poor',
        platform: 'web'
      })
    },
    
    apiCall: (endpoint: string, duration: number, status: number) => {
      posthog?.capture('api_performance', {
        endpoint,
        duration_ms: duration,
        status_code: status,
        success: status >= 200 && status < 300,
        platform: 'web'
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
    
    // Features
    trackFeatureUsage,
    
    // Performance
    trackPerformance,
    
    // Direct posthog access
    posthog
  }
}