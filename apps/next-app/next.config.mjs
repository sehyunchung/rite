import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily force dynamic rendering to debug build issues
  experimental: {
    // Force all pages to be dynamically rendered
    // This helps identify if the issue is with static generation
  },
  
  // PostHog reverse proxy to avoid ad blockers
  async rewrites() {
    return [
      // Handle both root level and locale-prefixed routes
      {
        source: "/ingest/static/:path*", 
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/:locale/ingest/static/:path*", 
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/:locale/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/:locale/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ]
  },
}

export default withNextIntl(nextConfig);