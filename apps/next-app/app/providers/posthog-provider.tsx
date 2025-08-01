'use client'

import { useEffect } from 'react'
import { PostHogProvider } from 'posthog-js/react'
import { initPostHog } from '../lib/posthog-client'
import { PostHogPrivacyManager } from '@rite/posthog-config'

export function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize PostHog if we have consent or are in development
    if (PostHogPrivacyManager.shouldLoadPostHog() || PostHogPrivacyManager.hasConsent()) {
      initPostHog()
    }
  }, [])

  const posthog = initPostHog()

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  )
}