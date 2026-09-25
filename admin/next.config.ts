import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  // The build script runs TypeScript 7 before Next.js. Next still needs the
  // older TypeScript compiler API for configuration and editor tooling.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Convex functions live in ../backend, outside this app.
  turbopack: {
    root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  },
};

export default nextConfig;
