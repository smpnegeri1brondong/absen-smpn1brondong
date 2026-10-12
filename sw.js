const CACHE_NAME = 'sneb-in-v5';
const urlsToCache = [
  './',
  './index.html',
  './halaman-absen.html',
  './admin-absen.html',
  './logo-snebin.png',
  './manifest.json'
];
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(c=>{
      return c.addAll(urlsToCache.map(url=>new Request(url, {cache: 'reload'}))).catch(()=>Promise.allSettled(urlsToCache.map(u=>c.add(u))));
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
  if(e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('firebase') || e.request.url.includes('googleapis.com') || e.request.url.includes('gstatic.com')) return;
  if(e.request.destination==='document'){
    e.respondWith(fetch(e.request).then(res=>{
      const clone=res.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
      return res;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
    const clone=res.clone();
    caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
    return res;
  }).catch(()=>caches.match('./index.html'))));
});
