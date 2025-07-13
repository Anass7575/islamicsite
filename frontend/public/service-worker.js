// Al-Hidaya Service Worker for offline functionality
const CACHE_NAME = 'al-hidaya-v1';
const STATIC_CACHE = 'al-hidaya-static-v1';
const DYNAMIC_CACHE = 'al-hidaya-dynamic-v1';
const QURAN_CACHE = 'al-hidaya-quran-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/fonts/arabic-font.woff2',
  '/patterns/islamic-pattern.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache for offline
const CACHED_API_ROUTES = [
  '/api/v1/quran/surahs',
  '/api/v1/prayer/methods',
  '/api/v1/hadith/collections'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('al-hidaya-') && 
                   cacheName !== CACHE_NAME &&
                   cacheName !== STATIC_CACHE &&
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName !== QURAN_CACHE;
          })
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Default strategy: Network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle API requests with smart caching
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Quran data - cache for longer
  if (url.pathname.includes('/quran/')) {
    return cacheFirst(request, QURAN_CACHE, 7 * 24 * 60 * 60 * 1000); // 7 days
  }
  
  // Prayer times - cache for shorter period
  if (url.pathname.includes('/prayer/times')) {
    return networkFirst(request, DYNAMIC_CACHE, 60 * 60 * 1000); // 1 hour
  }
  
  // Default API strategy
  return networkFirst(request, DYNAMIC_CACHE, 5 * 60 * 1000); // 5 minutes
}

// Handle static asset requests
async function handleStaticRequest(request) {
  return cacheFirst(request, STATIC_CACHE);
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page if available
    return cache.match('/offline');
  }
}

// Cache-first strategy
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cachedDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    
    if (maxAge && (now - cachedDate) < maxAge) {
      return cachedResponse;
    }
  }
  
  // Fetch from network and update cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return stale cache if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cacheName, maxAge) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is acceptable even if stale
      const cachedDate = new Date(cachedResponse.headers.get('date'));
      const now = new Date();
      
      // Allow stale cache for up to 24 hours when offline
      if ((now - cachedDate) < 24 * 60 * 60 * 1000) {
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

// Check if request is for static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico', '.webp'
  ];
  
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'sync-prayer-logs') {
    event.waitUntil(syncPrayerLogs());
  }
  
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

// Sync offline prayer logs
async function syncPrayerLogs() {
  // Get offline prayer logs from IndexedDB
  const db = await openDatabase();
  const tx = db.transaction('offline_prayers', 'readonly');
  const prayers = await tx.objectStore('offline_prayers').getAll();
  
  for (const prayer of prayers) {
    try {
      await fetch('/api/v1/prayer/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prayer)
      });
      
      // Remove from offline store after successful sync
      const deleteTx = db.transaction('offline_prayers', 'readwrite');
      await deleteTx.objectStore('offline_prayers').delete(prayer.id);
    } catch (error) {
      console.error('Failed to sync prayer log:', error);
    }
  }
}

// Sync offline bookmarks
async function syncBookmarks() {
  // Similar implementation for bookmarks
}

// Open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('al-hidaya-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offline_prayers')) {
        db.createObjectStore('offline_prayers', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offline_bookmarks')) {
        db.createObjectStore('offline_bookmarks', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Prayer time reminder',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Al-Hidaya', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/prayer-times')
    );
  }
});