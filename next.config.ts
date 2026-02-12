import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Enable strict mode in development
  reactStrictMode: true,
};

export default nextConfig;
