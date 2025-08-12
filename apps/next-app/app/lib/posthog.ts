// Re-export client and server functions from separate files
export { initPostHog } from './posthog-client';
export { createServerPostHog, trackServerEvent } from './posthog-server';
