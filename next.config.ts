import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // Required for Docker deployments

  // Image optimization
  images: {
    unoptimized: false,
  },

  // Enable SWR compression
  compress: true,

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Trailing slash
  trailingSlash: false,

  // Ignore build errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
