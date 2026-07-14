/**
 * 3K SMART AI — CODE.GS LENGKAP
 * Padam semua kod lama dalam Apps Script, kemudian tampal keseluruhan fail ini.
 * Spreadsheet: Unit 3K SMK Taman Jasmin 2
 */

const CONFIG_3K = {
  SPREADSHEET_ID: '1Yz78l8Q95_JfvrDtra_NXrEzR8UHyftn7RXo7OaO1sU',
  SHEET_INPUT: 'Input Markah',
  SHEET_KELAS: 'Data Kelas',
  BULAN: ['JANUARI','FEBRUARI','MAC','APRIL','MEI','JUN','JULAI','OGOS','SEPTEMBER','OKTOBER','NOVEMBER','DISEMBER']
};

function doGet(e) {
  try {
    const action = String(e && e.parameter && e.parameter.action || 'dashboard');
    if (action === 'dashboard') {
      const dashboard = getDashboard3K_();
      dashboard.success = true;
      return output3K_(dashboard);
    }
    if (action === 'save') {
      const data = JSON.parse(e && e.parameter && e.parameter.data || '{}');
      const result = simpanPenilaian3K_(data);
      updateRankingBulanan();
      return output3K_({success:true, message:'Penilaian berjaya disimpan', result});
    }
    if (action === 'updateRanking') {
      updateRankingBulanan();
      return output3K_({success:true, message:'Semua ranking bulanan berjaya dikemas kini'});
    }
    if (action === 'checkDuplicate') {
      return output3K_({success:true, duplicate:semakDuplikasi3K_(e.parameter.kelas, e.parameter.tarikh)});
    }
    return output3K_({success:false, message:'Tindakan tidak dikenali: '+action});
  } catch (err) {
    return output3K_({success:false, message:String(err && err.message || err)});
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e && e.postData && e.postData.contents || '{}');
    if (body.action === 'save') {
      const result = simpanPenilaian3K_(body.data || {});
      updateRankingBulanan();
      return output3K_({success:true, message:'Penilaian berjaya disimpan', result});
    }
    return output3K_({success:false, message:'Tindakan POST tidak dikenali'});
  } catch (err) {
    return output3K_({success:false, message:String(err && err.message || err)});
  }
}

function output3K_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function ss3K_() {
  return SpreadsheetApp.openById(CONFIG_3K.SPREADSHEET_ID);
}

function getDashboard3K_() {
  const ss = ss3K_();
  const input = ss.getSheetByName(CONFIG_3K.SHEET_INPUT);
  if (!input) throw new Error("Sheet 'Input Markah' tidak dijumpai");

  const raw = input.getDataRange().getValues();
  const headers = raw.shift().map(String);
  const idx = index3K_(headers);
  const grouped = {};

  raw.forEach(row => {
    const bulanKey = normalBulan3K_(row[idx.bulan]);
    const markah = Number(row[idx.markah]);
    const kelas = namaKelas3K_(row[idx.tingkatan], row[idx.kelas]);
    if (!bulanKey || !kelas || !Number.isFinite(markah)) return;
    if (!grouped[bulanKey]) grouped[bulanKey] = {};
    if (!grouped[bulanKey][kelas]) grouped[bulanKey][kelas] = {name:kelas, total:0, records:0};
    grouped[bulanKey][kelas].total += markah;
    grouped[bulanKey][kelas].records++;
  });

  const monthlyData = {};
  Object.keys(grouped).forEach(bulan => {
    monthlyData[formatBulan3K_(bulan)] = Object.values(grouped[bulan])
      .map(x => ({name:x.name, score:Number((x.total/x.records).toFixed(2)), records:x.records}))
      .sort((a,b) => b.score-a.score);
  });

  const classes = senaraiKelas3K_();
  const today = new Date();
  const currentWeek = minggu3K_(today);
  const currentYear = today.getFullYear();
  const assessed = new Set();

  raw.forEach(row => {
    const tarikh = date3K_(row[idx.tarikh]);
    if (!tarikh || tarikh.getFullYear() !== currentYear || Number(row[idx.minggu]) !== currentWeek) return;
    assessed.add(namaKelas3K_(row[idx.tingkatan], row[idx.kelas]).toUpperCase());
  });

  const missingClasses = classes.filter(k => !assessed.has(k.toUpperCase()));
  return {monthlyData, classes, missingClasses, currentWeek, serverTime:today.toISOString()};
}

