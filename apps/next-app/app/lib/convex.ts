import { ConvexHttpClient } from 'convex/browser';

// Handle missing environment variable gracefully
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl || convexUrl === 'your_convex_url_here') {
	console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex functionality will be disabled.');
}

export const convex =
	convexUrl && convexUrl !== 'your_convex_url_here' ? new ConvexHttpClient(convexUrl) : null;
