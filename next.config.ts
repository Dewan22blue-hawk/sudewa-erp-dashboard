import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  productionBrowserSourceMaps: false,
  outputFileTracingRoot: process.cwd(),
  images: {
    unoptimized: false,
  },
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  async headers() {
    const contentSecurityPolicy = isProduction
      ? [
          "default-src 'self'",
          "img-src 'self' data: https:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self'",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' https:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; ")
      : [
          "default-src 'self'",
          "img-src 'self' data: https: blob:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' ws: wss: http: https:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
