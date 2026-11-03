importScripts('firebase-messaging-sw.js');
const CACHE_NAME = 'sneb-in-v13-FORCE-LOGO-V3';
const urlsToCache = [
  './',
  './index.html',
  './halaman-absen.html',
  './admin-absen.html',
  './logo-snebin-v3.png',
  './logo-smp2.png',
  './manifest.json'
];
self.addEventListener('install', e=>{
  console.log('[SW v13] Installing - LOGO V3');
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urlsToCache.map(url=>new Request(url, {cache: 'reload'}))).catch(()=>Promise.allSettled(urlsToCache.map(u=>c.add(new Request(u, {cache: 'reload'})))))));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>{ if(k!==CACHE_NAME) return caches.delete(k); }))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const url=e.request.url;
  if(url.includes('firestore.googleapis.com')||url.includes('firebase')||url.includes('googleapis.com')||url.includes('gstatic.com')||url.includes('google.com/maps')) return;
  if(url.includes('halaman-absen.html')||url.includes('admin-absen.html')||url.includes('index.html')||url.includes('manifest.json')||url.includes('logo-snebin')||url.includes('logo-smp2')){
    e.respondWith(fetch(new Request(e.request.url.split('?')[0], {cache:'no-store', headers:{'Cache-Control':'no-cache'}})).then(res=>{ const clone=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request, clone)); return res; }).catch(()=>caches.match(e.request).then(r=> r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=> r || caches.match('./index.html'))));
});
self.addEventListener('message', e=>{
  if(e.data && e.data.type==='SHOW_NOTIF'){
    self.registration.showNotification('SNEB.in', {body:e.data.body, icon:'logo-smp2.png', badge:'logo-smp2.png', vibrate:[200,100,200], tag:e.data.tag||'sneb-notif', data:{url:'./halaman-absen.html'}});
  }
});
