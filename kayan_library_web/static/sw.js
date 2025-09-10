// Service Worker لتطبيق مكتبة ومطبعة كيان
// Kayan Library & Printing Service Worker

const CACHE_NAME = 'kayan-library-v1.0.0';
const urlsToCache = [
  '/',
  '/static/mobile-style.css',
  '/static/style.css',
  '/static/manifest.json',
  '/products',
  '/customers',
  '/new_invoice',
  // Bootstrap & FontAwesome من CDN
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// اعتراض طلبات الشبكة
self.addEventListener('fetch', function(event) {
  // تجاهل طلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // تجاهل طلبات POST (الفواتير والبيانات)
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إرجاع النسخة المحفوظة إذا وُجدت
        if (response) {
          console.log('📱 Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        // محاولة جلب من الشبكة
        return fetch(event.request)
          .then(function(response) {
            // التحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // حفظ نسخة في الكاش
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(function(error) {
            console.log('🌐 Service Worker: Network failed, serving offline page', error);
            
            // إرجاع صفحة أوفلاين للصفحات الرئيسية
            if (event.request.destination === 'document') {
              return caches.match('/offline.html') || 
                     new Response(getOfflineHTML(), {
                       headers: { 'Content-Type': 'text/html; charset=utf-8' }
                     });
            }
            
            // إرجاع صورة افتراضية للصور
            if (event.request.destination === 'image') {
              return new Response(getOfflineImage(), {
                headers: { 'Content-Type': 'image/svg+xml' }
              });
            }
            
            throw error;
          });
      })
  );
});

// معالجة رسائل من التطبيق الرئيسي
self.addEventListener('message', function(event) {
  console.log('💬 Service Worker: Received message', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(function() {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// معالجة التحديثات في الخلفية
self.addEventListener('sync', function(event) {
  console.log('🔄 Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// معالجة الإشعارات Push
self.addEventListener('push', function(event) {
  console.log('🔔 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من مكتبة كيان',
    icon: '/static/icon-192.png',
    badge: '/static/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'فتح التطبيق',
        icon: '/static/icon-72.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/static/icon-72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('مكتبة ومطبعة كيان', options)
  );
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// دوال مساعدة
function doBackgroundSync() {
  return new Promise(function(resolve) {
    console.log('🔄 Service Worker: Performing background sync');
    // يمكن إضافة منطق مزامنة البيانات هنا
    setTimeout(resolve, 1000);
  });
}

function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>غير متصل - مكتبة ومطبعة كيان</title>
        <style>
            * { font-family: 'Arial Unicode MS', Arial, sans-serif; }
            body { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                text-align: center; 
                padding: 2rem;
                margin: 0;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
            .offline-title { font-size: 2rem; margin-bottom: 1rem; }
            .offline-message { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
            .retry-btn { 
                background: white; 
                color: #667eea; 
                border: none; 
                padding: 1rem 2rem; 
                border-radius: 50px; 
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            .retry-btn:hover { transform: scale(1.05); }
        </style>
    </head>
    <body>
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">غير متصل بالإنترنت</h1>
        <p class="offline-message">
            يبدو أنك غير متصل بالإنترنت حالياً.<br>
            تحقق من اتصالك وحاول مرة أخرى.
        </p>
        <button class="retry-btn" onclick="window.location.reload()">
            إعادة المحاولة
        </button>
        
        <script>
            // إعادة تحميل تلقائي عند عودة الاتصال
            window.addEventListener('online', function() {
                window.location.reload();
            });
        </script>
    </body>
    </html>
  `;
}

function getOfflineImage() {
  return `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0f0f0"/>
      <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#666">
        صورة غير متاحة
      </text>
    </svg>
  `;
}

// تسجيل معلومات Service Worker
console.log('🚀 Service Worker: Loaded successfully');
console.log('📦 Cache Name:', CACHE_NAME);
console.log('🔗 URLs to Cache:', urlsToCache.length, 'files');
