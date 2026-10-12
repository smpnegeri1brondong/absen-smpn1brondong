const CACHE_NAME = 'sneb-in-v6';
const urlsToCache = [
  './',
  './index.html',
  './halaman-absen.html',
  './admin-absen.html',
  './logo-smp2.png',
  './logo-snebin.png',
  './manifest.json'
];

// Install - pre-cache with reload to bypass http cache
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(c=>{
      return c.addAll(urlsToCache.map(url=>new Request(url, {cache: 'reload'})))
        .catch(()=>Promise.allSettled(urlsToCache.map(u=>c.add(new Request(u, {cache: 'reload'})))));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>{
      if(k!==CACHE_NAME) return caches.delete(k);
    }))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const url = e.request.url;

  // Jangan cache Firebase
  if(url.includes('firestore.googleapis.com') || url.includes('firebase') || url.includes('googleapis.com') || url.includes('gstatic.com')){
    return;
  }

  // Untuk logo & manifest -> NETWORK FIRST biar kalau kamu ganti file di GitHub langsung ke-update
  if(url.includes('logo-snebin.png') || url.includes('logo-smp2.png') || url.includes('manifest.json')){
    e.respondWith(
      fetch(new Request(e.request, {cache: 'no-store'}))
        .then(res=>{
          const clone=res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
          return res;
        })
        .catch(()=>caches.match(e.request))
    );
    return;
  }

  // Untuk HTML -> network first biar update cepat
  if(e.request.destination==='document'){
    e.respondWith(
      fetch(e.request).then(res=>{
        const clone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
        return res;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }

  // Lainnya cache first
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      const clone=res.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
