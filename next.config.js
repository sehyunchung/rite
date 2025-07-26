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
  turbopack: (config) => {
    // Exclude src directory from builds
    config.resolve.modules = config.resolve.modules.filter(module => module !== 'src')
    return config
  },
}

module.exports = nextConfig