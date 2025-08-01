import { PostHog } from 'posthog-node'
import { POSTHOG_CONFIG } from '@rite/posthog-config'

// Server-side PostHog client
export function createServerPostHog() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    ...POSTHOG_CONFIG.server
  })
}

// Server action for tracking events
export async function trackServerEvent(
  distinctId: string, 
  event: string, 
  properties?: Record<string, any>
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn('PostHog key not found, skipping server event tracking')
    return
  }
  
  const posthogServer = createServerPostHog()
  
  try {
    posthogServer.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        platform: 'web',
        environment: process.env.NODE_ENV,
      }
    })
    
    await posthogServer.shutdown()
  } catch (error) {
    console.error('Failed to track server event:', error)
  }
}