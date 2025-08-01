import React from 'react'
import { PostHogProvider } from 'posthog-react-native'
import { POSTHOG_CONFIG, getPostHogEnvVars } from '@rite/posthog-config'

interface PostHogProviderWrapperProps {
  children: React.ReactNode
}

export function PostHogProviderWrapper({ children }: PostHogProviderWrapperProps) {
  const { key, host } = getPostHogEnvVars()

  if (!key) {
    console.warn('PostHog key not found in environment variables')
    return <>{children}</>
  }

  // Get app version from package.json dynamically
  let appVersion = 'unknown'
  try {
    appVersion = require('../../package.json').version
  } catch (error) {
    console.warn('Could not load app version from package.json:', error)
  }

  return (
    <PostHogProvider 
      apiKey={key}
      options={{
        ...POSTHOG_CONFIG.mobile,
        host,
        properties: {
          platform: 'mobile',
          app_version: appVersion,
        }
      }}
    >
      {children}
    </PostHogProvider>
  )
}