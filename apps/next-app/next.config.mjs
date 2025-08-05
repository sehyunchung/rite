import createNextIntlPlugin from 'next-intl/plugin';
import { withTamagui } from '@tamagui/next-plugin';
import { join } from 'path';

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

const tamaguiPlugin = withTamagui({
  config: '../../packages/ui/src/tamagui.config.ts',
  components: ['@rite/ui', 'tamagui'],
  appDir: true,
  disableExtraction: process.env.NODE_ENV === 'development',
  // Optimize for production
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
  excludeReactNativeWebExports: ['Switch', 'ProgressBar', 'Picker', 'Modal'],
})

export default withNextIntl(tamaguiPlugin(nextConfig));