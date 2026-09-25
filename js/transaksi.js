"use strict";


/* =========================================================
   KONFIGURASI API
========================================================= */

const API_URL = SHEET_URL;


/* =========================================================
   PAGINATION
========================================================= */

let currentPage = 1;

/*
 * JUMLAH DATA PER HALAMAN
 */
const LIMIT = 20;


/*
 * Mencegah request bersamaan
 */
let sedangMemuat = false;


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {

    const angka =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(angka);

}


/* =========================================================
   FORMAT TANGGAL
   INPUT:
   YYYY-MM-DD
   YYYY-MM-DDTHH:mm:ss
   DD/MM/YYYY
========================================================= */

function formatTanggal(value) {

    if (!value) {
        return "-";
    }


    const str =
        String(value).trim();


    /*
     * YYYY-MM-DD
     */

    let match =
        str.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );


    if (match) {

        return (
            String(match[3]).padStart(2, "0") +
            "/" +
            String(match[2]).padStart(2, "0") +
            "/" +
            match[1]
        );

    }


    /*
     * DD/MM/YYYY
     */

    match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (match) {

        return (
            String(match[1]).padStart(2, "0") +
            "/" +
            String(match[2]).padStart(2, "0") +
            "/" +
            match[3]
        );

    }


    /*
     * DD-MM-YYYY
     */

    match =
        str.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
        );


    if (match) {

        return (
            String(match[1]).padStart(2, "0") +
            "/" +
            String(match[2]).padStart(2, "0") +
            "/" +
            match[3]
        );

    }


    /*
     * ISO / JavaScript Date
     */

    const d =
        new Date(str);


    if (
        isNaN(
            d.getTime()
        )
    ) {

        return "-";

    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            timeZone: "Asia/Jakarta",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(d);

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const el =
        document.getElementById(id);


    if (el) {

        el.textContent =
            value;

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    const el =
        document.getElementById(
            "loadingOverlay"
        );


    if (el) {

        el.style.display =
            "flex";

    }

}


function hideLoading() {

    const el =
        document.getElementById(
            "loadingOverlay"
        );


    if (el) {

        el.style.display =
            "none";

    }

}


/* =========================================================
   AMBIL NILAI FILTER
========================================================= */

function getFilterValue(id) {

    const el =
        document.getElementById(id);


    if (!el) {

        return "";

    }


    return String(
        el.value || ""
    ).trim();

}


/* =========================================================
   LOAD TRANSAKSI
========================================================= */

async function loadTransaksi(
    page = 1
) {

    /*
     * Mencegah double request
     */

    if (sedangMemuat) {

        return;

    }


    sedangMemuat = true;


    showLoading();


    try {

        /* =================================================
           PAGE
        ================================================= */

        page =
            parseInt(
                page,
                10
            ) || 1;


        if (page < 1) {

            page = 1;

        }


        currentPage =
            page;


        /* =================================================
           FILTER
        ================================================= */

        const mulai =
            getFilterValue(
                "tanggalMulai"
            );


        const akhir =
            getFilterValue(
                "tanggalAkhir"
            );


        const jenis =
            getFilterValue(
                "filterJenis"
            )
            .toUpperCase();


        const kategori =
            getFilterValue(
                "filterKategori"
            )
            .toUpperCase();


        /* =================================================
           VALIDASI TANGGAL
        ================================================= */

        if (
            mulai &&
            akhir &&
            mulai > akhir
        ) {

            hideLoading();

            alert(
                "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
            );

            sedangMemuat =
                false;

            return;

        }


        /* =================================================
           PARAMETER API
        ================================================= */

        const params =
            new URLSearchParams();


        params.set(
            "action",
            "transaksi"
        );


        params.set(
            "page",
            String(page)
        );


        /*
         * PENTING:
         * 20 DATA PER HALAMAN
         */

        params.set(
            "limit",
            String(LIMIT)
        );


        /* =================================================
           TANGGAL MULAI
        ================================================= */

        if (mulai) {

            params.set(
                "mulai",
                mulai
            );

        }


        /* =================================================
           TANGGAL AKHIR
        ================================================= */

        if (akhir) {

            params.set(
                "akhir",
                akhir
            );

        }


        /* =================================================
           JENIS
        ================================================= */

        if (jenis) {

            params.set(
                "jenis",
                jenis
            );

        }


        /* =================================================
           KATEGORI
        ================================================= */

        if (kategori) {

            params.set(
                "kategori",
                kategori
            );

        }


        /* =================================================
           CACHE BUSTER
        ================================================= */

        params.set(
            "_",
            String(
                Date.now()
            )
        );


        /* =================================================
           URL API
        ================================================= */

        const url =
            API_URL +
            "?" +
            params.toString();


        console.log(
            "======================================"
        );

        console.log(
            "TRANSAKSI API REQUEST"
        );

        console.log(
            "PAGE:",
            page
        );

        console.log(
            "LIMIT:",
            LIMIT
        );

        console.log(
            "MULAI:",
            mulai
        );

        console.log(
            "AKHIR:",
            akhir
        );

        console.log(
            "JENIS:",
            jenis
        );

        console.log(
            "KATEGORI:",
            kategori
        );

        console.log(
            "URL:",
            url
        );


        /* =================================================
           REQUEST
        ================================================= */

        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "HTTP STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Server tidak dapat dihubungi."
            );

        }


        /* =================================================
           PARSE JSON
        ================================================= */

        let result;


        try {

            result =
                await response.json();

        } catch (error) {

            throw new Error(
                "Response server tidak valid."
            );

        }


        console.log(
            "TRANSAKSI RESPONSE:",
            result
        );


        /* =================================================
           VALIDASI API
        ================================================= */

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                "Data transaksi tidak dapat dimuat."
            );

        }


        /* =================================================
           DATA
        ================================================= */

        const data =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        /* =================================================
           RENDER TABLE
        ================================================= */

        renderTable(
            data
        );


        /* =================================================
           TOTAL MASUK
        ================================================= */

        const totalMasuk =
            Number(
                result.totalMasuk
            ) || 0;


        setText(
            "totalMasuk",
            formatRupiah(
                totalMasuk
            )
        );


        /* =================================================
           TOTAL KELUAR
        ================================================= */

        const totalKeluar =
            Number(
                result.totalKeluar
            ) || 0;


        setText(
            "totalKeluar",
            formatRupiah(
                totalKeluar
            )
        );


        /* =================================================
           SALDO
        ================================================= */

        let saldo;


        if (
            result.saldo !== undefined &&
            result.saldo !== null
        ) {

            saldo =
                Number(
                    result.saldo
                ) || 0;

        } else {

            saldo =
                totalMasuk -
                totalKeluar;

        }


        setText(
            "saldo",
            formatRupiah(
                saldo
            )
        );


        /* =================================================
           JUMLAH TRANSAKSI
        ================================================= */

        setText(
            "jumlahTransaksi",
            Number(
                result.total
            ) || 0
        );


        /* =================================================
           PAGINATION
        ================================================= */

        const resultPage =
            Math.max(
                1,
                Number(
                    result.page
                ) || 1
            );


        const totalPages =
            Math.max(
                1,
                Number(
                    result.totalPages
                ) || 1
            );


        currentPage =
            resultPage;


        renderPagination(
            resultPage,
            totalPages
        );


        console.log(
            "HASIL"
        );

        console.log(
            "TOTAL DATA:",
            result.total
        );

        console.log(
            "TOTAL PAGES:",
            totalPages
        );

        console.log(
            "PAGE:",
            resultPage
        );

        console.log(
            "LIMIT:",
            result.limit
        );

        console.log(
            "======================================"
        );


    } catch (error) {

        console.error(
            "TRANSAKSI ERROR:",
            error
        );


        tampilkanError();

    } finally {

        sedangMemuat =
            false;

        hideLoading();

    }

}


