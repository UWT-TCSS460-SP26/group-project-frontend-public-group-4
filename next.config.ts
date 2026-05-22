import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    domains: ["image.tmdb.org"],
  },
};

export default nextConfig;
