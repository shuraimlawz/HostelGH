import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Use path.resolve(process.cwd()) to point to the repository root.
  // This silences monorepo warnings and avoids runtime ESM/CJS interop issues.
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
};

export default nextConfig;