function simpanPenilaian3K_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = ss3K_();
    const input = ss.getSheetByName(CONFIG_3K.SHEET_INPUT);
    if (!input) throw new Error("Sheet 'Input Markah' tidak dijumpai");

    const tarikh = date3K_(data.tarikh);
    if (!tarikh) throw new Error('Sila pilih tarikh yang sah');
    const fullClass = String(data.kelas || '').trim();
    if (!fullClass) throw new Error('Sila pilih kelas');

    const parsed = pecahKelas3K_(fullClass);
    const minggu = minggu3K_(tarikh);
    if (semakDuplikasi3K_(fullClass, tarikh)) {
      throw new Error(`${fullClass} sudah dinilai pada minggu ${minggu}. Rekod kedua tidak dibenarkan.`);
    }

    const marks = [];
    for (let n=1; n<=9; n++) {
      const value = Number(data['k'+n] == null ? 0 : data['k'+n]);
      const max = n===9 ? 10 : 5;
      if (!Number.isFinite(value) || value<0 || value>max) {
        throw new Error(`Markah kriteria ${n} mestilah antara 0 hingga ${max}`);
      }
      marks.push(value);
    }
    const total = marks.reduce((a,b)=>a+b,0);
    if (total>50) throw new Error('Jumlah markah tidak boleh melebihi 50');

    const row = input.getLastRow()+1;
    const bulan = formatBulan3K_(CONFIG_3K.BULAN[tarikh.getMonth()]);
    const blok = cariBlok3K_(parsed.tingkatan, parsed.kelas);
    const id = Utilities.getUuid().slice(0,8);

    // A:P sahaja. Q ialah formula Jumlah_Markah sedia ada dan tidak disentuh.
    const rowData = [id, tarikh, minggu, bulan, blok, parsed.tingkatan, parsed.kelas].concat(marks);
    input.getRange(row,1,1,16).setValues([rowData]);
    // Catatan di S. R dikhaskan untuk Gambar_Bukti.
    input.getRange(row,19).setValue(String(data.catatan || ''));
    SpreadsheetApp.flush();

    return {id, kelas:fullClass, minggu, bulan, jumlah:total};
  } finally {
    lock.releaseLock();
  }
}

function semakDuplikasi3K_(fullClass, tarikhValue) {
  const tarikh = date3K_(tarikhValue);
  if (!tarikh) return false;
  const parsed = pecahKelas3K_(String(fullClass || '').trim());
  const minggu = minggu3K_(tarikh);
  const tahun = tarikh.getFullYear();
  const input = ss3K_().getSheetByName(CONFIG_3K.SHEET_INPUT);
  if (!input || input.getLastRow()<2) return false;
  const data = input.getDataRange().getValues();
  const headers = data.shift().map(String);
  const idx = index3K_(headers);
  return data.some(row => {
    const rowDate = date3K_(row[idx.tarikh]);
    return rowDate && rowDate.getFullYear()===tahun && Number(row[idx.minggu])===minggu &&
      String(row[idx.tingkatan]).trim().toUpperCase()===parsed.tingkatan.toUpperCase() &&
      String(row[idx.kelas]).trim().toUpperCase()===parsed.kelas.toUpperCase();
  });
}

