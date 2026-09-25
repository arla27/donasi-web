"use strict";

/* =========================================================
   DATA GLOBAL
========================================================= */

let dataKas = [];
let sedangMemuat = false;


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(nilai) {

    nilai = Number(nilai) || 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(nilai);

}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const str = String(tanggal).trim();

    let match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
    }

    match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (match) {
        return `${String(match[1]).padStart(2, "0")}/${String(match[2]).padStart(2, "0")}/${match[3]}`;
    }

    const d = new Date(str);

    if (!isNaN(d.getTime())) {

        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(d);

    }

    return str;
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

    const el = document.getElementById("loadingOverlay");

    if (!el) {
        return;
    }

    if (status) {
        el.classList.add("show");
    } else {
        el.classList.remove("show");
    }

}


/* =========================================================
   RENDER KAS MASUK
========================================================= */

function renderKasMasuk(data) {

    const tbody = document.getElementById("tbodyMasuk");

    if (!tbody) {
        return;
    }

    if (!data || data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Tidak ada transaksi kas masuk
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = data.map(function(item, index) {

        return `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(formatTanggal(item.tanggal))}
                </td>

                <td>
                    ${escapeHtml(item.kategori)}
                </td>

                <td>
                    ${escapeHtml(item.keterangan)}
                </td>

                <td class="text-end fw-bold text-success">
                    ${formatRupiah(item.nominal)}
                </td>

            </tr>
        `;

    }).join("");

}


/* =========================================================
   RENDER KAS KELUAR
========================================================= */

function renderKasKeluar(data) {

    const tbody = document.getElementById("tbodyKeluar");

    if (!tbody) {
        return;
    }

    if (!data || data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Tidak ada transaksi kas keluar
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = data.map(function(item, index) {

        return `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(formatTanggal(item.tanggal))}
                </td>

                <td>
                    ${escapeHtml(item.kategori)}
                </td>

                <td>
                    ${escapeHtml(item.keterangan)}
                </td>

                <td class="text-end fw-bold text-danger">
                    ${formatRupiah(item.nominal)}
                </td>

            </tr>
        `;

    }).join("");

}


/* =========================================================
   RENDER TRANSAKSI TERAKHIR
========================================================= */

function renderTransaksiTerakhir(data) {

    const tbody =
        document.getElementById("tbodyTerakhir");

    if (!tbody) {
        return;
    }

    if (!data || data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    Belum ada transaksi
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = data.map(function(item, index) {

        const warna =
            item.jenis === "MASUK"
                ? "text-success"
                : "text-danger";

        return `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(formatTanggal(item.tanggal))}
                </td>

                <td>
                    ${escapeHtml(item.jenis)}
                </td>

                <td>
                    ${escapeHtml(item.kategori)}
                </td>

                <td>
                    ${escapeHtml(item.keterangan)}
                </td>

                <td class="text-end fw-bold ${warna}">
                    ${formatRupiah(item.nominal)}
                </td>

            </tr>
        `;

    }).join("");

}


/* =========================================================
   RENDER REKAP KATEGORI
========================================================= */

function renderKategori(data, tbodyId, totalId) {

    const tbody = document.getElementById(tbodyId);

    if (!tbody) {
        return;
    }

    data = Array.isArray(data) ? data : [];

    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    Belum ada data
                </td>
            </tr>
        `;

        setText(totalId, formatRupiah(0));

        return;
    }

    let total = 0;

    tbody.innerHTML = data.map(function(item, index) {

        const jumlah =
            Number(item.jumlah) || 0;

        total += jumlah;

        return `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(item.kategori)}
                </td>

                <td class="text-center">
                    ${Number(item.transaksi) || 0}
                </td>

                <td class="text-end fw-bold">
                    ${formatRupiah(jumlah)}
                </td>

            </tr>
        `;

    }).join("");

    setText(totalId, formatRupiah(total));
}


/* =========================================================
   TAMPILKAN DATA
========================================================= */

function tampilkanData(data) {

    data = Array.isArray(data) ? data : [];

    dataKas = data;

    const dataMasuk =
        data.filter(function(item) {
            return String(item.jenis || "").toUpperCase() === "MASUK";
        });

    const dataKeluar =
        data.filter(function(item) {
            return String(item.jenis || "").toUpperCase() === "KELUAR";
        });


    const totalMasuk =
        dataMasuk.reduce(function(total, item) {
            return total + (Number(item.nominal) || 0);
        }, 0);


    const totalKeluar =
        dataKeluar.reduce(function(total, item) {
            return total + (Number(item.nominal) || 0);
        }, 0);


    const saldo =
        totalMasuk - totalKeluar;


    /* ================================
       KPI
    ================================= */

    setText("totalMasuk", formatRupiah(totalMasuk));
    setText("totalKeluar", formatRupiah(totalKeluar));
    setText("saldo", formatRupiah(saldo));

    setText("footerMasuk", formatRupiah(totalMasuk));
    setText("footerKeluar", formatRupiah(totalKeluar));

    setText("rekapMasuk", formatRupiah(totalMasuk));
    setText("rekapKeluar", formatRupiah(totalKeluar));
    setText("rekapSaldo", formatRupiah(saldo));

    setText("jumlahTransaksi", data.length);

    setText(
        "lastUpdate",
        new Intl.DateTimeFormat("id-ID", {
            dateStyle: "short",
            timeStyle: "medium"
        }).format(new Date())
    );


    /* ================================
       TABLE
    ================================= */

    renderKasMasuk(dataMasuk);

    renderKasKeluar(dataKeluar);

}


/* =========================================================
   LOAD DATA DASHBOARD
========================================================= */

async function loadData() {

    if (sedangMemuat) {
        return;
    }

    sedangMemuat = true;

    try {

        tampilLoading(true);

        console.log("====================================");
        console.log("LOAD DASHBOARD");
        console.log("SHEET_URL:", SHEET_URL);


        /*
         * PENTING:
         * API BARU HARUS MENGGUNAKAN
         * action=dashboard
         */

        const url =
            new URL(SHEET_URL);

        url.searchParams.set(
            "action",
            "dashboard"
        );

        url.searchParams.set(
            "_",
            Date.now()
        );


        console.log(
            "API URL:",
            url.toString()
        );


        const response =
            await fetch(
                url.toString(),
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
            "RESPONSE API:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "API mengembalikan response tidak valid"
            );

        }


        /*
         * ====================================
         * API DASHBOARD BARU
         * ====================================
         */

        const totalMasuk =
            Number(result.totalMasuk) || 0;

        const totalKeluar =
            Number(result.totalKeluar) || 0;

        const saldo =
            Number(result.saldo) ||
            (totalMasuk - totalKeluar);


        /* KPI */

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

        setText(
            "footerMasuk",
            formatRupiah(totalMasuk)
        );

        setText(
            "footerKeluar",
            formatRupiah(totalKeluar)
        );

        setText(
            "rekapMasuk",
            formatRupiah(totalMasuk)
        );

        setText(
            "rekapKeluar",
            formatRupiah(totalKeluar)
        );

        setText(
            "rekapSaldo",
            formatRupiah(saldo)
        );


        /*
         * ====================================
         * TRANSAKSI TERAKHIR
         * ====================================
         */

        const transaksi =
            Array.isArray(result.transaksiTerakhir)
                ? result.transaksiTerakhir
                : [];


        setText(
            "jumlahTransaksi",
            transaksi.length
        );


        /*
         * Pisahkan MASUK / KELUAR
         */

        const dataMasuk =
            transaksi.filter(function(item) {
                return String(item.jenis || "")
                    .toUpperCase() === "MASUK";
            });


        const dataKeluar =
            transaksi.filter(function(item) {
                return String(item.jenis || "")
                    .toUpperCase() === "KELUAR";
            });


        renderKasMasuk(dataMasuk);

        renderKasKeluar(dataKeluar);

        renderTransaksiTerakhir(transaksi);


        /*
         * ====================================
         * REKAP KATEGORI
         * ====================================
         */

        renderKategori(
            result.kategoriMasuk,
            "tbodyRekapMasuk",
            "totalKategoriMasuk"
        );

        renderKategori(
            result.kategoriKeluar,
            "tbodyRekapKeluar",
            "totalKategoriKeluar"
        );


        /*
         * ====================================
         * DATA GLOBAL
         * ====================================
         */

        dataKas = transaksi;


        setText(
            "lastUpdate",
            new Intl.DateTimeFormat("id-ID", {
                dateStyle: "short",
                timeStyle: "medium"
            }).format(new Date())
        );


        console.log(
            "TOTAL MASUK:",
            totalMasuk
        );

        console.log(
            "TOTAL KELUAR:",
            totalKeluar
        );

        console.log(
            "SALDO:",
            saldo
        );

        console.log(
            "JUMLAH TRANSAKSI:",
            transaksi.length
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
   ERROR
========================================================= */

function tampilkanError(pesan) {

    console.error(
        "DASHBOARD ERROR:",
        pesan
    );


    const pesanHtml = `
        <tr>
            <td colspan="5"
                class="text-center text-danger py-4">

                <strong>
                    Gagal mengambil data kas
                </strong>

                <br>

                <small>
                    ${escapeHtml(pesan)}
                </small>

            </td>
        </tr>
    `;


    const masuk =
        document.getElementById("tbodyMasuk");

    const keluar =
        document.getElementById("tbodyKeluar");


    if (masuk) {
        masuk.innerHTML = pesanHtml;
    }

    if (keluar) {
        keluar.innerHTML = pesanHtml;
    }

}


/* =========================================================
   FILTER PERIODE
========================================================= */

function tanggalKeYYYYMMDD(value) {

    if (!value) {
        return "";
    }

    const str =
        String(value).trim();


    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
    }


    let match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (match) {

        return (
            match[3] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );

    }


    return "";
}


function filterPeriode() {

    const inputMulai =
        document.getElementById("tanggalMulai");

    const inputAkhir =
        document.getElementById("tanggalAkhir");


    if (!inputMulai || !inputAkhir) {
        return;
    }


    const mulai =
        inputMulai.value;

    const akhir =
        inputAkhir.value;


    if (!mulai || !akhir) {

        alert(
            "Silakan pilih tanggal mulai dan tanggal akhir."
        );

        return;
    }


    if (mulai > akhir) {

        alert(
            "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
        );

        return;
    }


    const hasil =
        dataKas.filter(function(item) {

            const tanggal =
                tanggalKeYYYYMMDD(
                    item.tanggal
                );

            return (
                tanggal >= mulai &&
                tanggal <= akhir
            );

        });


    setText(
        "periode",
        `${formatTanggal(mulai)} s/d ${formatTanggal(akhir)}`
    );


    tampilkanData(hasil);

}


/* =========================================================
   SEMUA DATA
========================================================= */

function tampilkanSemuaData() {

    const mulai =
        document.getElementById("tanggalMulai");

    const akhir =
        document.getElementById("tanggalAkhir");


    if (mulai) {
        mulai.value = "";
    }

    if (akhir) {
        akhir.value = "";
    }


    setText(
        "periode",
        "Semua Data"
    );


    /*
     * Karena dashboard hanya mengambil 20 transaksi terakhir,
     * tombol semua data akan menampilkan data yang tersedia
     * dari dashboard.
     */

    tampilkanData(dataKas);

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "DOM READY"
        );


        const btnTampilkan =
            document.getElementById(
                "btnTampilkan"
            );


        const btnSemua =
            document.getElementById(
                "btnSemua"
            );


        if (btnTampilkan) {

            btnTampilkan.addEventListener(
                "click",
                filterPeriode
            );

        }


        if (btnSemua) {

            btnSemua.addEventListener(
                "click",
                tampilkanSemuaData
            );

        }


        /*
         * LOAD DATA PERTAMA
         */

        loadData();


        /*
         * REFRESH 60 DETIK
         */

        setInterval(
            loadData,
            60000
        );

    }
);
