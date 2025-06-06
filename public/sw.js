const CACHE_NAME = 'portfolio-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Критические ресурсы для precaching
const PRECACHE_URLS = [
  '/',
  '/privacy/',
  '/offline/',
  '/manifest.json',
  // Статические файлы из билда будут добавлены динамически
];

// Статические ресурсы для кэширования
const STATIC_RESOURCES = [
  /\.(?:css|js|woff2?|ttf|otf)$/,
  /\/assets\//,
  /\/images\//
];

// Установка сервис-воркера
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Precache критических страниц
      caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS)),
      // Precache основных ресурсов
      precacheAssets()
    ]).then(() => self.skipWaiting())
  );
});

// Precaching основных ресурсов
async function precacheAssets() {
  const cache = await caches.open(STATIC_CACHE);
  
  // Основные CSS и JS файлы (будут найдены динамически)
  const criticalAssets = [
    '/_astro/index.R7dpLFGb.css',
    '/_astro/Layout.astro_astro_type_script_index_0_lang.Ce6X-p93.js'
  ];
  
  try {
    await cache.addAll(criticalAssets);
  } catch (error) {
    console.log('Failed to precache some assets:', error);
  }
}

// Активация сервис-воркера
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE
            )
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Обработка fetch запросов
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем non-GET запросы
  if (request.method !== 'GET') return;

  // Пропускаем внешние запросы
  if (url.origin !== location.origin) return;

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // HTML страницы - Network First
  if (request.headers.get('accept')?.includes('text/html')) {
    return networkFirst(request, DYNAMIC_CACHE);
  }
  
  // Статические ресурсы - Cache First
  if (STATIC_RESOURCES.some(pattern => pattern.test(url.pathname))) {
    return cacheFirst(request, STATIC_CACHE);
  }
  
  // Изображения - Cache First с fallback
  if (request.headers.get('accept')?.includes('image/')) {
    return cacheFirst(request, STATIC_CACHE);
  }
  
  // Остальное - Network First
  return networkFirst(request, DYNAMIC_CACHE);
}

// Cache First стратегия
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First стратегия
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    // Офлайн fallback для HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline/');
    }
    
    return new Response('Offline', { status: 503 });
  }
}