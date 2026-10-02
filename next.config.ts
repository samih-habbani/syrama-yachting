import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The destination-picker pages moved under the same /yacht-charter and
  // /yacht-sale prefixes as the SEO destination pages they link to (was
  // /charters and /sales), and the full-fleet browse page (was the shared
  // /yachting/fleet, split by ?tab=) moved the same way. Permanent (308)
  // since the old paths were already live/indexed — this preserves their
  // SEO value at the new location instead of losing it. Query params not
  // consumed by a rule pass through to the destination automatically.
  async redirects() {
    return [
      { source: '/charters', destination: '/yacht-charter', permanent: true },
      { source: '/sales', destination: '/yacht-sale', permanent: true },
      // Checked before the catch-all /yachting/fleet rule below, so a
      // ?tab=sale link lands on the sale browse page instead of the
      // charter one.
      {
        source: '/yachting/fleet',
        has: [{ type: 'query', key: 'tab', value: 'sale' }],
        destination: '/yacht-sale/all-yachts',
        permanent: true,
      },
      { source: '/yachting/fleet', destination: '/yacht-charter/all-yachts', permanent: true },
    ]
  },
  images: {
    // Serve images exactly as stored, bypassing Vercel's Image Optimization.
    // In production every /_next/image request was answering HTTP 402
    // (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) — the plan's image
    // optimization quota was exhausted (the catalogue alone is ~5,600
    // uploaded photos, each requested in several sizes/formats) — so ALL
    // next/image photos site-wide (yacht thumbnails, lightbox, regions,
    // experiences) failed to render. The sources are already compressed
    // WebP (typically 50–200 KB), so serving them directly is fast and
    // can never hit a quota. Remove this line only if the Vercel plan is
    // upgraded and optimization is wanted again (the settings below then
    // apply again).
    unoptimized: true,
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
