'use client'

import posthog from 'posthog-js'
import { POSTHOG_CONFIG, getPostHogEnvVars } from '@rite/posthog-config'

// Client-side PostHog initialization with error handling
export function initPostHog() {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    try {
      const { key } = getPostHogEnvVars()
      
      if (!key) {
        console.warn('PostHog key not found, skipping initialization')
        return posthog
      }
      
      posthog.init(key, {
        ...POSTHOG_CONFIG.web,
        api_host: '/ingest', // Always use proxy in browser
        ui_host: 'https://us.i.posthog.com', // UI host for PostHog interface
      })
    } catch (error) {
      console.error('Failed to initialize PostHog:', error)
      
      // Don't break the app, just continue without PostHog
      try {
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture('posthog_client_init_error', {
            error_message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          })
        }
      } catch (trackingError) {
        console.warn('Failed to track PostHog initialization error:', trackingError)
      }
    }
  }
  
  return posthog
}