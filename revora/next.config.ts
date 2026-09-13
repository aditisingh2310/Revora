import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo root: pnpm hoists the real Next.js copy to the workspace
  // <root>/node_modules/.pnpm store. Tracing must include it, otherwise
  // server bundles (middleware included) ship without their deps and 500.
  outputFileTracingRoot: path.join(__dirname, ".."),
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(md|LICENSE)$/i,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