function updateRankingBulanan() {
  const ss = ss3K_();
  const source = ss.getSheetByName(CONFIG_3K.SHEET_INPUT);
  if (!source) throw new Error("Sheet 'Input Markah' tidak dijumpai");
  const data = source.getDataRange().getValues();
  const headers = data.shift().map(String);
  const idx = index3K_(headers);

  CONFIG_3K.BULAN.forEach(bulan => {
    const result = {};
    data.forEach(row => {
      if (normalBulan3K_(row[idx.bulan])!==bulan) return;
      const kelas = namaKelas3K_(row[idx.tingkatan],row[idx.kelas]);
      const markah = Number(row[idx.markah]);
      if (!kelas || !Number.isFinite(markah)) return;
      if (!result[kelas]) result[kelas] = {kelas:kelas, jumlah:0, bil:0};
      result[kelas].jumlah += markah;
      result[kelas].bil++;
    });
    const output = Object.values(result)
      .map(x => [x.kelas,x.jumlah,x.bil,Number((x.jumlah/x.bil).toFixed(2))])
      .sort((a,b)=>b[3]-a[3]);
    const finalOutput = [['Rank','Kelas','Jumlah Markah','Bil Rekod','Purata']];
    output.forEach((x,i)=>finalOutput.push([i+1].concat(x)));
    const sheetName = 'bulan '+bulan.toLowerCase();
    const target = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    target.clearContents();
    target.getRange(1,1,finalOutput.length,5).setValues(finalOutput);
    target.autoResizeColumns(1,5);
  });
  return 'Ranking 12 bulan berjaya dikemas kini';
}

function senaraiKelas3K_() {
  const sh = ss3K_().getSheetByName(CONFIG_3K.SHEET_KELAS);
  if (!sh || sh.getLastRow()<2) return [];
  return sh.getRange(2,2,sh.getLastRow()-1,2).getDisplayValues()
    .map(r=>namaKelas3K_(r[0],r[1])).filter(Boolean);
}

function cariBlok3K_(tingkatan, kelas) {
  const sh = ss3K_().getSheetByName(CONFIG_3K.SHEET_KELAS);
  if (!sh || sh.getLastRow()<2) return '';
  const rows = sh.getRange(2,2,sh.getLastRow()-1,3).getDisplayValues();
  const found = rows.find(r=>String(r[0]).trim().toUpperCase()===tingkatan.toUpperCase() && String(r[1]).trim().toUpperCase()===kelas.toUpperCase());
  return found ? found[2] : '';
}

function index3K_(h) {
  const get = name => { const i=h.indexOf(name); if(i<0) throw new Error(`Lajur '${name}' tidak dijumpai`); return i; };
  return {tarikh:get('Tarikh'),minggu:get('Minggu'),bulan:get('Bulan'),tingkatan:get('Tingkatan'),kelas:get('Kelas'),markah:get('Jumlah_Markah')};
}

function pecahKelas3K_(full) {
  const parts = full.trim().split(/\s+/);
  if (parts[0].toUpperCase()==='PERALIHAN') return {tingkatan:'PERALIHAN',kelas:parts.slice(1).join(' ')};
  return {tingkatan:parts.shift(),kelas:parts.join(' ')};
}

function namaKelas3K_(tingkatan, kelas) {
  const t=String(tingkatan == null ? '' : tingkatan).trim(), k=String(kelas == null ? '' : kelas).trim();
  return t&&k ? `${t.toUpperCase()==='PERALIHAN'?'PERALIHAN':t} ${k}`.trim() : '';
}

function normalBulan3K_(value) {
  const s=String(value == null ? '' : value).trim().toUpperCase();
  return CONFIG_3K.BULAN.includes(s) ? s : '';
}

function formatBulan3K_(value) {
  const s=String(value == null ? '' : value).toLowerCase();
  return s ? s.charAt(0).toUpperCase()+s.slice(1) : '';
}

function date3K_(value) {
  if (value instanceof Date && !isNaN(value)) return value;
  if (!value) return null;
  const d=new Date(value);
  return isNaN(d) ? null : d;
}

function minggu3K_(date) {
  const start=new Date(date.getFullYear(),0,1);
  return Math.ceil((((date-start)/86400000)+start.getDay()+1)/7);
}

// Jalankan fungsi ini sekali untuk menguji sambungan tanpa mengubah data.
function testSambungan3K() {
  const result=getDashboard3K_();
  Logger.log(JSON.stringify({kelas:result.classes.length,minggu:result.currentWeek,belumDinilai:result.missingClasses.length}));
  return 'Sambungan berjaya';
}
