'use client'

import posthog from 'posthog-js'
import { POSTHOG_CONFIG } from '@rite/posthog-config'

// Client-side PostHog initialization
export function initPostHog() {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      ...POSTHOG_CONFIG.web,
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    })
  }
  
  return posthog
}