import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
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
  // Align Turbopack root and outputFileTracingRoot with absolute paths to silence monorepo warnings
  experimental: {
    outputFileTracingRoot: path.join(__dirname, ".."),
  },
  turbopack: {
    root: path.join(__dirname, ".."),
  },
} as unknown as NextConfig;

export default nextConfig;
