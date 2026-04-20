import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        crypto: false,
        stream: false,
        buffer: false,
        process: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        url: false,
        util: false,
      };
    }
    return config;
  },
  serverExternalPackages: [
    "mongoose",
    "@arcium-hq/client",
    "@arcium-hq/arcium-js",
  ],
};

export default nextConfig;
