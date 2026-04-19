import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/f/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  experimental: {
    turbopack: {
      resolveAlias: {
        fs: "node-empty-polyfill",
        path: "node-empty-polyfill",
        os: "node-empty-polyfill",
        net: "node-empty-polyfill",
        tls: "node-empty-polyfill",
        crypto: "node-empty-polyfill",
      },
    },
  },
};

export default nextConfig;
