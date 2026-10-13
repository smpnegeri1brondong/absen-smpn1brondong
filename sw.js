const CACHE_NAME = 'sneb-in-v8-FINAL-FIX-IZIN-PULANGCEPAT';
const urlsToCache = [
  './',
  './index.html',
  './halaman-absen.html',
  './admin-absen.html',
  './logo-snebin.png',
  './logo-smp2.png',
  './manifest.json'
];

self.addEventListener('install', e=>{
  console.log('[SW v8] Installing - FINAL FIX');
  e.waitUntil(
    caches.open(CACHE_NAME).then(c=>{
      return c.addAll(urlsToCache.map(url=>new Request(url, {cache: 'reload'})))
        .catch(()=>Promise.allSettled(urlsToCache.map(u=>c.add(new Request(u, {cache: 'reload'})))));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  console.log('[SW v8] Activating - clean old cache');
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>{
      if(k!==CACHE_NAME){
        console.log('[SW] Deleting old cache', k);
        return caches.delete(k);
      }
    }))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const url = e.request.url;

  // Jangan cache Firebase / Firestore / Google
  if(url.includes('firestore.googleapis.com') || url.includes('firebase') || url.includes('googleapis.com') || url.includes('gstatic.com') || url.includes('google.com/maps')){
    return;
  }

  // Untuk semua HTML, manifest, logo -> NETWORK FIRST + NO STORE biar update GitHub langsung masuk tanpa clear cache
  if(url.includes('halaman-absen.html') || url.includes('admin-absen.html') || url.includes('index.html') || url.includes('manifest.json') || url.includes('logo-snebin') || url.includes('logo-smp2')){
    e.respondWith(
      fetch(new Request(e.request.url.split('?')[0], {cache: 'no-store', headers: {'Cache-Control': 'no-cache'}}))
        .then(res=>{
          const clone=res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
          return res;
        })
        .catch(()=>caches.match(e.request).then(r=> r || caches.match('./index.html')))
    );
    return;
  }

  // Untuk document lain -> network first juga biar gak nyangkut v1
  if(e.request.destination==='document'){
    e.respondWith(
      fetch(new Request(e.request, {cache: 'no-store'})).then(res=>{
        const clone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
        return res;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }

  // Lainnya cache first tapi update background
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const networkFetch = fetch(e.request).then(res=>{
        const clone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
        return res;
      }).catch(()=>cached);
      return cached || networkFetch;
    })
  );
});