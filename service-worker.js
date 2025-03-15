importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const notificationData = event.data.json();
  
  const notificationOptions = {
    body: notificationData.options.body,
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Story'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/#/')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/#/')
    );
  }
});


workbox.precaching.precacheAndRoute([
  { url: 'index.html', revision: '1' },
  { url: 'styles.css', revision: '1' },
  { url: 'index.js', revision: '1' },
  { url: 'db.js', revision: '1' },
  { url: 'manifest.json', revision: '1' },
  { url: 'mobile.png', revision: '1' },
  { url: 'desktop.png', revision: '1' },
  { url: 'add-icon.png', revision: '1' },
  { url: 'favicon1.ico', revision: '1' },
  { url: 'icon192x192.png', revision: '1' },
  { url: 'icon512x512.png', revision: '1' }
]);


workbox.routing.registerRoute(

  new RegExp('\.(?:png|jpg|jpeg|svg|gif|webp)$|(?:photo|images|image|img)'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'images-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200, 
        maxAgeSeconds: 30 * 24 * 60 * 60, 
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200] 
      })
    ],
  })
);


workbox.routing.registerRoute(
  ({ url }) => url.origin.includes('story-api.dicoding.dev') && 
               (url.pathname.includes('/images/') || 
                url.href.includes('photoUrl') || 
                url.pathname.includes('/photo/')),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'story-api-images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 14 * 24 * 60 * 60, 
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ],
  })
);


workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'document',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-assets-cache',
  })
);


workbox.routing.registerRoute(
  new RegExp('https://story-api.dicoding.dev/v1/stories'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'stories-cache',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60, 
      })
    ]
  })
);


self.addEventListener('fetch', (event) => {

  if (event.request.url.includes('/v1/stories') && !event.request.url.includes('/add')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
        
          const clonedResponse = response.clone();
          
          
          caches.open('stories-detail-cache').then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          
       
          return response;
        })
        .catch(async () => {
         
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
        
          const clients = await self.clients.matchAll();
          
          if (clients.length > 0) {
        
            clients[0].postMessage({
              type: 'GET_STORIES_FROM_INDEXEDDB'
            });
            
            
            return new Promise((resolve) => {
              self.addEventListener('message', function handler(event) {
                if (event.data.type === 'INDEXEDDB_STORIES') {
                  self.removeEventListener('message', handler);
                  resolve(new Response(JSON.stringify({ listStory: event.data.stories }), {
                    headers: { 'Content-Type': 'application/json' }
                  }));
                }
              });
              
          
              setTimeout(() => {
                resolve(new Response(JSON.stringify({ 
                  error: true, 
                  message: 'Failed to fetch stories while offline'
                }), {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }));
              }, 3000);
            });
          }
          
       
          return new Response(JSON.stringify({ 
            error: true, 
            message: 'You are offline. No cached data available.'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
  }
  

  else if (event.request.destination === 'image' || 
          event.request.url.includes('.jpg') || 
          event.request.url.includes('.png') || 
          event.request.url.includes('photo') || 
          event.request.url.includes('images')) {
    
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          
          return fetch(event.request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
             
              const responseToCache = response.clone();
              
        
              caches.open('images-cache')
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(() => {
             
              return new Response('Image unavailable offline', { 
                status: 503, 
                statusText: 'Service Unavailable' 
              });
            });
        })
    );
  }
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'STORIES_FROM_INDEXEDDB') {

    self.indexedDBStories = event.data.stories;
  }
});