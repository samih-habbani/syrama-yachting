import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Syrama Yachting — Luxury Yacht Charter & Sales',
    short_name: 'Syrama Yachting',
    description: 'Luxury yacht charter and sales across the French Riviera, Mediterranean, Dubai and worldwide.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06090f',
    theme_color: '#06090f',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
