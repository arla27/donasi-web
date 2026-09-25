const SHEET_NAME = 'KAS_DKM';
const CACHE_SECONDS = 30;

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'dashboard';
    if (action === 'dashboard') return json_(dashboard_());
    if (action === 'transaksi') return json_(transaksi_(e.parameter));
    return json_({success:false,message:'Action tidak dikenal'});
  } catch (err) {
    return json_({success:false,message:String(err)});
  }
}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
function rows_(){
  const cache=CacheService.getScriptCache(), key='dkm_rows_v2'; const hit=cache.get(key); if(hit) return JSON.parse(hit);
  const sh=SpreadsheetApp.getActive().getSheetByName(SHEET_NAME); if(!sh) throw new Error('Sheet '+SHEET_NAME+' tidak ditemukan');
  const v=sh.getDataRange().getValues(); if(v.length<2) return [];
  const out=[];
  for(let i=1;i<v.length;i++){
    const r=v[i]; if(!r[1] && !r[2] && !r[5]) continue;
    out.push({no:r[0]||i,tanggal:date_(r[1]),jenis:String(r[2]||'').trim().toUpperCase(),kategori:String(r[3]||'').trim().toUpperCase()||'LAINNYA',keterangan:String(r[4]||'').trim(),nominal:Number(r[5])||0,petugas:String(r[6]||'').trim()});
  }
  out.sort((a,b)=>String(b.tanggal).localeCompare(String(a.tanggal)) || Number(b.no)-Number(a.no));
  cache.put(key,JSON.stringify(out),CACHE_SECONDS); return out;
}
function date_(v){if(Object.prototype.toString.call(v)==='[object Date]'&&!isNaN(v))return Utilities.formatDate(v,Session.getScriptTimeZone(),'yyyy-MM-dd'); const d=new Date(v); return isNaN(d)?String(v||''):Utilities.formatDate(d,Session.getScriptTimeZone(),'yyyy-MM-dd');}
function dashboard_(){const d=rows_();let masuk=0,keluar=0;const im={},ik={};for(const x of d){if(x.jenis==='MASUK'){masuk+=x.nominal;const k=x.kategori;im[k]??={kategori:k,transaksi:0,jumlah:0};im[k].transaksi++;im[k].jumlah+=x.nominal}else if(x.jenis==='KELUAR'){keluar+=x.nominal;const k=x.kategori;ik[k]??={kategori:k,transaksi:0,jumlah:0};ik[k].transaksi++;ik[k].jumlah+=x.nominal}}const sort=o=>Object.values(o).sort((a,b)=>b.jumlah-a.jumlah);return {success:true,saldo:masuk-keluar,totalMasuk:masuk,totalKeluar:keluar,kategoriMasuk:sort(im),kategoriKeluar:sort(ik),transaksiTerakhir:d.slice(0,20)};}
function transaksi_(p){let d=rows_();const jenis=String(p.jenis||'').toUpperCase(),kat=String(p.kategori||'').toUpperCase(),mulai=String(p.mulai||''),akhir=String(p.akhir||'');d=d.filter(x=>(!jenis||x.jenis===jenis)&&(!kat||x.kategori.includes(kat))&&(!mulai||x.tanggal>=mulai)&&(!akhir||x.tanggal<=akhir));let masuk=0,keluar=0;d.forEach(x=>x.jenis==='MASUK'?masuk+=x.nominal:keluar+=x.nominal);const page=Math.max(1,Number(p.page)||1),limit=Math.min(100,Math.max(1,Number(p.limit)||20)),total=d.length,totalPages=Math.max(1,Math.ceil(total/limit));return {success:true,data:d.slice((page-1)*limit,page*limit),page,limit,total,totalPages,totalMasuk:masuk,totalKeluar:keluar};}
function clearCache(){CacheService.getScriptCache().remove('dkm_rows_v2');}
function onEdit(){clearCache();}
