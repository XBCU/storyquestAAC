import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["aac-speech-recognition"],
  webpack: (config, { isServer }) => {
    // Handle ES modules in node_modules
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
