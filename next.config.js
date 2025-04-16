/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript and ESLint during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
};

module.exports = nextConfig;
