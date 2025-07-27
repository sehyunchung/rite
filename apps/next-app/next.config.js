/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["convex"],
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ["app"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: !process.env.NEXT_PUBLIC_CONVEX_URL,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "instagram.com",
      },
      {
        protocol: "https",
        hostname: "scontent-lga3-1.cdninstagram.com",
      },
    ],
  },
  turbopack: {
    // Turbopack is enabled by default when using --turbopack flag
  },
};

module.exports = nextConfig;
