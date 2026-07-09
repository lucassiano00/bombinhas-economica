// Service Worker mínimo — cache-first só para assets estáticos imutáveis.
// Existe para habilitar o A2HS na demo; páginas e API sempre vão à rede.
// ponytail: sem precache nem offline de páginas — adicionar se PWA offline virar requisito.
const CACHE = 'bombinhas-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  const isStatic =
    url.pathname.startsWith('/_next/static/') || /\.(png|ico|svg|woff2?)$/.test(url.pathname)
  if (e.request.method !== 'GET' || url.origin !== location.origin || !isStatic) return

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request)
      if (hit) return hit
      const res = await fetch(e.request)
      if (res.ok) cache.put(e.request, res.clone())
      return res
    })
  )
})
