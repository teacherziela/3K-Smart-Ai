window.generateMonthlyOpr = function () {
  const winners = current().slice(0, 3);
  const selectedMonth = month.value;

  if (winners.length < 3) {
    toast('Belum cukup tiga pemenang untuk bulan ini');
    return;
  }

  const reportWindow = window.open('', '_blank');
  if (!reportWindow) {
    toast('Benarkan pop-up untuk menjana OPR');
    return;
  }

  const positions = ['JUARA', 'NAIB JUARA', 'TEMPAT KETIGA'];
  const medals = ['🥇', '🥈', '🥉'];
  const winnerCards = winners.map((winner, index) => {
    const proof = gallery.find(item =>
      String(item.kelas || '').trim().toUpperCase() ===
      String(winner.name || '').trim().toUpperCase()
    );
    const image = proof ? driveImageUrl(proof.url) : '';
    const photo = image
      ? `<img src="${esc(image)}" alt="Gambar ${esc(winner.name)}">`
      : `<div class="no-photo">📷<small>Tiada gambar bukti</small></div>`;

    return `
      <article class="winner winner-${index + 1}">
        <div class="photo">
          ${photo}
          <span>${medals[index]} ${positions[index]}</span>
        </div>
        <div class="winner-info">
          <h2>${esc(winner.name)}</h2>
          <strong>${Number(winner.score).toFixed(2)} / 50</strong>
          <p>${Number(winner.records || 0)} rekod penilaian${
            proof?.minggu ? ` • Gambar Minggu ${esc(proof.minggu)}` : ''
          }</p>
        </div>
      </article>`;
  }).join('');

  const reportDate = new Intl.DateTimeFormat('ms-MY', {
    dateStyle: 'long'
  }).format(new Date());
  const logoUrl =
    location.origin +
    location.pathname.replace(/[^/]*$/, '') +
    'assets/logo-smktj2.jpg';

  const report = `<!doctype html>
  <html lang="ms">
  <head>
    <meta charset="utf-8">
    <title>OPR Juara 3K ${esc(selectedMonth)} 2026</title>
    <style>
      @page{size:A4 portrait;margin:7mm}
      *{box-sizing:border-box}
      body{margin:0;font-family:Arial,sans-serif;color:#102d3e;background:#ece7d8;font-size:10.5px}
      .page{width:100%;min-height:283mm;padding:8mm;border:2px solid #123b57;border-radius:12px;background:linear-gradient(135deg,#fffdf6,#edf9f5)}
      header{display:grid;grid-template-columns:72px 1fr 92px;align-items:center;gap:12px;border-bottom:4px solid #11a878;padding-bottom:8px}
      header img{width:68px;height:76px;object-fit:contain}
      header h1{margin:0;color:#113653;font-size:24px}
      header h2{margin:3px 0;color:#d83c27;font-size:17px}
      header p{margin:0;color:#657883}
      .month{padding:11px;border-radius:12px;background:#113653;color:white;text-align:center}
      .month b{display:block;margin-top:3px;color:#48e1ae;font-size:20px}
      .info{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:9px 0}
      .info div{padding:8px;border:1px solid #b8ddd0;border-radius:9px;background:white}
      .info small{display:block;color:#687c85}
      .info b{display:block;margin-top:3px;color:#087d5b;font-size:12px}
      .winners{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .winner{overflow:hidden;border:1px solid #b6cbd4;border-radius:11px;background:white}
      .winner-1{border:3px solid #e2aa29}
      .photo{position:relative;height:150px;background:#e5edf0;overflow:hidden}
      .photo img{width:100%;height:100%;object-fit:cover}
      .photo>span{position:absolute;left:6px;bottom:6px;padding:5px 8px;border-radius:999px;background:#113653;color:white;font-size:9px;font-weight:bold}
      .no-photo{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:#768891;font-size:29px}
      .no-photo small{font-size:10px}
      .winner-info{padding:8px}
      .winner-info h2{margin:0;color:#113653;font-size:16px}
      .winner-info strong{display:block;margin-top:3px;color:#d98c08;font-size:18px}
      .winner-info p{margin:4px 0 0;color:#6a7b84}
      .content{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}
      .box{padding:8px;border:1px solid #b8d4de;border-radius:9px;background:white}
      .box h3{margin:0 0 5px;color:#113653;font-size:12px}
      .box ul{margin:0;padding-left:16px;line-height:1.4}
      .summary{margin-top:7px;padding:9px;border-left:5px solid #12a879;border-radius:8px;background:#e8f7f2;line-height:1.42}
      .sign{display:grid;grid-template-columns:1fr 1fr;gap:80px;margin:24px 25px 0}
      .sign div{border-top:1px solid #536572;padding-top:5px;text-align:center}
      footer{margin-top:8px;padding-top:6px;border-top:1px solid #b7c8ce;color:#70818a;text-align:center;font-size:9px}
      @media print{body{background:white}.page{border-color:#123b57}}
    </style>
  </head>
  <body>
    <main class="page">
      <header>
        <img src="${esc(logoUrl)}" alt="Logo sekolah">
        <div>
          <h1>LAPORAN ONE PAGE REPORT (OPR)</h1>
          <h2>JUARA BULANAN LIGA ADIWIRA CERIA 2026</h2>
          <p>Program Pemantauan Kebersihan, Kesihatan dan Keselamatan (3K)</p>
        </div>
        <div class="month">BULAN<b>${esc(selectedMonth).toUpperCase()}</b></div>
      </header>

      <section class="info">
        <div><small>Sekolah</small><b>SMK Taman Jasmin 2</b></div>
        <div><small>Bidang</small><b>Hal Ehwal Murid – Unit 3K</b></div>
        <div><small>Kaedah</small><b>Penilaian Mingguan Kelas</b></div>
      </section>

      <section class="winners">${winnerCards}</section>

      <section class="content">
        <div class="box">
          <h3>🎯 OBJEKTIF PROGRAM</h3>
          <ul>
            <li>Membudayakan kebersihan, keceriaan dan keselamatan kelas.</li>
            <li>Meningkatkan kerjasama serta tanggungjawab murid.</li>
            <li>Memberikan pengiktirafan kepada kelas terbaik.</li>
          </ul>
        </div>
        <div class="box">
          <h3>📊 KAEDAH PENILAIAN</h3>
          <ul>
            <li>Penilaian dilaksanakan oleh guru bertugas setiap minggu.</li>
            <li>Sembilan kriteria dinilai dengan jumlah maksimum 50 markah.</li>
            <li>Kedudukan berdasarkan purata bulanan.</li>
          </ul>
        </div>
        <div class="box">
          <h3>⭐ KEKUATAN PROGRAM</h3>
          <ul>
            <li>Rekod dan gambar bukti disimpan secara digital.</li>
            <li>Persaingan sihat meningkatkan motivasi kelas.</li>
            <li>Prestasi boleh dibandingkan mengikut minggu dan bulan.</li>
          </ul>
        </div>
        <div class="box">
          <h3>💡 CADANGAN PENAMBAHBAIKAN</h3>
          <ul>
            <li>Teruskan pemantauan konsisten setiap minggu.</li>
            <li>Bimbing kelas yang belum mencapai tahap memuaskan.</li>
            <li>Kongsi amalan terbaik kelas pemenang kepada kelas lain.</li>
          </ul>
        </div>
      </section>

      <div class="summary">
        <b>RUMUSAN:</b> Tahniah kepada <b>${esc(winners[0].name)}</b> sebagai
        Juara Liga Adiwira Ceria bulan ${esc(selectedMonth)} dengan purata
        <b>${Number(winners[0].score).toFixed(2)}/50</b>. Pengiktirafan turut
        diberikan kepada ${esc(winners[1].name)} dan ${esc(winners[2].name)}.
        Program ini menggalakkan budaya kelas yang bersih, ceria, selamat dan kondusif.
      </div>

      <div class="sign">
        <div>Disediakan oleh<br><b>Unit 3K</b></div>
        <div>Disahkan oleh<br><b>Pentadbir Sekolah</b></div>
      </div>
      <footer>Dijana pada ${esc(reportDate)} melalui Sistem 3K SMART AI • Liga Adiwira Ceria 2026</footer>
    </main>
    <script>window.onload=()=>setTimeout(()=>window.print(),1000)<\/script>
  </body>
  </html>`;

  reportWindow.document.open();
  reportWindow.document.write(report);
  reportWindow.document.close();
};
