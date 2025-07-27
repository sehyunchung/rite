import { ConvexHttpClient } from 'convex/browser'

// Handle missing environment variable gracefully
const convexUrl = import.meta.env.VITE_CONVEX_URL
if (!convexUrl || convexUrl === 'your_convex_url_here') {
  console.warn('VITE_CONVEX_URL is not set. Convex functionality will be disabled.')
}

export const convex = (convexUrl && convexUrl !== 'your_convex_url_here') ? new ConvexHttpClient(convexUrl) : null