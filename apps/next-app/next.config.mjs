import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily force dynamic rendering to debug build issues
  experimental: {
    // Force all pages to be dynamically rendered
    // This helps identify if the issue is with static generation
  }
}

export default withNextIntl(nextConfig);