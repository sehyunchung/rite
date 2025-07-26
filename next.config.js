/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["convex"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https', 
        hostname: 'instagram.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent-lga3-1.cdninstagram.com',
      },
    ],
  },
  turbopack: {
    // Turbopack is enabled by default when using --turbopack flag
  },
}

module.exports = nextConfig