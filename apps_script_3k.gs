/* 3K SMART AI — TAMPAL KE EXTENSIONS > APPS SCRIPT
   Kod ranking lama boleh dikekalkan. Tambah semua fungsi ini di bawahnya.
*/

function doGet(e) {
  try {
    var action = String((e && e.parameter && e.parameter.action) || "dashboard");
    if (action === "dashboard") return json3K_({ success:true, ...getDashboard3K_() });
    if (action === "save") {
      var data = JSON.parse(e.parameter.data || "{}");
      simpanPenilaian3K_(data);
      updateRankingBulanan();
      return json3K_({ success:true, message:"Penilaian berjaya disimpan" });
    }
    if (action === "updateRanking") {
      updateRankingBulanan();
      return json3K_({ success:true, message:"Ranking berjaya dikemas kini" });
    }
    return json3K_({ success:false, message:"Tindakan tidak dikenali" });
  } catch (err) {
    return json3K_({ success:false, message:String(err.message || err) });
  }
}

function json3K_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getDashboard3K_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var source = ss.getSheetByName("Input Markah");
  var classSheet = ss.getSheetByName("Data Kelas");
  if (!source) throw new Error("Sheet Input Markah tidak dijumpai");
  var values = source.getDataRange().getDisplayValues();
  var h = values.shift();
  var cBulan=h.indexOf("Bulan"), cT=h.indexOf("Tingkatan"), cK=h.indexOf("Kelas"), cM=h.indexOf("Jumlah_Markah");
  var names={JANUARI:"Januari",FEBRUARI:"Februari",MAC:"Mac",APRIL:"April",MEI:"Mei",JUN:"Jun",JULAI:"Julai",OGOS:"Ogos",SEPTEMBER:"September",OKTOBER:"Oktober",NOVEMBER:"November",DISEMBER:"Disember"};
  var grouped={};
  values.forEach(function(r){
    var b=String(r[cBulan]||"").trim().toUpperCase(), m=Number(r[cM]);
    if(!names[b]||!r[cK]||isNaN(m)) return;
    var kelas=String(r[cT]).toUpperCase()==="PERALIHAN"?"PERALIHAN "+r[cK]:r[cT]+" "+r[cK];
    grouped[names[b]]=grouped[names[b]]||{};
    grouped[names[b]][kelas]=grouped[names[b]][kelas]||{name:kelas,total:0,records:0};
    grouped[names[b]][kelas].total+=m; grouped[names[b]][kelas].records++;
  });
  var monthlyData={};
  Object.keys(grouped).forEach(function(b){monthlyData[b]=Object.values(grouped[b]).map(function(x){return {name:x.name,score:Number((x.total/x.records).toFixed(2)),records:x.records};}).sort(function(a,z){return z.score-a.score;});});
  var classes=[];
  if(classSheet&&classSheet.getLastRow()>1){classes=classSheet.getRange(2,2,classSheet.getLastRow()-1,2).getDisplayValues().map(function(r){return String(r[0]).toUpperCase()==="PERALIHAN"?"PERALIHAN "+r[1]:r[0]+" "+r[1];});}
  return {monthlyData:monthlyData,classes:classes};
}

function simpanPenilaian3K_(d) {
  var ss=SpreadsheetApp.getActiveSpreadsheet(), sh=ss.getSheetByName("Input Markah");
  if(!sh) throw new Error("Sheet Input Markah tidak dijumpai");
  var parts=String(d.kelas||"").split(" "), tingkatan=parts.shift(), kelas=parts.join(" ");
  var tarikh=d.tarikh?new Date(d.tarikh):new Date();
  var bulan=["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"][tarikh.getMonth()];
  var minggu=Math.ceil((((tarikh-new Date(tarikh.getFullYear(),0,1))/86400000)+new Date(tarikh.getFullYear(),0,1).getDay()+1)/7);
  var blok="";
  var dataKelas=ss.getSheetByName("Data Kelas");
  if(dataKelas){var rows=dataKelas.getDataRange().getDisplayValues();for(var i=1;i<rows.length;i++){if(String(rows[i][1])===tingkatan&&String(rows[i][2]).trim()===kelas.trim()){blok=rows[i][3];break;}}}
  var id=Utilities.getUuid().slice(0,8);
  sh.appendRow([id,tarikh,minggu,bulan,blok,tingkatan,kelas,Number(d.k1)||0,Number(d.k2)||0,Number(d.k3)||0,Number(d.k4)||0,Number(d.k5)||0,Number(d.k6)||0,Number(d.k7)||0,Number(d.k8)||0,Number(d.k9)||0,"","",d.catatan||""]);
}

/* KEKALKAN FUNGSI updateRankingBulanan() LAMA ATEH DI DALAM PROJEK YANG SAMA. */
