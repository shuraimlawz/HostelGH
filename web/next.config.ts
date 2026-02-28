import type { NextConfig } from "next";

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
  // Ensure Turbopack/Next infers the correct workspace root in monorepos
  // This silences the "inferred your workspace root" warning on Vercel
  turbopack: {
    root: "web",
  },
} as unknown as NextConfig;

export default nextConfig;
