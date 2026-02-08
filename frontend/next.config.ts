import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/messages/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/:path*`,
      },
      // You can add more specific rewrites here if needed, but avoid /api/auth/* because NextAuth uses it
    ];
  },
};


export default nextConfig;
