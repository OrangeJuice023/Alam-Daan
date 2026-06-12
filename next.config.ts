// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.mapillary.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.mapillary.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.mapillary.com',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
  // NOTE: wildcard CORS headers removed deliberately. The dashboard is
  // same-origin, so no cross-origin access to /api/* is needed — and the
  // wildcard previously let any website consume the OpenRouter-backed
  // /api/classify endpoint from a browser.
};

export default nextConfig;
