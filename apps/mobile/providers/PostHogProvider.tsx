import React from 'react'
import { PostHogProvider } from 'posthog-react-native'
import { POSTHOG_CONFIG } from '@rite/posthog-config'

interface PostHogProviderWrapperProps {
  children: React.ReactNode
}

export function PostHogProviderWrapper({ children }: PostHogProviderWrapperProps) {
  const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

  if (!posthogKey) {
    console.warn('PostHog key not found in environment variables')
    return <>{children}</>
  }

  return (
    <PostHogProvider 
      apiKey={posthogKey}
      options={{
        ...POSTHOG_CONFIG.mobile,
        host: posthogHost,
        properties: {
          platform: 'mobile',
          app_version: require('../../package.json').version,
        }
      }}
    >
      {children}
    </PostHogProvider>
  )
}