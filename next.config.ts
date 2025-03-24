import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