/* =========================================================
   RENDER TABLE
   MENGGUNAKAN textContent
========================================================= */

function renderTable(
    data
) {

    const tbody =
        document.getElementById(
            "tbodyTransaksi"
        );


    if (!tbody) {

        console.warn(
            "tbodyTransaksi tidak ditemukan."
        );

        return;

    }


    /*
     * Bersihkan table
     */

    while (
        tbody.firstChild
    ) {

        tbody.removeChild(
            tbody.firstChild
        );

    }


    /* =================================================
       DATA KOSONG
    ================================================= */

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const tr =
            document.createElement(
                "tr"
            );


        const td =
            document.createElement(
                "td"
            );


        td.colSpan = 7;

        td.className =
            "text-center text-muted py-4";


        td.textContent =
            "Data tidak ditemukan";


        tr.appendChild(
            td
        );


        tbody.appendChild(
            tr
        );


        return;

    }


    /* =================================================
       RENDER DATA
    ================================================= */

    data.forEach(
        function(item) {

            const tr =
                document.createElement(
                    "tr"
                );


            /* -----------------------------------------
               NO
            ----------------------------------------- */

            const tdNo =
                document.createElement(
                    "td"
                );


            tdNo.textContent =
                String(
                    item.no ??
                    "-"
                );


            /* -----------------------------------------
               TANGGAL
            ----------------------------------------- */

            const tdTanggal =
                document.createElement(
                    "td"
                );


            tdTanggal.textContent =
                formatTanggal(
                    item.tanggal
                );


            /* -----------------------------------------
               JENIS
            ----------------------------------------- */

            const tdJenis =
                document.createElement(
                    "td"
                );


            const badge =
                document.createElement(
                    "span"
                );


            const jenis =
                String(
                    item.jenis ||
                    ""
                )
                .trim()
                .toUpperCase();


            if (
                jenis === "MASUK"
            ) {

                badge.className =
                    "badge bg-success";

                badge.textContent =
                    "MASUK";

            } else {

                badge.className =
                    "badge bg-danger";

                badge.textContent =
                    "KELUAR";

            }


            tdJenis.appendChild(
                badge
            );


            /* -----------------------------------------
               KATEGORI
            ----------------------------------------- */

            const tdKategori =
                document.createElement(
                    "td"
                );


            tdKategori.textContent =
                String(
                    item.kategori ||
                    "LAINNYA"
                )
                .toUpperCase();


            /* -----------------------------------------
               KETERANGAN
            ----------------------------------------- */

            const tdKeterangan =
                document.createElement(
                    "td"
                );


            tdKeterangan.textContent =
                String(
                    item.keterangan ||
                    "-"
                );


            /* -----------------------------------------
               NOMINAL
            ----------------------------------------- */

            const tdNominal =
                document.createElement(
                    "td"
                );


            tdNominal.className =
                "text-end";


            tdNominal.textContent =
                formatRupiah(
                    item.nominal
                );


            /* -----------------------------------------
               PETUGAS
            ----------------------------------------- */

            const tdPetugas =
                document.createElement(
                    "td"
                );


            tdPetugas.textContent =
                String(
                    item.petugas ||
                    "-"
                );


            /* -----------------------------------------
               APPEND
            ----------------------------------------- */

            tr.appendChild(
                tdNo
            );

            tr.appendChild(
                tdTanggal
            );

            tr.appendChild(
                tdJenis
            );

            tr.appendChild(
                tdKategori
            );

            tr.appendChild(
                tdKeterangan
            );

            tr.appendChild(
                tdNominal
            );

            tr.appendChild(
                tdPetugas
            );


            tbody.appendChild(
                tr
            );

        }
    );

}


