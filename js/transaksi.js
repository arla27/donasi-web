"use strict";


/* =========================================================
   API
========================================================= */

const API_URL = SHEET_URL;


/* =========================================================
   STATE
========================================================= */

let currentPage = 1;

const LIMIT = 50;

let sedangMemuat = false;

let controllerRequest = null;


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
   PARSE TANGGAL
========================================================= */

function parseTanggal(value) {

    if (!value) {
        return null;
    }


    const str =
        String(value).trim();


    /* ---------------------------------------------
       YYYY-MM-DD
    --------------------------------------------- */

    let match =
        str.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
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

    match =
        str.match(
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
       ISO / DATE
    --------------------------------------------- */

    const d =
        new Date(str);


    if (!isNaN(d.getTime())) {

        return d;

    }


    return null;

}


/* =========================================================
   FORMAT TANGGAL
   HASIL DD/MM/YYYY
========================================================= */

function formatTanggal(value) {

    if (!value) {
        return "-";
    }


    const d =
        parseTanggal(value);


    if (!d || isNaN(d.getTime())) {

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
   NORMALISASI TRANSAKSI
========================================================= */

function normalisasiTransaksi(data) {

    if (!Array.isArray(data)) {

        return [];

    }


    return data.map(
        function(item, index) {

            const jenis =
                String(
                    item?.jenis ?? ""
                )
                .trim()
                .toUpperCase();


            let kategori =
                String(
                    item?.kategori ?? ""
                )
                .trim()
                .toUpperCase();


            if (!kategori) {

                kategori =
                    "LAINNYA";

            }


            return {

                no:
                    item?.no ??
                    index + 1,

                tanggal:
                    String(
                        item?.tanggal ?? ""
                    ),

                jenis:
                    jenis === "MASUK"
                        ? "MASUK"
                        : jenis === "KELUAR"
                            ? "KELUAR"
                            : jenis,

                kategori:
                    kategori,

                keterangan:
                    String(
                        item?.keterangan ?? ""
                    ),

                nominal:
                    Number(
                        item?.nominal
                    ) || 0,

                petugas:
                    String(
                        item?.petugas ?? ""
                    )

            };

        }
    );

}


/* =========================================================
   VALIDASI RESPONSE API
========================================================= */

function validasiResponse(result) {

    if (!result) {

        throw new Error(
            "Response server kosong."
        );

    }


    if (
        result.success !== true
    ) {

        throw new Error(
            "Data transaksi tidak dapat dimuat."
        );

    }


    if (
        !Array.isArray(result.data)
    ) {

        throw new Error(
            "Format data transaksi tidak valid."
        );

    }


    return result;

}


/* =========================================================
   LOAD TRANSAKSI
========================================================= */

async function loadTransaksi(
    page = 1
) {

    if (sedangMemuat) {

        return;

    }


    sedangMemuat = true;


    try {

        /* =============================================
           VALIDASI PAGE
        ============================================= */

        page =
            Math.max(
                1,
                parseInt(page, 10) || 1
            );


        currentPage =
            page;


        /* =============================================
           BATALKAN REQUEST SEBELUMNYA
        ============================================= */

        if (controllerRequest) {

            controllerRequest.abort();

        }


        controllerRequest =
            new AbortController();


        /* =============================================
           AMBIL FILTER
        ============================================= */

        const mulaiEl =
            document.getElementById(
                "tanggalMulai"
            );


        const akhirEl =
            document.getElementById(
                "tanggalAkhir"
            );


        const jenisEl =
            document.getElementById(
                "filterJenis"
            );


        const kategoriEl =
            document.getElementById(
                "filterKategori"
            );


        const mulai =
            mulaiEl?.value || "";


        const akhir =
            akhirEl?.value || "";


        const jenis =
            jenisEl?.value || "";


        const kategori =
            kategoriEl?.value || "";


        /* =============================================
           VALIDASI TANGGAL
        ============================================= */

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


        /* =============================================
           BUAT PARAMETER
        ============================================= */

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
         * LIMIT TETAP DIKONTROL DI FRONTEND.
         * BACKEND JUGA WAJIB MEMBATASINYA.
         */

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


        /*
         * CACHE BUSTER
         */

        params.set(
            "_",
            String(
                Date.now()
            )
        );


        const url =
            API_URL +
            "?" +
            params.toString();


        console.log(
            "TRANSAKSI API REQUEST"
        );


        /* =============================================
           REQUEST
        ============================================= */

        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    cache: "no-store",

                    signal:
                        controllerRequest.signal,

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server tidak dapat dihubungi."
            );

        }


        /* =============================================
           JSON
        ============================================= */

        let result;


        try {

            result =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                "Response server bukan JSON yang valid."
            );

        }


        console.log(
            "TRANSAKSI RESPONSE:",
            result
        );


        /* =============================================
           VALIDASI
        ============================================= */

        validasiResponse(
            result
        );


        /* =============================================
           NORMALISASI
        ============================================= */

        const data =
            normalisasiTransaksi(
                result.data
            );


        /* =============================================
           RENDER
        ============================================= */

        renderTable(
            data
        );


        /* =============================================
           KPI
        ============================================= */

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


        /* =============================================
           PAGINATION
        ============================================= */

        const resultPage =
            Math.max(
                1,
                Number(
                    result.page
                ) || 1
            );


        const resultTotalPages =
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
            resultTotalPages
        );


    } catch (error) {

        /* =============================================
           REQUEST DIBATALKAN
        ============================================= */

        if (
            error.name ===
            "AbortError"
        ) {

            return;

        }


        console.error(
            "TRANSAKSI ERROR:",
            error
        );


        /*
         * JANGAN TAMPILKAN error.message
         * LANGSUNG KE USER.
         *
         * Ini menghindari informasi internal
         * server/API ikut tampil.
         */

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

function renderTable(data) {

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
     * Aman karena hanya menghapus
     * node DOM, bukan memasukkan data user.
     */

    while (
        tbody.firstChild
    ) {

        tbody.removeChild(
            tbody.firstChild
        );

    }


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
            "text-center";


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


            /* =========================================
               NO
            ========================================= */

            const tdNo =
                document.createElement(
                    "td"
                );


            tdNo.textContent =
                String(
                    item.no ?? "-"
                );


            /* =========================================
               TANGGAL
            ========================================= */

            const tdTanggal =
                document.createElement(
                    "td"
                );


            tdTanggal.textContent =
                formatTanggal(
                    item.tanggal
                );


            /* =========================================
               JENIS
            ========================================= */

            const tdJenis =
                document.createElement(
                    "td"
                );


            const badge =
                document.createElement(
                    "span"
                );


            if (
                item.jenis ===
                "MASUK"
            ) {

                badge.className =
                    "badge bg-success";

                badge.textContent =
                    "MASUK";

            } else {

                badge.className =
                    "badge bg-danger";

                badge.textContent =
                    item.jenis ||
                    "LAINNYA";

            }


            tdJenis.appendChild(
                badge
            );


            /* =========================================
               KATEGORI
            ========================================= */

            const tdKategori =
                document.createElement(
                    "td"
                );


            tdKategori.textContent =
                item.kategori ||
                "LAINNYA";


            /* =========================================
               KETERANGAN
            ========================================= */

            const tdKeterangan =
                document.createElement(
                    "td"
                );


            tdKeterangan.textContent =
                item.keterangan ||
                "-";


            /* =========================================
               NOMINAL
            ========================================= */

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


            /* =========================================
               PETUGAS
            ========================================= */

            const tdPetugas =
                document.createElement(
                    "td"
                );


            tdPetugas.textContent =
                item.petugas ||
                "-";


            /* =========================================
               APPEND
            ========================================= */

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

        return;

    }


    /*
     * pagination hanya berisi
     * element yang kita buat sendiri.
     */

    while (
        container.firstChild
    ) {

        container.removeChild(
            container.firstChild
        );

    }


    if (
        totalPages <= 1
    ) {

        return;

    }


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
        "‹ Sebelumnya";


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
       INFO
    ============================================= */

    const info =
        document.createElement(
            "span"
        );


    info.className =
        "mx-2";


    info.textContent =
        "Halaman " +
        page +
        " / " +
        totalPages;


    container.appendChild(
        info
    );


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
        "btn btn-sm btn-outline-primary ms-1";


    next.textContent =
        "Berikutnya ›";


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
        "text-center text-danger";


    /*
     * Pesan generik.
     * Jangan masukkan error server mentah.
     */

    td.textContent =
        "Data transaksi tidak dapat dimuat. Silakan coba lagi.";


    tr.appendChild(td);

    tbody.appendChild(tr);

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
