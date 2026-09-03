import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Source photos are already WebP; let the optimizer re-encode to AVIF
    // too (smaller still on the browsers that support it) and pick
    // whichever the requesting browser accepts.
    formats: ['image/avif', 'image/webp'],
    // Mobile-first device buckets so a phone on cellular gets a genuinely
    // small variant instead of the same file a desktop hero gets.
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256, 384],
    // Required explicitly as of Next.js 16 — every `quality` value used
    // anywhere via next/image must be allowlisted here.
    qualities: [75, 82],
    // Uploads are immutable (a re-upload gets a new filename), so the
    // optimizer's cache can be long-lived — no repeat re-encoding cost.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
