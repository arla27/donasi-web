"use strict";


/* =========================================================
   GLOBAL
========================================================= */

let dataKas = [];

let sedangMemuat = false;


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(nilai) {

    nilai = Number(nilai) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(nilai);

}


/* =========================================================
   FORMAT TANGGAL
   HASIL: DD/MM/YYYY
========================================================= */

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const d = parseTanggal(tanggal);

    if (!d || isNaN(d.getTime())) {
        return String(tanggal);
    }

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(d);

}


/* =========================================================
   PARSE TANGGAL
========================================================= */

function parseTanggal(value) {

    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return value;
    }

    const str = String(value).trim();

    /* ---------------------------------------------
       YYYY-MM-DD
    --------------------------------------------- */

    let match = str.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    );

    if (match) {

        return new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        );

    }


    /* ---------------------------------------------
       DD/MM/YYYY
    --------------------------------------------- */

    match = str.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (match) {

        return new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1])
        );

    }


    /* ---------------------------------------------
       DD-MM-YYYY
    --------------------------------------------- */

    match = str.match(
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
    );

    if (match) {

        return new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1])
        );

    }


    /* ---------------------------------------------
       ISO / DATE STRING
    --------------------------------------------- */

    const parsed = new Date(str);

    if (!isNaN(parsed.getTime())) {
        return parsed;
    }

    return null;

}


/* =========================================================
   TANGGAL UNTUK SORTING
========================================================= */

