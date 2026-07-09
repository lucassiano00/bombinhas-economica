import type { MetadataRoute } from 'next'

// PWA instalável — Next serve isto como /manifest.webmanifest e injeta o <link>.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bombinhas+ Econômica',
    short_name: 'Bombinhas+',
    description: 'Cartão de desconto digital de Bombinhas/SC.',
    id: '/pt',
    start_url: '/pt',
    display: 'standalone',
    background_color: '#0c2350',
    theme_color: '#0c2350',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