/* =========================================================
   PAGINATION
========================================================= */

function renderPagination(
    page,
    totalPages
) {

    const container =
        document.getElementById(
            "pagination"
        );


    if (!container) {

        console.warn(
            "Element #pagination tidak ditemukan."
        );

        return;

    }


    /*
     * Bersihkan pagination
     */

    while (
        container.firstChild
    ) {

        container.removeChild(
            container.firstChild
        );

    }


    /* =================================================
       HANYA 1 HALAMAN
    ================================================= */

    if (
        totalPages <= 1
    ) {

        return;

    }


    /* =================================================
       HALAMAN PERTAMA
    ================================================= */

    const first =
        document.createElement(
            "button"
        );


    first.type =
        "button";


    first.className =
        "btn btn-sm btn-outline-primary me-1";


    first.textContent =
        "«";


    first.title =
        "Halaman pertama";


    first.disabled =
        page <= 1;


    first.addEventListener(
        "click",
        function() {

            loadTransaksi(
                1
            );

        }
    );


    container.appendChild(
        first
    );


    /* =================================================
       PREVIOUS
    ================================================= */

    const previous =
        document.createElement(
            "button"
        );


    previous.type =
        "button";


    previous.className =
        "btn btn-sm btn-outline-primary me-1";


    previous.textContent =
        "‹";


    previous.title =
        "Halaman sebelumnya";


    previous.disabled =
        page <= 1;


    previous.addEventListener(
        "click",
        function() {

            if (
                page > 1
            ) {

                loadTransaksi(
                    page - 1
                );

            }

        }
    );


    container.appendChild(
        previous
    );


    /* =================================================
       NOMOR HALAMAN
    ================================================= */

    let startPage =
        Math.max(
            1,
            page - 2
        );


    let endPage =
        Math.min(
            totalPages,
            page + 2
        );


    /*
     * Dekat awal
     */

    if (
        page <= 3
    ) {

        startPage =
            1;

        endPage =
            Math.min(
                totalPages,
                5
            );

    }


    /*
     * Dekat akhir
     */

    if (
        page >=
        totalPages - 2
    ) {

        endPage =
            totalPages;

        startPage =
            Math.max(
                1,
                totalPages - 4
            );

    }


    for (
        let i = startPage;
        i <= endPage;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "btn btn-sm me-1 " +
            (
                i === page
                    ? "btn-primary"
                    : "btn-outline-primary"
            );


        button.textContent =
            String(i);


        button.disabled =
            i === page;


        button.addEventListener(
            "click",
            function() {

                loadTransaksi(
                    i
                );

            }
        );


        container.appendChild(
            button
        );

    }


    /* =================================================
       NEXT
    ================================================= */

    const next =
        document.createElement(
            "button"
        );


    next.type =
        "button";


    next.className =
        "btn btn-sm btn-outline-primary me-1";


    next.textContent =
        "›";


    next.title =
        "Halaman berikutnya";


    next.disabled =
        page >= totalPages;


    next.addEventListener(
        "click",
        function() {

            if (
                page <
                totalPages
            ) {

                loadTransaksi(
                    page + 1
                );

            }

        }
    );


    container.appendChild(
        next
    );


    /* =================================================
       LAST
    ================================================= */

    const last =
        document.createElement(
            "button"
        );


    last.type =
        "button";


    last.className =
        "btn btn-sm btn-outline-primary";


    last.textContent =
        "»";


    last.title =
        "Halaman terakhir";


    last.disabled =
        page >= totalPages;


    last.addEventListener(
        "click",
        function() {

            if (
                page <
                totalPages
            ) {

                loadTransaksi(
                    totalPages
                );

            }

        }
    );


    container.appendChild(
        last
    );

}


