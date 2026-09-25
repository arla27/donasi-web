"use strict";


/* =========================================================
   API
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
 * Mencegah request ganda
 */
let sedangMemuat = false;


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {

    const number =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(number);

}


/* =========================================================
   FORMAT TANGGAL
   HASIL: DD/MM/YYYY
========================================================= */

function formatTanggal(value) {

    if (!value) {
        return "-";
    }


    const str =
        String(value).trim();


    /* -----------------------------------------------------
       FORMAT YYYY-MM-DD
    ----------------------------------------------------- */

    let match =
        str.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (match) {

        return (
            match[3] +
            "/" +
            match[2] +
            "/" +
            match[1]
        );

    }


    /* -----------------------------------------------------
       FORMAT DD/MM/YYYY
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       FORMAT DD-MM-YYYY
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       ISO / JAVASCRIPT DATE
    ----------------------------------------------------- */

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
   SHOW LOADING
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


/* =========================================================
   HIDE LOADING
========================================================= */

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
   LOAD TRANSAKSI
========================================================= */

async function loadTransaksi(
    page = 1
) {

    /*
     * Jangan jalankan dua request bersamaan.
     */
    if (sedangMemuat) {

        return;

    }


    sedangMemuat = true;


    try {

        /* =================================================
           VALIDASI PAGE
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
           AMBIL FILTER TANGGAL
        ================================================= */

        const tanggalMulaiEl =
            document.getElementById(
                "tanggalMulai"
            );


        const tanggalAkhirEl =
            document.getElementById(
                "tanggalAkhir"
            );


        const filterJenisEl =
            document.getElementById(
                "filterJenis"
            );


        const filterKategoriEl =
            document.getElementById(
                "filterKategori"
            );


        const mulai =
            tanggalMulaiEl
                ? tanggalMulaiEl.value
                : "";


        const akhir =
            tanggalAkhirEl
                ? tanggalAkhirEl.value
                : "";


        const jenis =
            filterJenisEl
                ? filterJenisEl.value
                : "";


        const kategori =
            filterKategoriEl
                ? filterKategoriEl.value
                : "";


        /* =================================================
           VALIDASI TANGGAL
        ================================================= */

        if (
            mulai &&
            akhir &&
            mulai > akhir
        ) {

            alert(
                "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
            );

            return;

        }


        /* =================================================
           BUAT PARAMETER API
        ================================================= */

        const params =
            new URLSearchParams();


        params.set(
            "action",
            "transaksi"
        );


        /*
         * PAGE
         */

        params.set(
            "page",
            String(page)
        );


        /*
         * LIMIT
         *
         * PENTING:
         * SEKARANG 20, BUKAN 50.
         */

        params.set(
            "limit",
            String(LIMIT)
        );


        /* =================================================
           FILTER TANGGAL MULAI
        ================================================= */

        if (mulai) {

            params.set(
                "mulai",
                mulai
            );

        }


        /* =================================================
           FILTER TANGGAL AKHIR
        ================================================= */

        if (akhir) {

            params.set(
                "akhir",
                akhir
            );

        }


        /* =================================================
           FILTER JENIS
        ================================================= */

        if (jenis) {

            params.set(
                "jenis",
                String(
                    jenis
                )
                .trim()
                .toUpperCase()
            );

        }


        /* =================================================
           FILTER KATEGORI
        ================================================= */

        if (kategori) {

            params.set(
                "kategori",
                String(
                    kategori
                )
                .trim()
                .toUpperCase()
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
           URL
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
            "TANGGAL MULAI:",
            mulai
        );

        console.log(
            "TANGGAL AKHIR:",
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
            "API URL:",
            url
        );


        /* =================================================
           FETCH
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
           JSON
        ================================================= */

        let result;


        try {

            result =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                "Response server tidak valid."
            );

        }


        console.log(
            "TRANSAKSI RESPONSE:",
            result
        );


        /* =================================================
           VALIDASI RESPONSE
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
           DATA TRANSAKSI
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
           KPI
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
                Number(
                    result.saldo
                ) || 0;

        } else {

            saldo =
                totalMasuk -
                totalKeluar;

        }


        setText(
            "totalMasuk",
            formatRupiah(
                totalMasuk
            )
        );


        setText(
            "totalKeluar",
            formatRupiah(
                totalKeluar
            )
        );


        setText(
            "saldo",
            formatRupiah(
                saldo
            )
        );


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


        /* =================================================
           LOG
        ================================================= */

        console.log(
            "PAGE:",
            resultPage
        );

        console.log(
            "LIMIT:",
            result.limit
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
   TANPA INNERHTML UNTUK DATA API
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
     * Hapus isi lama
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
       DATA
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
                item.keterangan ||
                "-";


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
                item.petugas ||
                "-";


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
     * Hapus pagination lama
     */

    while (
        container.firstChild
    ) {

        container.removeChild(
            container.firstChild
        );

    }


    /* =================================================
       SATU HALAMAN
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
     * Kalau dekat awal
     */

    if (
        page <= 3
    ) {

        startPage = 1;

        endPage =
            Math.min(
                totalPages,
                5
            );

    }


    /*
     * Kalau dekat akhir
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
       HALAMAN TERAKHIR
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
   FILTER
========================================================= */

function filterData() {

    /*
     * Setiap kali filter berubah,
     * kembali ke halaman 1.
     */

    currentPage = 1;


    loadTransaksi(
        1
    );

}


/* =========================================================
   RESET FILTER
========================================================= */

function resetFilter() {

    const ids = [

        "tanggalMulai",

        "tanggalAkhir",

        "filterJenis",

        "filterKategori"

    ];


    ids.forEach(
        function(id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.value =
                    "";

            }

        }
    );


    currentPage = 1;


    loadTransaksi(
        1
    );

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


    td.colSpan = 7;

    td.className =
        "text-center text-danger py-4";


    /*
     * Jangan tampilkan error server
     * mentah ke browser.
     */

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
   START
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


        showLoading();


        loadTransaksi(
            1
        );

    }
);
