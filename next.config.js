/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript and ESLint during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure proper routing
  output: "standalone",
  trailingSlash: false,
  // Keep existing image config
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dublinbet.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.casumo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.ninecasino.com",
        pathname: "/**",
      },
    ],
  },
  // Add build ID to help with caching issues
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

module.exports = nextConfig;
