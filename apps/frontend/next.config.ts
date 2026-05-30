import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["mayday-oversweet-defense.ngrok-free.dev"],
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;