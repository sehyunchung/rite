import { PostHog } from 'posthog-node'
import { POSTHOG_CONFIG, getPostHogEnvVars } from '@rite/posthog-config'

// Server-side PostHog client
export function createServerPostHog() {
  const { key, host } = getPostHogEnvVars()
  
  if (!key) {
    throw new Error('PostHog key not found in environment variables')
  }
  
  return new PostHog(key, {
    host,
    ...POSTHOG_CONFIG.server
  })
}

// Server action for tracking events
export async function trackServerEvent(
  distinctId: string, 
  event: string, 
  properties?: Record<string, any>
) {
  let posthogServer: PostHog | null = null
  
  try {
    posthogServer = createServerPostHog()
    
    posthogServer.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        platform: 'web',
        environment: process.env.NODE_ENV,
      }
    })
  } catch (error) {
    console.error('Failed to track server event:', error)
  } finally {
    // Ensure shutdown always happens to prevent memory leaks
    if (posthogServer) {
      try {
        await posthogServer.shutdown()
      } catch (shutdownError) {
        console.error('Failed to shutdown PostHog server instance:', shutdownError)
      }
    }
  }
}