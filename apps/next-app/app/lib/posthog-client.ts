'use client'

import posthog from 'posthog-js'
import { POSTHOG_CONFIG } from '@rite/posthog-config'

// Client-side PostHog initialization
export function initPostHog() {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      ...POSTHOG_CONFIG.web,
      api_host: '/ingest', // Always use proxy in browser
      ui_host: 'https://us.i.posthog.com', // UI host for PostHog interface
    })
  }
  
  return posthog
}