/* =========================================================
   TOMBOL TAMPILKAN
========================================================= */

function filterData() {

    console.log(
        "TOMBOL TAMPILKAN DIKLIK"
    );


    /*
     * Selalu kembali ke halaman 1
     */

    currentPage =
        1;


    loadTransaksi(
        1
    );

}


/* =========================================================
   KOMPATIBILITAS DENGAN VERSI LAMA
========================================================= */

function filterPeriode() {

    console.log(
        "TOMBOL TAMPILKAN DIKLIK"
    );


    filterData();

}


/* =========================================================
   TOMBOL SEMUA DATA
========================================================= */

function resetFilter() {

    console.log(
        "TOMBOL SEMUA DATA DIKLIK"
    );


    const ids = [

        "tanggalMulai",

        "tanggalAkhir",

        "filterJenis",

        "filterKategori"

    ];


    ids.forEach(
        function(id) {

            const el =
                document.getElementById(
                    id
                );


            if (el) {

                el.value =
                    "";

            }

        }
    );


    currentPage =
        1;


    loadTransaksi(
        1
    );

}


/* =========================================================
   KOMPATIBILITAS DENGAN VERSI LAMA
========================================================= */

function tampilkanSemuaData() {

    console.log(
        "TOMBOL SEMUA DATA DIKLIK"
    );


    resetFilter();

}


/* =========================================================
   ERROR
========================================================= */

function tampilkanError() {

    const tbody =
        document.getElementById(
            "tbodyTransaksi"
        );


    if (!tbody) {

        return;

    }


    while (
        tbody.firstChild
    ) {

        tbody.removeChild(
            tbody.firstChild
        );

    }


    const tr =
        document.createElement(
            "tr"
        );


    const td =
        document.createElement(
            "td"
        );


    td.colSpan =
        7;


    td.className =
        "text-center text-danger py-4";


    td.textContent =
        "Data transaksi tidak dapat dimuat. Silakan coba lagi.";


    tr.appendChild(
        td
    );


    tbody.appendChild(
        tr
    );

}


/* =========================================================
   EVENT BUTTON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "======================================"
        );

        console.log(
            "TRANSAKSI DOM READY"
        );

        console.log(
            "LIMIT AKTIF:",
            LIMIT
        );

        console.log(
            "======================================"
        );


        /* =================================================
           TOMBOL TAMPILKAN
        ================================================= */

        const btnTampilkan =
            document.getElementById(
                "btnTampilkan"
            );


        if (btnTampilkan) {

            btnTampilkan.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    console.log(
                        "TOMBOL TAMPILKAN DIKLIK"
                    );


                    filterData();

                }
            );

        } else {

            console.warn(
                "Tombol #btnTampilkan tidak ditemukan."
            );

        }


        /* =================================================
           TOMBOL SEMUA DATA
        ================================================= */

        const btnSemua =
            document.getElementById(
                "btnSemua"
            );


        if (btnSemua) {

            btnSemua.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    console.log(
                        "TOMBOL SEMUA DATA DIKLIK"
                    );


                    resetFilter();

                }
            );

        } else {

            console.warn(
                "Tombol #btnSemua tidak ditemukan."
            );

        }


        /* =================================================
           LOAD PERTAMA
        ================================================= */

        loadTransaksi(
            1
        );

    }
);
