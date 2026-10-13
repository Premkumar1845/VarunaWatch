import type { NextConfig } from "next";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "";
const backendBase = rawUrl ? rawUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "") : "";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendBase) {
      // Use native Next.js serverless API routes inside app/api/[...path]/route.ts
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
