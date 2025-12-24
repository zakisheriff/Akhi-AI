import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/sitemap',
        destination: '/sitemap.xml',
        permanent: true, // 301 redirect
      },
      {
        source: '/robots',
        destination: '/robots.txt',
        permanent: true, // 301 redirect
      },
    ];
  },
};

export default nextConfig;
