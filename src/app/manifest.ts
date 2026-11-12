import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Netizen City — How Netizen Build Our City',
    short_name: 'Netizen City',
    description: 'Kota Virtual 3D Sosial Interaktif Komunitas Netizen City',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F4EE',
    theme_color: '#38bdf8',
    icons: [
      {
        src: '/brand/icon-96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/brand/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/brand/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
