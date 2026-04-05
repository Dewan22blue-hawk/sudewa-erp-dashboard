import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
};

module.exports = nextConfig;
