import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["preview.luqueee.dev"],
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
