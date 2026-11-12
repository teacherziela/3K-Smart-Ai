function adiwiraAwardData(sourceData){
  const byClass={};
  Object.entries(sourceData||{}).forEach(([bulan,list])=>{
    if(String(bulan).trim().toUpperCase()==='OKTOBER')return;
    const juara=Array.isArray(list)?list[0]:null;
    if(!juara||!juara.name)return;
    const key=String(juara.name).trim().toUpperCase();
    if(!byClass[key])byClass[key]={name:juara.name,wins:[],total:0};
    const score=Number(juara.score)||0;
    byClass[key].wins.push({bulan,score,records:Number(juara.records)||0});
    byClass[key].total+=score;
  });
  return Object.values(byClass).map(x=>({...x,average:x.wins.length?x.total/x.wins.length:0}))
    .sort((a,b)=>b.wins.length-a.wins.length||b.average-a.average||a.name.localeCompare(b.name,'ms'))[0]||null;
}

async function generateSpecialAdiwiraReport(){
  const w=window.open('','_blank');
  if(!w){toast('Benarkan pop-up untuk menjana laporan');return;}
  w.document.write('<title>Menyemak data…</title><p style="font:18px Arial;padding:30px">Sedang menyemak juara setiap bulan daripada Google Sheet…</p>');
  let live;
  try{
    live=await api({action:'dashboard',_t:Date.now()});
  }catch(error){
    w.document.body.innerHTML=`<p style="font:18px Arial;padding:30px;color:#a11"><b>Laporan tidak dijana.</b><br>Data Google Sheet tidak dapat disemak: ${esc(error.message)}</p>`;
    return;
  }
  const liveMonthly=live.monthlyData||{};
  const liveGallery=live.gallery||[];
  const winner=adiwiraAwardData(liveMonthly);
  if(!winner){w.document.body.innerHTML='<p style="font:18px Arial;padding:30px">Belum ada rekod juara untuk Anugerah Khas Adiwira.</p>';return;}
  const winMonths=new Set(winner.wins.map(x=>String(x.bulan).toUpperCase()));
  const photos=liveGallery.filter(x=>String(x.kelas||'').trim().toUpperCase()===String(winner.name).trim().toUpperCase())
    .filter(x=>!x.bulan||winMonths.has(String(x.bulan).toUpperCase())).slice(0,4);
  const photoHtml=photos.length?photos.map((x,i)=>{const src=driveImageUrl(x.url||x.image);return `<figure><img src="${esc(src)}" alt="Gambar ${esc(winner.name)}"><figcaption>Bukti ${i+1}${x.minggu?` • Minggu ${esc(x.minggu)}`:''}${x.tarikh?` • ${esc(x.tarikh)}`:''}</figcaption></figure>`}).join(''):`<div class="empty-photo">📷<br><small>Tiada gambar bukti yang tersedia</small></div>`;
  const rows=winner.wins.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.bulan)}</td><td><b>${x.score.toFixed(2)} / 50</b></td><td>${x.records||'-'}</td></tr>`).join('');
  const date=new Intl.DateTimeFormat('ms-MY',{dateStyle:'long'}).format(new Date());
  const logo=`${location.origin}${location.pathname.replace(/[^/]*$/,'')}assets/logo-smktj2.jpg`;
  const report=`<!doctype html><html lang="ms"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anugerah Khas Adiwira 2026</title><style>
  @page{size:A4 portrait;margin:7mm}*{box-sizing:border-box}body{margin:0;background:#eaf5f1;color:#173545;font-family:Arial,sans-serif;font-size:11px}.page{width:100%;min-height:283mm;margin:auto;padding:9mm;border:3px solid #0d8b69;background:linear-gradient(145deg,#fffdf5,#edf9f4);position:relative;overflow:hidden}.page:before{content:'★';position:absolute;right:-18px;top:-48px;font-size:190px;color:#0d8b6910}.head{display:grid;grid-template-columns:72px 1fr 94px;gap:14px;align-items:center;border-bottom:4px solid #0d8b69;padding-bottom:10px}.head img{width:68px;height:74px;object-fit:contain}.head h1{font-size:25px;margin:0;color:#113d59}.head h2{font-size:18px;margin:4px 0;color:#b87b08}.head p{margin:0;color:#5f7480}.badge{padding:12px 7px;border-radius:12px;text-align:center;background:#113d59;color:white}.badge b{display:block;font-size:25px;color:#ffd15c}.hero{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0}.hero div{padding:10px;border-radius:10px;border:1px solid #b7dccf;background:white}.hero small{display:block;color:#71828b}.hero strong{display:block;margin-top:4px;font-size:16px;color:#087d5b}.award{text-align:center;padding:12px;border-radius:12px;background:linear-gradient(100deg,#fff1bd,#fffaf0);border:2px solid #deb247}.award small{letter-spacing:.15em;color:#7b6329;font-weight:bold}.award h3{font-size:29px;margin:4px 0;color:#113d59}.award p{margin:0;color:#755b18}.photos{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:11px 0}.photos figure{margin:0;border:1px solid #b9ced5;border-radius:10px;overflow:hidden;background:white}.photos img{display:block;width:100%;height:125px;object-fit:cover}.photos figcaption{padding:6px 8px;color:#61747e;font-size:9px}.empty-photo{grid-column:1/-1;height:125px;display:grid;place-content:center;text-align:center;border:1px dashed #9db6bf;border-radius:10px;color:#78909a;font-size:30px}.record{display:grid;grid-template-columns:1.1fr .9fr;gap:10px}.box{padding:10px;border:1px solid #b9d2d9;border-radius:10px;background:white}.box h4{margin:0 0 7px;color:#113d59;font-size:13px}table{width:100%;border-collapse:collapse}th{background:#113d59;color:white}th,td{padding:7px;border:1px solid #c7d7dc;text-align:left}.reason{line-height:1.55}.reason b{color:#087d5b}.sign{display:grid;grid-template-columns:1fr 1fr;gap:85px;margin:31px 26px 0}.sign div{border-top:1px solid #536572;text-align:center;padding-top:6px}.foot{text-align:center;margin-top:11px;padding-top:6px;border-top:1px solid #bfd0d5;color:#71818a;font-size:9px}@media print{body{background:white}.page{border-color:#0d8b69}}
  </style></head><body><main class="page"><header class="head"><img src="${logo}" alt="Logo sekolah"><div><h1>LAPORAN ANUGERAH KHAS ADIWIRA</h1><h2>LIGA ADIWIRA CERIA 2026</h2><p>Tempoh penilaian Februari–September 2026 • Unit 3K</p></div><div class="badge">ANUGERAH<b>KHAS</b>2026</div></header><section class="hero"><div><small>Sekolah</small><strong>SMK Taman Jasmin 2</strong></div><div><small>Jumlah Kemenangan</small><strong>${winner.wins.length} kali</strong></div><div><small>Purata Markah Menang</small><strong>${winner.average.toFixed(2)} / 50</strong></div></section><section class="award"><small>PENERIMA ANUGERAH KHAS ADIWIRA</small><h3>🏆 ${esc(winner.name)}</h3><p>Kelas paling konsisten meraih kemenangan sepanjang tempoh penilaian rasmi.</p></section><section class="photos">${photoHtml}</section><section class="record"><div class="box"><h4>📊 Rekod Kemenangan</h4><table><thead><tr><th>Bil.</th><th>Bulan</th><th>Markah</th><th>Rekod</th></tr></thead><tbody>${rows}</tbody></table></div><div class="box reason"><h4>⭐ Justifikasi Anugerah</h4><p><b>${esc(winner.name)}</b> dipilih sebagai penerima Anugerah Khas Adiwira kerana mencatat jumlah kemenangan tertinggi, iaitu <b>${winner.wins.length} kali</b>, dengan purata markah kemenangan <b>${winner.average.toFixed(2)} daripada 50</b>.</p><p>Pencapaian ini mencerminkan komitmen, kerjasama dan konsistensi murid dalam memastikan kelas sentiasa bersih, ceria, selamat serta kondusif.</p></div></section><div class="sign"><div>Disediakan oleh<br><b>Unit 3K</b></div><div>Disahkan oleh<br><b>Pentadbir Sekolah</b></div></div><div class="foot">Dijana pada ${esc(date)} melalui Sistem 3K SMART AI • Penilaian Februari–September 2026</div></main><script>window.onload=()=>setTimeout(()=>window.print(),900)<\/script></body></html>`;
  w.document.open();w.document.write(report);w.document.close();
}
