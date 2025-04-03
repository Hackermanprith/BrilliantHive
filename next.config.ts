import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    // Removed invalid property 'trustHostHeader'
  },
  
};

export default nextConfig;
module.exports = nextConfig;
