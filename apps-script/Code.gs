const SHEET_NAME = 'KAS_DKM';
const CACHE_SECONDS = 30;
const CACHE_KEY = 'dkm_rows_v4';

function doGet(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    const action = String(p.action || 'dashboard').toLowerCase();

    if (action === 'dashboard') return json_(dashboard_());
    if (action === 'transaksi') return json_(transaksi_(p));

    return json_({success:false, message:'Action tidak dikenal'});
  } catch (err) {
    return json_({success:false, message: err && err.message ? err.message : String(err)});
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function rows_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get(CACHE_KEY);
  if (hit) return JSON.parse(hit);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan.');

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  const values = sh.getRange(2, 1, lastRow - 1, 7).getValues();
  const out = [];

  for (let i = 0; i < values.length; i++) {
    const r = values[i];

    if (!r[1] && !r[2] && !r[5]) continue;

    const jenis = String(r[2] || '').trim().toUpperCase();
    let kategori = String(r[3] || '').trim().toUpperCase();
    if (!kategori) kategori = 'LAINNYA';

    out.push({
      no: r[0] || (i + 2),
      tanggal: date_(r[1]),
      jenis: jenis,
      kategori: kategori,
      keterangan: String(r[4] || '').trim(),
      nominal: Number(r[5]) || 0,
      petugas: String(r[6] || '').trim()
    });
  }

  out.sort(function(a,b) {
    const d = String(b.tanggal).localeCompare(String(a.tanggal));
    if (d !== 0) return d;
    return Number(b.no) - Number(a.no);
  });

  cache.put(CACHE_KEY, JSON.stringify(out), CACHE_SECONDS);
  return out;
}

function date_(v) {
  if (!v) return '';

  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  const s = String(v).trim();
  const m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m) {
    return m[1] + '-' + String(m[2]).padStart(2,'0') + '-' + String(m[3]).padStart(2,'0');
  }

  const d = new Date(v);
  if (isNaN(d)) return s.substring(0,10);

  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function dashboard_() {
  const d = rows_();

  let masuk = 0;
  let keluar = 0;
  const im = {};
  const ik = {};
  const cats = {};

  for (let i = 0; i < d.length; i++) {
    const x = d[i];
    cats[x.kategori] = true;

    if (x.jenis === 'MASUK') {
      masuk += x.nominal;
      if (!im[x.kategori]) im[x.kategori] = {kategori:x.kategori, transaksi:0, jumlah:0};
      im[x.kategori].transaksi++;
      im[x.kategori].jumlah += x.nominal;
    } else if (x.jenis === 'KELUAR') {
      keluar += x.nominal;
      if (!ik[x.kategori]) ik[x.kategori] = {kategori:x.kategori, transaksi:0, jumlah:0};
      ik[x.kategori].transaksi++;
      ik[x.kategori].jumlah += x.nominal;
    }
  }

  function sort_(o) {
    return Object.keys(o).map(function(k){ return o[k]; })
      .sort(function(a,b){ return b.jumlah - a.jumlah; });
  }

  return {
    success:true,
    saldo: masuk - keluar,
    totalMasuk: masuk,
    totalKeluar: keluar,
    kategoriMasuk: sort_(im),
    kategoriKeluar: sort_(ik),
    kategoriList: Object.keys(cats).sort(),
    transaksiTerakhir: d.slice(0,20)
  };
}

function transaksi_(p) {
  let d = rows_();

  const jenis = String(p.jenis || '').trim().toUpperCase();
  const kategori = String(p.kategori || '').trim().toUpperCase();
  const mulai = String(p.mulai || '').trim();
  const akhir = String(p.akhir || '').trim();

  if (jenis) {
    d = d.filter(function(x){ return x.jenis === jenis; });
  }

  if (kategori) {
    d = d.filter(function(x){ return x.kategori.indexOf(kategori) !== -1; });
  }

  if (mulai) {
    d = d.filter(function(x){ return x.tanggal >= mulai; });
  }

  if (akhir) {
    d = d.filter(function(x){ return x.tanggal <= akhir; });
  }

  let totalMasuk = 0;
  let totalKeluar = 0;

  d.forEach(function(x){
    if (x.jenis === 'MASUK') totalMasuk += x.nominal;
    if (x.jenis === 'KELUAR') totalKeluar += x.nominal;
  });

  let page = Math.max(1, parseInt(p.page,10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(p.limit,10) || 20));
  const total = d.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (page > totalPages) page = totalPages;

  const start = (page - 1) * limit;

  return {
    success:true,
    data:d.slice(start, start + limit),
    page:page,
    limit:limit,
    total:total,
    totalPages:totalPages,
    totalMasuk:totalMasuk,
    totalKeluar:totalKeluar
  };
}

function clearCache() {
  CacheService.getScriptCache().remove(CACHE_KEY);
}

function onEdit(e) {
  clearCache();
}
