export const POSTHOG_CONFIG = {
  web: {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false,
    person_profiles: 'identified_only',
    sanitize_properties: (properties: any, event: string) => {
      // Remove sensitive data
      if (properties.$current_url) {
        properties.$current_url = properties.$current_url.replace(/token=[^&]+/g, 'token=***')
      }
      if (properties.url) {
        properties.url = properties.url.replace(/token=[^&]+/g, 'token=***')
      }
      return properties
    },
    autocapture: {
      css_selector_allowlist: ['[data-ph-capture]'] as string[],
    },
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
        email: true,
      },
    },
  },
  
  mobile: {
    captureApplicationLifecycleEvents: true,
    captureScreenViews: true,
    enableSessionReplay: false,
  },
  
  server: {
    flushAt: 1,
    flushInterval: 0
  }
} as const

export const DJ_PLATFORM_EVENTS = {
  // Authentication
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_UP: 'user_signed_up',
  OAUTH_CONNECTED: 'oauth_connected',
  
  // Event Management
  EVENT_CREATED: 'event_created',
  EVENT_PUBLISHED: 'event_published',
  EVENT_VIEWED: 'event_viewed',
  
  // DJ Submissions
  SUBMISSION_STARTED: 'dj_submission_started',
  SUBMISSION_COMPLETED: 'dj_submission_completed',
  SUBMISSION_UPLOADED: 'dj_submission_uploaded',
  
  // Timeslots
  TIMESLOT_SELECTED: 'timeslot_selected',
  TIMESLOT_BOOKED: 'timeslot_booked',
  
  // Instagram Integration
  INSTAGRAM_PROFILE_VIEWED: 'instagram_profile_viewed',
  INSTAGRAM_CONTENT_SHARED: 'instagram_content_shared',
  
  // Navigation
  PAGE_VIEW: '$pageview',
} as const

export type DJPlatformEvents = typeof DJ_PLATFORM_EVENTS[keyof typeof DJ_PLATFORM_EVENTS]