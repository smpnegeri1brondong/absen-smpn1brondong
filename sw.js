
const CACHE_NAME = 'si-absen-v8-icon-baru';
const urlsToCache = [
  './',
  './index.html',
  './halaman-absen.html',
  './admin-absen.html',
  './si-absen.png',
  './logo-smp2.png',
  './manifest.json'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urlsToCache)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME?caches.delete(k):null))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  // Jangan cache Firebase / Firestore / Google Maps
  if(e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('firebase') || e.request.url.includes('googleapis.com') || e.request.url.includes('gstatic.com')){
    return;
  }
  // Network first untuk HTML biar auto-update pas kamu push ke GitHub
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
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
    const clone=res.clone();
    caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
    return res;
  }).catch(()=>caches.match('./index.html'))));
});
