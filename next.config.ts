import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Headroom for image data URLs submitted through Server Actions.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
