import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // Required for Docker deployments
<<<<<<< HEAD
  
=======

>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
  // Image optimization
  images: {
    unoptimized: false,
  },
<<<<<<< HEAD
  
  // Enable SWR compression
  compress: true,
  
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  
  // Trailing slash
  trailingSlash: false,
=======

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
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
};

module.exports = nextConfig;
