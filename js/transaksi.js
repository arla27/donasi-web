"use strict";


/* =========================================================
   API
========================================================= */

const API_URL = SHEET_URL;


/* =========================================================
   PAGINATION
========================================================= */

let currentPage = 1;

const LIMIT = 20;

let sedangMemuat = false;


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(
        Number(value) || 0
    );

}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(value) {

    if (!value) {
        return "-";
    }

    const str =
        String(value).trim();


    /* YYYY-MM-DD */

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


    /* DD/MM/YYYY */

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

function setText(id, value) {

    const el =
        document.getElementById(id);

    if (el) {

        el.textContent =
            value;

    }

}


/* =========================================================
   LOAD TRANSAKSI
========================================================= */

async function loadTransaksi(page) {

    if (sedangMemuat) {
        return;
    }


    sedangMemuat = true;


    try {

        /* ---------------------------------------------
           PAGE
        --------------------------------------------- */

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


        /* ---------------------------------------------
           FILTER
        --------------------------------------------- */

        const mulai =
            document.getElementById(
                "tanggalMulai"
            )?.value || "";


        const akhir =
            document.getElementById(
                "tanggalAkhir"
            )?.value || "";


        const jenis =
            document.getElementById(
                "filterJenis"
            )?.value || "";


        const kategori =
            document.getElementById(
                "filterKategori"
            )?.value || "";


        /* ---------------------------------------------
           VALIDASI TANGGAL
        --------------------------------------------- */

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


        /* ---------------------------------------------
           PARAMETER API
        --------------------------------------------- */

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


        params.set(
            "limit",
            String(LIMIT)
        );


        if (mulai) {

            params.set(
                "mulai",
                mulai
            );

        }


        if (akhir) {

            params.set(
                "akhir",
                akhir
            );

        }


        if (jenis) {

            params.set(
                "jenis",
                jenis
                    .trim()
                    .toUpperCase()
            );

        }


        if (kategori) {

            params.set(
                "kategori",
                kategori
                    .trim()
                    .toUpperCase()
            );

        }


        /* cache bust */

        params.set(
            "_",
            Date.now()
        );


        const url =
            API_URL +
            "?" +
            params.toString();


        console.log(
            "================================"
        );

        console.log(
            "TRANSAKSI REQUEST"
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


        /* ---------------------------------------------
           REQUEST
        --------------------------------------------- */

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


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "TRANSAKSI RESPONSE:",
            result
        );


        /* ---------------------------------------------
           VALIDASI
        --------------------------------------------- */

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "API transaksi gagal."
            );

        }


        /* ---------------------------------------------
           DATA
        --------------------------------------------- */

        const data =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        /* ---------------------------------------------
           RENDER TABLE
        --------------------------------------------- */

        renderTable(
            data
        );


        /* ---------------------------------------------
           KPI
        --------------------------------------------- */

        const totalMasuk =
            Number(
                result.totalMasuk
            ) || 0;


        const totalKeluar =
            Number(
                result.totalKeluar
            ) || 0;


        const saldo =
            result.saldo !== undefined
                ? Number(result.saldo) || 0
                : totalMasuk - totalKeluar;


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


        /* ---------------------------------------------
           PAGINATION
        --------------------------------------------- */

        const resultPage =
            Number(
                result.page
            ) || 1;


        const totalPages =
            Number(
                result.totalPages
            ) || 1;


        currentPage =
            resultPage;


        renderPagination(
            resultPage,
            totalPages
        );


        console.log(
            "PAGE RESULT:",
            resultPage
        );

        console.log(
            "TOTAL DATA:",
            result.total
        );

        console.log(
            "TOTAL PAGE:",
            totalPages
        );

        console.log(
            "================================"
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
========================================================= */

function renderTable(data) {

    const tbody =
        document.getElementById(
            "tbodyTransaksi"
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


        tr.appendChild(td);

        tbody.appendChild(tr);

        return;

    }


    data.forEach(
        function(item) {

            const tr =
                document.createElement(
                    "tr"
                );


            /* NO */

            const tdNo =
                document.createElement(
                    "td"
                );

            tdNo.textContent =
                item.no ?? "-";


            /* TANGGAL */

            const tdTanggal =
                document.createElement(
                    "td"
                );

            tdTanggal.textContent =
                formatTanggal(
                    item.tanggal
                );


            /* JENIS */

            const tdJenis =
                document.createElement(
                    "td"
                );


            const badge =
                document.createElement(
                    "span"
                );


            if (
                String(
                    item.jenis || ""
                ).toUpperCase() === "MASUK"
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


            /* KATEGORI */

            const tdKategori =
                document.createElement(
                    "td"
                );

            tdKategori.textContent =
                item.kategori ||
                "LAINNYA";


            /* KETERANGAN */

            const tdKeterangan =
                document.createElement(
                    "td"
                );

            tdKeterangan.textContent =
                item.keterangan ||
                "-";


            /* NOMINAL */

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


            /* PETUGAS */

            const tdPetugas =
                document.createElement(
                    "td"
                );

            tdPetugas.textContent =
                item.petugas ||
                "-";


            tr.appendChild(tdNo);

            tr.appendChild(tdTanggal);

            tr.appendChild(tdJenis);

            tr.appendChild(tdKategori);

            tr.appendChild(tdKeterangan);

            tr.appendChild(tdNominal);

            tr.appendChild(tdPetugas);


            tbody.appendChild(tr);

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


    container.innerHTML = "";


    if (
        totalPages <= 1
    ) {

        return;

    }


    /* =============================================
       FIRST
    ============================================= */

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

            if (
                page > 1
            ) {

                loadTransaksi(1);

            }

        }
    );


    container.appendChild(
        first
    );


    /* =============================================
       PREVIOUS
    ============================================= */

    const prev =
        document.createElement(
            "button"
        );


    prev.type =
        "button";


    prev.className =
        "btn btn-sm btn-outline-primary me-1";


    prev.textContent =
        "‹";


    prev.title =
        "Sebelumnya";


    prev.disabled =
        page <= 1;


    prev.addEventListener(
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
        prev
    );


    /* =============================================
       NOMOR HALAMAN
    ============================================= */

    const start =
        Math.max(
            1,
            page - 2
        );


    const end =
        Math.min(
            totalPages,
            page + 2
        );


    for (
        let i = start;
        i <= end;
        i++
    ) {

        const btn =
            document.createElement(
                "button"
            );


        btn.type =
            "button";


        btn.className =
            "btn btn-sm me-1 " +
            (
                i === page
                    ? "btn-primary"
                    : "btn-outline-primary"
            );


        btn.textContent =
            String(i);


        btn.disabled =
            i === page;


        btn.addEventListener(
            "click",
            function() {

                loadTransaksi(i);

            }
        );


        container.appendChild(
            btn
        );

    }


    /* =============================================
       NEXT
    ============================================= */

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
        "Berikutnya";


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


    /* =============================================
       LAST
    ============================================= */

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

    loadTransaksi(1);

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


    loadTransaksi(1);

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


    tbody.innerHTML = "";


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


    td.textContent =
        "Data transaksi tidak dapat dimuat. Silakan coba lagi.";


    tr.appendChild(td);

    tbody.appendChild(tr);

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "TRANSAKSI DOM READY"
        );


        showLoading();


        loadTransaksi(1);

    }
);