function getDateValue(value) {

    const d = parseTanggal(value);

    if (!d || isNaN(d.getTime())) {
        return 0;
    }

    return d.getTime();

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(id, value) {

    const el = document.getElementById(id);

    if (el) {
        el.textContent = value;
    }

}


/* =========================================================
   LOADING
========================================================= */

function tampilLoading(status) {

    const el = document.getElementById(
        "loadingOverlay"
    );

    if (!el) {
        return;
    }

    if (status) {

        el.style.display = "flex";

    } else {

        el.style.display = "none";

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   NORMALISASI DATA
========================================================= */

function normalisasiData(data) {

    if (!Array.isArray(data)) {
        return [];
    }

    return data.map(
        function (item, index) {

            let kategori =
                String(
                    item.kategori ?? ""
                ).trim().toUpperCase();

            if (!kategori) {
                kategori = "LAINNYA";
            }

            return {

                no:
                    item.no ??
                    index + 1,

                tanggal:
                    item.tanggal ??
                    "",

                jenis:
                    String(
                        item.jenis ?? ""
                    )
                    .trim()
                    .toUpperCase(),

                kategori:
                    kategori,

                keterangan:
                    String(
                        item.keterangan ?? ""
                    ).trim(),

                nominal:
                    Number(
                        item.nominal
                    ) || 0,

                petugas:
                    String(
                        item.petugas ?? ""
                    ).trim()

            };

        }
    );

}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadData() {

    if (sedangMemuat) {
        return;
    }

    sedangMemuat = true;

    try {

        tampilLoading(true);

        console.log(
            "===================================="
        );

        console.log(
            "LOAD DASHBOARD"
        );

        console.log(
            "SHEET_URL:",
            SHEET_URL
        );


        /* ---------------------------------------------
           API DASHBOARD
        --------------------------------------------- */

        const apiUrl =
            SHEET_URL +
            "?action=dashboard&_=" +
            Date.now();


        console.log(
            "API URL:",
            apiUrl
        );


        const response =
            await fetch(
                apiUrl,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        console.log(
            "HTTP STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP Error " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "DASHBOARD RESPONSE:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Response API tidak valid"
            );

        }


        /* =================================================
           DATA TRANSAKSI
        ================================================= */

        let transaksi = [];

        if (
            Array.isArray(
                result.transaksiTerakhir
            )
        ) {

            transaksi =
                result.transaksiTerakhir;

        } else if (
            Array.isArray(
                result.data
            )
        ) {

            transaksi =
                result.data;

        }


        dataKas =
            normalisasiData(
                transaksi
            );


        console.log(
            "DATA TRANSAKSI:",
            dataKas
        );

        console.log(
            "JUMLAH DATA:",
            dataKas.length
        );


        /* =================================================
           TOTAL DARI REKAP
           
           BUKAN DIHITUNG DARI 20 TRANSAKSI
        ================================================= */

        const totalMasuk =
            Number(
                result.totalMasuk
            ) || 0;


        const totalKeluar =
            Number(
                result.totalKeluar
            ) || 0;


        let saldo;

        if (
            result.saldo !== undefined &&
            result.saldo !== null
        ) {

            saldo =
                Number(result.saldo) || 0;

        } else if (
            result.saldoAkhir !== undefined &&
            result.saldoAkhir !== null
        ) {

            saldo =
                Number(result.saldoAkhir) || 0;

        } else {

            saldo =
                totalMasuk -
                totalKeluar;

        }


        console.log(
            "TOTAL MASUK REKAP:",
            totalMasuk
        );

        console.log(
            "TOTAL KELUAR REKAP:",
            totalKeluar
        );

        console.log(
            "SALDO REKAP:",
            saldo
        );


        /* =================================================
           TAMPILKAN KPI
        ================================================= */

        setText(
            "totalMasuk",
            formatRupiah(totalMasuk)
        );


        setText(
            "totalKeluar",
            formatRupiah(totalKeluar)
        );


        setText(
            "saldo",
            formatRupiah(saldo)
        );


        /* =================================================
           UPDATE TIME
        ================================================= */

        const waktuSekarang =
            new Intl.DateTimeFormat(
                "id-ID",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            ).format(
                new Date()
            );


        setText(
            "lastUpdate",
            waktuSekarang
        );


        setText(
            "lastUpdate2",
            "Diperbarui " +
            waktuSekarang
        );


        /* =================================================
           REKAP KATEGORI
        ================================================= */

        renderRekapMasuk(
            result.kategoriMasuk || []
        );


        renderRekapKeluar(
            result.kategoriKeluar || []
        );


        /* =================================================
           20 TRANSAKSI TERAKHIR
        ================================================= */

        renderTransaksiTerakhir(
            dataKas
        );


        console.log(
            "DASHBOARD BERHASIL DITAMPILKAN"
        );

        console.log(
            "===================================="
        );


    } catch (error) {

        console.error(
            "ERROR LOAD DASHBOARD:",
            error
        );

        tampilkanError(
            error.message ||
            "Gagal mengambil data"
        );


    } finally {

        sedangMemuat = false;

        tampilLoading(false);

    }

}


/* =========================================================
   REKAP KAS MASUK
========================================================= */

function renderRekapMasuk(data) {

    const tbody =
        document.getElementById(
            "tbodyRekapMasuk"
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 4;

        td.className = "empty";

        td.textContent =
            "Tidak ada data kas masuk";

        tr.appendChild(td);

        tbody.appendChild(tr);


        setText(
            "totalKategoriMasuk",
            formatRupiah(0)
        );

        return;

    }


    let total = 0;


    data.forEach(
        function (item, index) {

            const jumlah =
                Number(
                    item.jumlah
                ) || 0;

            total += jumlah;


            const tr =
                document.createElement("tr");


            const tdNo =
                document.createElement("td");

            tdNo.textContent =
                index + 1;


            const tdKategori =
                document.createElement("td");

            tdKategori.textContent =
                String(
                    item.kategori ||
                    "LAINNYA"
                ).toUpperCase();


            const tdTransaksi =
                document.createElement("td");

            tdTransaksi.className =
                "text-center";

            tdTransaksi.textContent =
                Number(
                    item.transaksi
                ) || 0;


            const tdJumlah =
                document.createElement("td");

            tdJumlah.className =
                "text-end";

            tdJumlah.textContent =
                formatRupiah(jumlah);


            tr.appendChild(tdNo);

            tr.appendChild(tdKategori);

            tr.appendChild(tdTransaksi);

            tr.appendChild(tdJumlah);

            tbody.appendChild(tr);

        }
    );


    setText(
        "totalKategoriMasuk",
        formatRupiah(total)
    );

}


/* =========================================================
   REKAP KAS KELUAR
========================================================= */

function renderRekapKeluar(data) {

    const tbody =
        document.getElementById(
            "tbodyRekapKeluar"
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 4;

        td.className = "empty";

        td.textContent =
            "Tidak ada data kas keluar";

        tr.appendChild(td);

        tbody.appendChild(tr);


        setText(
            "totalKategoriKeluar",
            formatRupiah(0)
        );

        return;

    }


    let total = 0;


    data.forEach(
        function (item, index) {

            const jumlah =
                Number(
                    item.jumlah
                ) || 0;

            total += jumlah;


            const tr =
                document.createElement("tr");


            const tdNo =
                document.createElement("td");

            tdNo.textContent =
                index + 1;


            const tdKategori =
                document.createElement("td");

            tdKategori.textContent =
                String(
                    item.kategori ||
                    "LAINNYA"
                ).toUpperCase();


            const tdTransaksi =
                document.createElement("td");

            tdTransaksi.className =
                "text-center";

            tdTransaksi.textContent =
                Number(
                    item.transaksi
                ) || 0;


            const tdJumlah =
                document.createElement("td");

            tdJumlah.className =
                "text-end";

            tdJumlah.textContent =
                formatRupiah(jumlah);


            tr.appendChild(tdNo);

            tr.appendChild(tdKategori);

            tr.appendChild(tdTransaksi);

            tr.appendChild(tdJumlah);

            tbody.appendChild(tr);

        }
    );


    setText(
        "totalKategoriKeluar",
        formatRupiah(total)
    );

}


/* =========================================================
   20 TRANSAKSI TERAKHIR

   ATURAN:
   1. Cari transaksi terbaru
   2. Ambil 20 transaksi terbaru
   3. Balik urutannya
   4. Tampilkan terlama -> terbaru
========================================================= */

function renderTransaksiTerakhir(data) {

    const tbody =
        document.getElementById(
            "tbodyTerakhir"
        );


    if (!tbody) {

        console.error(
            "tbodyTerakhir tidak ditemukan di HTML"
        );

        return;

    }


    tbody.innerHTML = "";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 6;

        td.className = "empty";

        td.textContent =
            "Tidak ada transaksi";

        tr.appendChild(td);

        tbody.appendChild(tr);

        return;

    }


    /* =====================================================
       COPY DATA
    ===================================================== */

    let transaksi =
        data.slice();


    /* =====================================================
       SORT TERBARU -> TERLAMA
    ===================================================== */

    transaksi.sort(
        function (a, b) {

            const dateA =
                getDateValue(
                    a.tanggal
                );

            const dateB =
                getDateValue(
                    b.tanggal
                );


            if (
                dateB !== dateA
            ) {

                return (
                    dateB -
                    dateA
                );

            }


            return (
                Number(b.no || 0) -
                Number(a.no || 0)
            );

        }
    );


    /* =====================================================
       AMBIL 20 TERBARU
    ===================================================== */

    transaksi =
        transaksi.slice(
            0,
            20
        );


    /* =====================================================
       TAMPILKAN TERLAMA -> TERBARU
    ===================================================== */

    transaksi.reverse();


    console.log(
        "TARGET 20 TRANSAKSI:",
        transaksi
    );


    /* =====================================================
       RENDER
    ===================================================== */

    transaksi.forEach(
        function (item, index) {

            const tr =
                document.createElement("tr");


            /* NO */

            const tdNo =
                document.createElement("td");

            tdNo.textContent =
                index + 1;


            /* TANGGAL */

            const tdTanggal =
                document.createElement("td");

            tdTanggal.textContent =
                formatTanggal(
                    item.tanggal
                );


            /* JENIS */

            const tdJenis =
                document.createElement("td");

            const badge =
                document.createElement("span");


            if (
                item.jenis === "MASUK"
            ) {

                badge.textContent =
                    "MASUK";

                badge.className =
                    "badge bg-success";

            } else {

                badge.textContent =
                    "KELUAR";

                badge.className =
                    "badge bg-danger";

            }


            tdJenis.appendChild(
                badge
            );


            /* KATEGORI */

            const tdKategori =
                document.createElement("td");

            tdKategori.textContent =
                item.kategori ||
                "LAINNYA";


            /* KETERANGAN */

            const tdKeterangan =
                document.createElement("td");

            tdKeterangan.textContent =
                item.keterangan ||
                "-";


            /* NOMINAL */

            const tdNominal =
                document.createElement("td");

            tdNominal.className =
                "text-end fw-bold";


            tdNominal.textContent =
                formatRupiah(
                    item.nominal
                );


            if (
                item.jenis === "MASUK"
            ) {

                tdNominal.classList.add(
                    "text-success"
                );

            } else {

                tdNominal.classList.add(
                    "text-danger"
                );

            }


            /* APPEND */

            tr.appendChild(tdNo);

            tr.appendChild(tdTanggal);

            tr.appendChild(tdJenis);

            tr.appendChild(tdKategori);

            tr.appendChild(tdKeterangan);

            tr.appendChild(tdNominal);


            tbody.appendChild(tr);

        }
    );


    console.log(
        "20 TRANSAKSI FINAL:",
        transaksi.length
    );

}


/* =========================================================
   ERROR
========================================================= */

function tampilkanError(pesan) {

    console.error(
        "DASHBOARD ERROR:",
        pesan
    );


    const targets = [

        "tbodyRekapMasuk",

        "tbodyRekapKeluar",

        "tbodyTerakhir"

    ];


    targets.forEach(
        function (id) {

            const tbody =
                document.getElementById(id);

            if (!tbody) {
                return;
            }


            tbody.innerHTML = "";


            const tr =
                document.createElement("tr");


            const td =
                document.createElement("td");


            if (
                id ===
                "tbodyTerakhir"
            ) {

                td.colSpan = 6;

            } else {

                td.colSpan = 4;

            }


            td.className =
                "empty text-danger";


            td.textContent =
                "Gagal mengambil data.";


            tr.appendChild(td);

            tbody.appendChild(tr);

        }
    );


    setText(
        "lastUpdate",
        "Gagal memuat data"
    );

}


/* =========================================================
   FILTER PERIODE
   ========================================================

   HTML index.html Anda sekarang memang TIDAK memiliki
   filter tanggal.

   Fungsi ini tetap disediakan supaya tidak error jika
   dipanggil dari kode lama.
========================================================= */

function filterPeriode() {

    console.log(
        "Filter periode belum digunakan pada dashboard utama."
    );

}


/* =========================================================
   SEMUA DATA
========================================================= */

function tampilkanSemuaData() {

    console.log(
        "Menampilkan semua data."
    );

    renderTransaksiTerakhir(
        dataKas
    );

}


/* =========================================================
   LOAD SAAT HALAMAN SIAP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "DOM READY"
        );


        /* =============================================
           LOAD PERTAMA
        ============================================= */

        loadData();


        /* =============================================
           REFRESH OTOMATIS 30 DETIK
        ============================================= */

        setInterval(
            function () {

                console.log(
                    "AUTO REFRESH DASHBOARD"
                );

                loadData();

            },
            30000
        );

    }
);
