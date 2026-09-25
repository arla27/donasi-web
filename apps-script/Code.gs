const SHEET_NAME = 'KAS_DKM';
const CACHE_SECONDS = 30;
const CACHE_KEY = 'dkm_rows_v3';


function doGet(e) {
  try {

    const action =
      (e && e.parameter && e.parameter.action)
        ? String(e.parameter.action).toLowerCase()
        : 'dashboard';

    if (action === 'dashboard') {
      return json_(dashboard_());
    }

    if (action === 'transaksi') {
      return json_(transaksi_(e.parameter));
    }

    return json_({
      success: false,
      message: 'Action tidak dikenal'
    });

  } catch (err) {

    return json_({
      success: false,
      message: err.message || String(err)
    });

  }
}


/* =========================================================
   JSON RESPONSE
========================================================= */

function json_(obj) {

  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);

}


/* =========================================================
   AMBIL DATA DARI GOOGLE SHEET
========================================================= */

function rows_() {

  const cache = CacheService.getScriptCache();

  const hit = cache.get(CACHE_KEY);

  if (hit) {
    return JSON.parse(hit);
  }


  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sh = ss.getSheetByName(SHEET_NAME);


  if (!sh) {

    throw new Error(
      'Sheet "' + SHEET_NAME + '" tidak ditemukan.'
    );

  }


  const lastRow = sh.getLastRow();

  const lastColumn = sh.getLastColumn();


  if (lastRow < 2) {
    return [];
  }


  const values = sh
    .getRange(1, 1, lastRow, Math.min(lastColumn, 7))
    .getValues();


  const out = [];


  for (let i = 1; i < values.length; i++) {

    const r = values[i];


    /*
      Kolom:
      A = No
      B = Tanggal
      C = Jenis
      D = Kategori
      E = Keterangan
      F = Nominal
      G = Petugas
    */


    if (
      !r[1] &&
      !r[2] &&
      !r[5]
    ) {
      continue;
    }


    const jenis =
      String(r[2] || '')
        .trim()
        .toUpperCase();


    let kategori =
      String(r[3] || '')
        .trim()
        .toUpperCase();


    if (!kategori) {
      kategori = 'LAINNYA';
    }


    out.push({

      no: r[0] || i,

      tanggal: date_(r[1]),

      jenis: jenis,

      kategori: kategori,

      keterangan:
        String(r[4] || '').trim(),

      nominal:
        Number(r[5]) || 0,

      petugas:
        String(r[6] || '').trim()

    });

  }


  /*
    Urutkan terbaru.
  */

  out.sort(function(a, b) {

    const tanggal =
      String(b.tanggal)
        .localeCompare(String(a.tanggal));


    if (tanggal !== 0) {
      return tanggal;
    }


    return Number(b.no) - Number(a.no);

  });


  /*
    Simpan cache.
  */

  cache.put(
    CACHE_KEY,
    JSON.stringify(out),
    CACHE_SECONDS
  );


  return out;

}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function date_(v) {

  if (
    Object.prototype.toString.call(v) === '[object Date]' &&
    !isNaN(v)
  ) {

    return Utilities.formatDate(
      v,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

  }


  if (!v) {
    return '';
  }


  const d = new Date(v);


  if (isNaN(d)) {
    return String(v);
  }


  return Utilities.formatDate(
    d,
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );

}


/* =========================================================
   DASHBOARD
========================================================= */

function dashboard_() {

  const data = rows_();


  let masuk = 0;
  let keluar = 0;


  const kategoriMasuk = {};
  const kategoriKeluar = {};


  for (let i = 0; i < data.length; i++) {

    const x = data[i];


    /*
      KAS MASUK
    */

    if (x.jenis === 'MASUK') {

      masuk += x.nominal;


      const k = x.kategori;


      /*
        Jangan gunakan ??=
        supaya kompatibel dengan Apps Script.
      */

      if (!kategoriMasuk[k]) {

        kategoriMasuk[k] = {

          kategori: k,

          transaksi: 0,

          jumlah: 0

        };

      }


      kategoriMasuk[k].transaksi++;

      kategoriMasuk[k].jumlah += x.nominal;

    }


    /*
      KAS KELUAR
    */

    else if (x.jenis === 'KELUAR') {

      keluar += x.nominal;


      const k = x.kategori;


      if (!kategoriKeluar[k]) {

        kategoriKeluar[k] = {

          kategori: k,

          transaksi: 0,

          jumlah: 0

        };

      }


      kategoriKeluar[k].transaksi++;

      kategoriKeluar[k].jumlah += x.nominal;

    }

  }


  /*
    Fungsi sorting kategori.
  */

  function sortKategori(obj) {

    return Object.keys(obj)
      .map(function(key) {

        return obj[key];

      })
      .sort(function(a, b) {

        return b.jumlah - a.jumlah;

      });

  }


  /*
    HANYA 20 TRANSAKSI TERBARU
  */

  const transaksiTerakhir =
    data.slice(0, 20);


  return {

    success: true,

    saldo:
      masuk - keluar,

    totalMasuk:
      masuk,

    totalKeluar:
      keluar,

    kategoriMasuk:
      sortKategori(kategoriMasuk),

    kategoriKeluar:
      sortKategori(kategoriKeluar),

    transaksiTerakhir:
      transaksiTerakhir

  };

}


/* =========================================================
   TRANSAKSI DETAIL + PAGINATION
========================================================= */

function transaksi_(p) {

  let data = rows_();


  p = p || {};


  const jenis =
    String(p.jenis || '')
      .trim()
      .toUpperCase();


  const kategori =
    String(p.kategori || '')
      .trim()
      .toUpperCase();


  const mulai =
    String(p.mulai || '')
      .trim();


  const akhir =
    String(p.akhir || '')
      .trim();


  /*
    FILTER
  */

  data = data.filter(function(x) {

    if (
      jenis &&
      x.jenis !== jenis
    ) {
      return false;
    }


    if (
      kategori &&
      x.kategori.indexOf(kategori) === -1
    ) {
      return false;
    }


    if (
      mulai &&
      x.tanggal < mulai
    ) {
      return false;
    }


    if (
      akhir &&
      x.tanggal > akhir
    ) {
      return false;
    }


    return true;

  });


  /*
    TOTAL MASUK / KELUAR
    berdasarkan hasil filter.
  */

  let totalMasuk = 0;
  let totalKeluar = 0;


  for (let i = 0; i < data.length; i++) {

    if (data[i].jenis === 'MASUK') {

      totalMasuk += data[i].nominal;

    }

    else if (data[i].jenis === 'KELUAR') {

      totalKeluar += data[i].nominal;

    }

  }


  /*
    PAGINATION
  */

  let page =
    Number(p.page) || 1;


  let limit =
    Number(p.limit) || 20;


  page = Math.max(1, page);

  limit = Math.max(1, Math.min(100, limit));


  const total =
    data.length;


  const totalPages =
    Math.max(
      1,
      Math.ceil(total / limit)
    );


  /*
    Kalau page melebihi jumlah halaman,
    arahkan ke halaman terakhir.
  */

  if (page > totalPages) {

    page = totalPages;

  }


  const start =
    (page - 1) * limit;


  const end =
    start + limit;


  const result =
    data.slice(start, end);


  return {

    success: true,

    data: result,

    page: page,

    limit: limit,

    total: total,

    totalPages: totalPages,

    totalMasuk: totalMasuk,

    totalKeluar: totalKeluar

  };

}


/* =========================================================
   CLEAR CACHE
========================================================= */

function clearCache() {

  CacheService
    .getScriptCache()
    .remove(CACHE_KEY);

}


/* =========================================================
   CLEAR CACHE SAAT DATA SHEET DIUBAH
========================================================= */

function onEdit(e) {

  clearCache();

}
