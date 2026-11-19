import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/dashboard/:path*',
        destination: '/admin/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
