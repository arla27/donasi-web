// ==========================================================
// TRANSAKSI.JS
// ==========================================================
//
// HALAMAN TRANSAKSI KAS DKM
//
// FITUR:
//
// 1. Filter tanggal
// 2. Filter jenis MASUK / KELUAR
// 3. Filter kategori
// 4. Total transaksi
// 5. Total kas masuk
// 6. Total kas keluar
// 7. Saldo
// 8. Pagination
// 9. Previous / Next
// 10. Nomor halaman
//
// DATA DIAMBIL DARI:
//
// ?action=transaksi
//
// ==========================================================


// ==========================================================
// API
// ==========================================================

const API_URL = SHEET_URL;


// ==========================================================
// STATE
// ==========================================================

let currentPage = 1;


// JUMLAH DATA PER HALAMAN

const limit = 20;


// ==========================================================
// FORMAT RUPIAH
// ==========================================================

function formatRupiah(value) {

    const angka =
        Number(value) || 0;


    return new Intl.NumberFormat(
        'id-ID',
        {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(angka);

}


// ==========================================================
// FORMAT ANGKA
// ==========================================================

function formatAngka(value) {

    return new Intl.NumberFormat(
        'id-ID'
    ).format(
        Number(value) || 0
    );

}


// ==========================================================
// FORMAT TANGGAL
// ==========================================================

function formatTanggal(value) {

    if (!value) {

        return '-';

    }


    // ======================================================
    // YYYY-MM-DD
    // ======================================================

    if (

        typeof value === 'string' &&

        /^\d{4}-\d{2}-\d{2}$/.test(value)

    ) {

        const p =
            value.split('-');


        return (

            p[2] +
            '/' +
            p[1] +
            '/' +
            p[0]

        );

    }


    // ======================================================
    // ISO DATE
    // ======================================================

    const d =
        new Date(value);


    if (
        isNaN(
            d.getTime()
        )
    ) {

        return value;

    }


    return new Intl.DateTimeFormat(

        'id-ID',

        {
            timeZone:
                'Asia/Jakarta',

            day:
                '2-digit',

            month:
                '2-digit',

            year:
                'numeric'
        }

    ).format(d);

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(value) {

    return String(
        value ?? ''
    )

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}


// ==========================================================
// AMBIL NILAI FILTER
// ==========================================================

function getFilterValues() {

    const tanggalMulai =
        document.getElementById(
            'tanggalMulai'
        );


    const tanggalAkhir =
        document.getElementById(
            'tanggalAkhir'
        );


    const filterJenis =
        document.getElementById(
            'filterJenis'
        );


    const filterKategori =
        document.getElementById(
            'filterKategori'
        );


    return {

        mulai:
            tanggalMulai
                ? tanggalMulai.value
                : '',

        akhir:
            tanggalAkhir
                ? tanggalAkhir.value
                : '',

        jenis:
            filterJenis
                ? filterJenis.value
                : '',

        kategori:
            filterKategori
                ? filterKategori.value
                : ''

    };

}


// ==========================================================
// LOAD TRANSAKSI
// ==========================================================

async function loadTransaksi(
    page = 1
) {

    try {

        // ==================================================
        // NORMALISASI PAGE
        // ==================================================

        page =
            parseInt(
                page,
                10
            );


        if (
            isNaN(page) ||
            page < 1
        ) {

            page = 1;

        }


        currentPage =
            page;


        // ==================================================
        // AMBIL FILTER
        // ==================================================

        const filter =
            getFilterValues();


        console.log(
            '===================================='
        );


        console.log(
            'LOAD TRANSAKSI'
        );


        console.log(
            'PAGE:',
            page
        );


        console.log(
            'FILTER:',
            filter
        );


        // ==================================================
        // VALIDASI TANGGAL
        // ==================================================

        if (
            filter.mulai &&
            filter.akhir &&
            filter.mulai >
            filter.akhir
        ) {

            alert(
                'Tanggal mulai tidak boleh lebih besar dari tanggal akhir.'
            );


            return;

        }


        // ==================================================
        // PARAMETER API
        // ==================================================

        const params =
            new URLSearchParams();


        params.set(
            'action',
            'transaksi'
        );


        params.set(
            'page',
            page
        );


        params.set(
            'limit',
            limit
        );


        // ==================================================
        // FILTER TANGGAL MULAI
        // ==================================================

        if (
            filter.mulai
        ) {

            params.set(
                'mulai',
                filter.mulai
            );

        }


        // ==================================================
        // FILTER TANGGAL AKHIR
        // ==================================================

        if (
            filter.akhir
        ) {

            params.set(
                'akhir',
                filter.akhir
            );

        }


        // ==================================================
        // FILTER JENIS
        // ==================================================

        if (
            filter.jenis
        ) {

            params.set(
                'jenis',
                filter.jenis
            );

        }


        // ==================================================
        // FILTER KATEGORI
        // ==================================================

        if (
            filter.kategori
        ) {

            params.set(
                'kategori',
                filter.kategori
            );

        }


        // ==================================================
        // CACHE BUSTER
        // ==================================================

        params.set(
            '_',
            Date.now()
        );


        // ==================================================
        // URL
        // ==================================================

        const url =
            API_URL +
            '?' +
            params.toString();


        console.log(
            'API URL:',
            url
        );


        // ==================================================
        // LOADING
        // ==================================================

        showLoading();


        // ==================================================
        // FETCH
        // ==================================================

        const response =
            await fetch(

                url,

                {
                    method:
                        'GET',

                    cache:
                        'no-store'
                }

            );


        console.log(
            'HTTP STATUS:',
            response.status
        );


        // ==================================================
        // CEK HTTP
        // ==================================================

        if (
            !response.ok
        ) {

            throw new Error(

                'HTTP Error ' +
                response.status

            );

        }


        // ==================================================
        // JSON
        // ==================================================

        const result =
            await response.json();


        console.log(
            'API RESPONSE:',
            result
        );


        // ==================================================
        // CEK SUCCESS
        // ==================================================

        if (
            !result.success
        ) {

            throw new Error(

                result.message ||
                'API gagal'

            );

        }


        // ==================================================
        // RENDER TABLE
        // ==================================================

        renderTable(
            result.data || []
        );


        // ==================================================
        // UPDATE TOTAL TRANSAKSI
        // ==================================================

        setText(

            'jumlahTransaksi',

            formatAngka(
                result.total || 0
            )

        );


        // ==================================================
        // UPDATE TOTAL MASUK
        // ==================================================

        setText(

            'totalMasuk',

            formatRupiah(
                result.totalMasuk || 0
            )

        );


        // ==================================================
        // UPDATE TOTAL KELUAR
        // ==================================================

        setText(

            'totalKeluar',

            formatRupiah(
                result.totalKeluar || 0
            )

        );


        // ==================================================
        // UPDATE SALDO
        // ==================================================

        setText(

            'saldo',

            formatRupiah(
                result.saldo || 0
            )

        );


        // ==================================================
        // OPTIONAL ID LAIN
        // ==================================================

        setText(

            'rekapMasuk',

            formatRupiah(
                result.totalMasuk || 0
            )

        );


        setText(

            'rekapKeluar',

            formatRupiah(
                result.totalKeluar || 0
            )

        );


        setText(

            'rekapSaldo',

            formatRupiah(
                result.saldo || 0
            )

        );


        // ==================================================
        // PERIODE
        // ==================================================

        updatePeriode(
            filter.mulai,
            filter.akhir
        );


        // ==================================================
        // PAGINATION
        // ==================================================

        renderPagination(

            result.page || page,

            result.totalPages || 1,

            result.total || 0

        );


        // ==================================================
        // HIDE LOADING
        // ==================================================

        hideLoading();


        console.log(
            'TRANSAKSI BERHASIL'
        );


    }

    catch (error) {

        console.error(
            'ERROR LOAD TRANSAKSI:',
            error
        );


        hideLoading();


        showError(
            error.message
        );

    }

}


// ==========================================================
// RENDER TABLE
// ==========================================================

function renderTable(
    data
) {

    const tbody =
        document.getElementById(
            'tbodyTransaksi'
        );


    if (!tbody) {

        console.error(
            'tbodyTransaksi tidak ditemukan'
        );


        return;

    }


    tbody.innerHTML =
        '';


    // ======================================================
    // KOSONG
    // ======================================================

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted py-4"
                >

                    Data tidak ditemukan

                </td>

            </tr>

        `;


        return;

    }


    // ======================================================
    // RENDER DATA
    // ======================================================

    data.forEach(

        function(
            item
        ) {

            const tr =
                document.createElement(
                    'tr'
                );


            // ==================================================
            // BADGE
            // ==================================================

            let badgeClass =
                'bg-secondary';


            if (
                item.jenis ===
                'MASUK'
            ) {

                badgeClass =
                    'bg-success';

            }


            if (
                item.jenis ===
                'KELUAR'
            ) {

                badgeClass =
                    'bg-danger';

            }


            // ==================================================
            // ROW
            // ==================================================

            tr.innerHTML = `

                <td>

                    ${escapeHtml(
                        item.no
                    )}

                </td>


                <td>

                    ${formatTanggal(
                        item.tanggal
                    )}

                </td>


                <td>

                    <span
                        class="badge ${badgeClass}"
                    >

                        ${escapeHtml(
                            item.jenis
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHtml(
                        item.kategori
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        item.keterangan
                    )}

                </td>


                <td class="text-end">

                    ${formatRupiah(
                        item.nominal
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        item.petugas ||
                        '-'
                    )}

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }

    );

}


// ==========================================================
// PAGINATION
// ==========================================================
//
// Dibuat dengan:
//
// [‹ Sebelumnya]
// [1]
// [2]
// [3]
// ...
// [Berikutnya ›]
//
// ==========================================================

function renderPagination(

    page,

    totalPages,

    totalData

) {

    const container =
        document.getElementById(
            'pagination'
        );


    if (!container) {

        console.error(
            'Element pagination tidak ditemukan'
        );


        return;

    }


    container.innerHTML =
        '';


    // ======================================================
    // TOTAL DATA INFO
    // ======================================================

    const info =
        document.createElement(
            'div'
        );


    info.className =
        'text-muted small me-3';


    info.textContent =

        'Total ' +

        formatAngka(
            totalData
        ) +

        ' transaksi';


    container.appendChild(
        info
    );


    // ======================================================
    // JIKA HANYA 1 HALAMAN
    // ======================================================

    if (
        totalPages <= 1
    ) {

        return;

    }


    // ======================================================
    // PREVIOUS
    // ======================================================

    const prev =
        document.createElement(
            'button'
        );


    prev.type =
        'button';


    prev.className =
        'btn btn-sm btn-outline-primary';


    prev.textContent =
        '‹ Sebelumnya';


    prev.disabled =
        page <= 1;


    prev.addEventListener(

        'click',

        function() {

            if (
                currentPage > 1
            ) {

                loadTransaksi(

                    currentPage - 1

                );

            }

        }

    );


    container.appendChild(
        prev
    );


    // ======================================================
    // NOMOR HALAMAN
    // ======================================================

    const maxButtons =
        7;


    let startPage =
        Math.max(
            1,
            page - 3
        );


    let endPage =
        Math.min(
            totalPages,
            startPage +
            maxButtons -
            1
        );


    // ======================================================
    // SESUAIKAN START
    // ======================================================

    if (
        endPage -
        startPage +
        1 <
        maxButtons
    ) {

        startPage =
            Math.max(
                1,
                endPage -
                maxButtons +
                1
            );

    }


    // ======================================================
    // FIRST PAGE
    // ======================================================

    if (
        startPage > 1
    ) {

        appendPageButton(
            container,
            1,
            page
        );


        if (
            startPage > 2
        ) {

            appendDots(
                container
            );

        }

    }


    // ======================================================
    // PAGE BUTTONS
    // ======================================================

    for (

        let i =
            startPage;

        i <=
        endPage;

        i++

    ) {

        appendPageButton(

            container,

            i,

            page

        );

    }


    // ======================================================
    // LAST PAGE
    // ======================================================

    if (
        endPage <
        totalPages
    ) {

        if (
            endPage <
            totalPages - 1
        ) {

            appendDots(
                container
            );

        }


        appendPageButton(

            container,

            totalPages,

            page

        );

    }


    // ======================================================
    // NEXT
    // ======================================================

    const next =
        document.createElement(
            'button'
        );


    next.type =
        'button';


    next.className =
        'btn btn-sm btn-outline-primary';


    next.textContent =
        'Berikutnya ›';


    next.disabled =
        page >= totalPages;


    next.addEventListener(

        'click',

        function() {

            if (
                currentPage <
                totalPages
            ) {

                loadTransaksi(

                    currentPage + 1

                );

            }

        }

    );


    container.appendChild(
        next
    );

}


// ==========================================================
// APPEND PAGE BUTTON
// ==========================================================

function appendPageButton(

    container,

    pageNumber,

    activePage

) {

    const button =
        document.createElement(
            'button'
        );


    button.type =
        'button';


    button.className =
        'btn btn-sm ';


    if (
        pageNumber ===
        activePage
    ) {

        button.className +=
            'btn-primary';

    }

    else {

        button.className +=
            'btn-outline-primary';

    }


    button.textContent =
        pageNumber;


    button.addEventListener(

        'click',

        function() {

            if (
                pageNumber !==
                currentPage
            ) {

                loadTransaksi(
                    pageNumber
                );

            }

        }

    );


    container.appendChild(
        button
    );

}


// ==========================================================
// DOTS
// ==========================================================

function appendDots(
    container
) {

    const span =
        document.createElement(
            'span'
        );


    span.className =
        'px-2';


    span.textContent =
        '...';


    container.appendChild(
        span
    );

}


// ==========================================================
// FILTER
// ==========================================================

function filterData() {

    console.log(
        'FILTER DATA'
    );


    // SELALU KEMBALI HALAMAN 1

    loadTransaksi(
        1
    );

}


// ==========================================================
// FILTER PERIODE
// ==========================================================
//
// Dipertahankan untuk kompatibilitas
// dengan tombol lama:
// Tampilkan
//
// ==========================================================

function filterPeriode() {

    filterData();

}


// ==========================================================
// RESET FILTER
// ==========================================================

function resetFilter() {

    console.log(
        'RESET FILTER'
    );


    const ids = [

        'tanggalMulai',

        'tanggalAkhir',

        'filterJenis',

        'filterKategori'

    ];


    ids.forEach(

        function(id) {

            const el =
                document.getElementById(
                    id
                );


            if (el) {

                el.value =
                    '';

            }

        }

    );


    updatePeriode(
        '',
        ''
    );


    loadTransaksi(
        1
    );

}


// ==========================================================
// TAMPILKAN SEMUA
// ==========================================================
//
// Kompatibilitas dengan tombol:
// "Semua Data"
//
// ==========================================================

function tampilkanSemuaData() {

    resetFilter();

}


// ==========================================================
// UPDATE PERIODE
// ==========================================================

function updatePeriode(

    mulai,

    akhir

) {

    const el =
        document.getElementById(
            'periode'
        );


    if (!el) {

        return;

    }


    if (
        mulai &&
        akhir
    ) {

        el.textContent =

            formatTanggal(
                mulai
            ) +

            ' s/d ' +

            formatTanggal(
                akhir
            );

    }

    else if (
        mulai
    ) {

        el.textContent =

            'Mulai ' +

            formatTanggal(
                mulai
            );

    }

    else if (
        akhir
    ) {

        el.textContent =

            'Sampai ' +

            formatTanggal(
                akhir
            );

    }

    else {

        el.textContent =
            'Semua Data';

    }

}


// ==========================================================
// SET TEXT
// ==========================================================

function setText(
    id,
    value
) {

    const el =
        document.getElementById(
            id
        );


    if (el) {

        el.textContent =
            value;

    }

}


// ==========================================================
// LOADING
// ==========================================================

function showLoading() {

    const el =
        document.getElementById(
            'loadingOverlay'
        );


    if (el) {

        el.style.display =
            'flex';

    }

}


// ==========================================================
// HIDE LOADING
// ==========================================================

function hideLoading() {

    const el =
        document.getElementById(
            'loadingOverlay'
        );


    if (el) {

        el.style.display =
            'none';

    }

}


// ==========================================================
// ERROR
// ==========================================================

function showError(
    message
) {

    console.error(
        'TRANSAKSI ERROR:',
        message
    );


    const tbody =
        document.getElementById(
            'tbodyTransaksi'
        );


    if (tbody) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-danger py-4"
                >

                    Gagal memuat data.

                    <br>

                    <small>

                        ${escapeHtml(
                            message
                        )}

                    </small>

                </td>

            </tr>

        `;

    }

}


// ==========================================================
// EVENT DOM READY
// ==========================================================

document.addEventListener(

    'DOMContentLoaded',

    function() {

        console.log(
            '===================================='
        );


        console.log(
            'TRANSAKSI DOM READY'
        );


        console.log(
            'API:',
            API_URL
        );


        // ==================================================
        // TOMBOL FILTER
        // ==================================================

        const btnTampilkan =
            document.getElementById(
                'btnTampilkan'
            );


        if (
            btnTampilkan
        ) {

            btnTampilkan.addEventListener(

                'click',

                function(e) {

                    e.preventDefault();

                    filterData();

                }

            );

        }


        // ==================================================
        // TOMBOL SEMUA DATA
        // ==================================================

        const btnSemua =
            document.getElementById(
                'btnSemua'
            );


        if (
            btnSemua
        ) {

            btnSemua.addEventListener(

                'click',

                function(e) {

                    e.preventDefault();

                    resetFilter();

                }

            );

        }


        // ==================================================
        // FILTER JENIS
        // ==================================================

        const filterJenis =
            document.getElementById(
                'filterJenis'
            );


        if (
            filterJenis
        ) {

            filterJenis.addEventListener(

                'change',

                function() {

                    filterData();

                }

            );

        }


        // ==================================================
        // FILTER KATEGORI
        // ==================================================

        const filterKategori =
            document.getElementById(
                'filterKategori'
            );


        if (
            filterKategori
        ) {

            filterKategori.addEventListener(

                'change',

                function() {

                    filterData();

                }

            );

        }


        // ==================================================
        // LOAD AWAL
        // ==================================================

        loadTransaksi(
            1
        );

    }

);
