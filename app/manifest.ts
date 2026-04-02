import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'For One Day',
    short_name: 'ForOneDay',
    description: 'Capture meaningful memories for people you love.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#102A43',
    icons: [
      {
        src: '/icon',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
