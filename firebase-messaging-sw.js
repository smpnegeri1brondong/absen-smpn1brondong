importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: "AIzaSyCSi5QKL-MapUUdGLV4OuiXupXa3XmRKvg",
  authDomain: "smpn1-brondong-absen.firebaseapp.com",
  projectId: "smpn1-brondong-absen",
  storageBucket: "smpn1-brondong-absen.firebasestorage.app",
  messagingSenderId: "174884842248",
  appId: "1:174884842248:web:8625540d5f3ff8b7f45abd"
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload)=>{
  const title = payload.notification?.title || 'SNEB.in';
  const body = payload.notification?.body || 'Ada pengingat absen';
  self.registration.showNotification(title, {body, icon:'https://smpnegeri1brondong.github.io/absen-smpn1brondong/logo-smp2.png', data:{buka:'https://smpnegeri1brondong.github.io/absen-smpn1brondong/halaman-absen.html'}});
});
self.addEventListener('notificationclick', (e)=>{
  e.notification.close();
  e.waitUntil(clients.openWindow('https://smpnegeri1brondong.github.io/absen-smpn1brondong/halaman-absen.html'));
});
