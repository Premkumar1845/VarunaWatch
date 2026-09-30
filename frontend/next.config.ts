import type { NextConfig } from "next";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const backendBase = rawUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
  // Required to silence Turbopack warning in Next.js 16
  turbopack: {},
};

export default nextConfig;
