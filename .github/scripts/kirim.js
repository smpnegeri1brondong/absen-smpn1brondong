const admin=require('firebase-admin');
const sa=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({credential: admin.credential.cert(sa)});
const db=admin.firestore();
const messaging=admin.messaging();
async function main(){
  const now=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Jakarta'}));
  const hh=String(now.getHours()).padStart(2,'0');
  const mm=String(now.getMinutes()).padStart(2,'0');
  const cur=hh+':'+mm;
  const day=now.getDay();
  if(day===0||day===6) return console.log('Libur');
  const todayStr=now.toISOString().slice(0,10);
  const settingsDoc=await db.collection('settings').doc('notifikasi').get();
  const s=settingsDoc.exists?settingsDoc.data():{};
  if(s.enabled===false) return console.log('Notif dimatikan');
  const jamKhususDoc=await db.collection('jam_khusus').doc(todayStr).get();
  const jamKhusus=jamKhususDoc.exists?jamKhususDoc.data():null;
  const tokensSnap=await db.collection('fcm_tokens').get();
  const tokens=[]; tokensSnap.forEach(d=>{ if(d.data().token) tokens.push(d.data().token); });
  if(tokens.length===0) return console.log('No tokens');
  function inWindow(jamStr){
    if(!jamStr) return false;
    const [sh, sm] = jamStr.split(':').map(Number);
    const scheduled = sh*60+sm;
    const curMin = now.getHours()*60+now.getMinutes();
    const diff = curMin - scheduled;
    return diff>=0 && diff<5;
  }
  let title='', body='';
  if(inWindow(s.masukJam||'07:00') && s.masukEnabled!==false){ title='SNEB.in - Absen Masuk'; body='⚠ Silahkan Absen Masuk. Klik untuk absen sekarang.'; }
  else {
    let pulangJam = day===5 ? (s.pulangJumatJam||'10:30') : (s.pulangSeninKamisJam||'13:55');
    if(jamKhusus && (jamKhusus.pulang || jamKhusus.pulang_cepat)) pulangJam = jamKhusus.pulang || pulangJam;
    if(s.pulangCepatAktif && s.pulangCepatTanggal===todayStr && s.pulangCepatJam) pulangJam=s.pulangCepatJam;
    if(inWindow(pulangJam) && s.pulangEnabled!==false){ title='SNEB.in - Absen Pulang'; body='⚠ Silahkan Absen Pulang. Klik untuk absen sekarang.'; }
  }
  if(!title) return console.log('Bukan jam notif', cur);
  const res=await messaging.sendEachForMulticast({notification:{title, body}, data:{buka:'https://smpnegeri1brondong.github.io/absen-smpn1brondong/halaman-absen.html'}, tokens});
  console.log('Kirim', res.successCount+'/'+tokens.length, title);
}
main().catch(e=>{console.error(e); process.exit(1);});
