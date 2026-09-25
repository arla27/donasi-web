// ==========================================================
// APP.JS - DASHBOARD KAS DKM
// ==========================================================
//
// SUMBER DATA:
//
// 1. TOTAL KAS MASUK
//    → REKAP!B3
//
// 2. TOTAL KAS KELUAR
//    → REKAP!B4
//
// 3. SALDO AKHIR
//    → REKAP!B5
//
// 4. REKAP KATEGORI
//    → KAS_DKM
//
// 5. 20 TRANSAKSI TERAKHIR
//    → KAS_DKM
//
// URUTAN 20 TRANSAKSI:
// TERLAMA → TERBARU
// TRANSAKSI TERBARU BERADA PALING BAWAH
//
// ==========================================================


console.log("====================================");
console.log("APP.JS START");
console.log("====================================");


// ==========================================================
// API URL
// ==========================================================

const API_URL = SHEET_URL;


// ==========================================================
// FORMAT RUPIAH
// ==========================================================

function formatRupiah(value) {

    const angka = Number(value) || 0;

    return new Intl.NumberFormat('id-ID', {

        style: 'currency',

        currency: 'IDR',

        minimumFractionDigits: 0,

        maximumFractionDigits: 0

    }).format(angka);

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
//
// Input:
// 2026-01-14
//
// Output:
// 14/01/2026
//
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
// LOAD DASHBOARD
// ==========================================================

async function loadDashboard() {

    console.log(
        "===================================="
    );

    console.log(
        "LOAD DASHBOARD"
    );

    console.log(
        "===================================="
    );


    try {

        // ==================================================
        // BUAT URL API
        // ==================================================

        const url =

            API_URL +

            '?action=dashboard&_=' +

            Date.now();


        console.log(
            "SHEET_URL:",
            SHEET_URL
        );


        console.log(
            "API URL:",
            url
        );


        // ==================================================
        // REQUEST
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
            "HTTP STATUS:",
            response.status
        );


        // ==================================================
        // CEK HTTP
        // ==================================================

        if (!response.ok) {

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
            "RESPONSE API:",
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

                'API mengembalikan error'

            );

        }


        // ==================================================
        // DEBUG DATA
        // ==================================================

        console.log(
            "TOTAL MASUK:",
            result.totalMasuk
        );


        console.log(
            "TOTAL KELUAR:",
            result.totalKeluar
        );


        console.log(
            "SALDO:",
            result.saldo
        );


        console.log(
            "JUMLAH TRANSAKSI:",
            result.jumlahTransaksi
        );


        console.log(
            "KATEGORI MASUK:",
            result.kategoriMasuk
        );


        console.log(
            "KATEGORI KELUAR:",
            result.kategoriKeluar
        );


        console.log(
            "20 TRANSAKSI:",
            result.transaksiTerakhir
        );


        // ==================================================
        // KPI TOTAL KAS MASUK
        // ==================================================

        setText(

            'totalMasuk',

            formatRupiah(
                result.totalMasuk
            )

        );


        // ==================================================
        // KPI TOTAL KAS KELUAR
        // ==================================================

        setText(

            'totalKeluar',

            formatRupiah(
                result.totalKeluar
            )

        );


        // ==================================================
        // KPI SALDO AKHIR
        // ==================================================

        setText(

            'saldo',

            formatRupiah(
                result.saldo
            )

        );


        // ==================================================
        // JUMLAH TRANSAKSI
        // ==================================================

        setText(

            'jumlahTransaksi',

            formatAngka(
                result.jumlahTransaksi || 0
            )

        );


        // ==================================================
        // REKAP KAS MASUK PER KATEGORI
        // ==================================================

        renderKategoriMasuk(

            result.kategoriMasuk ||

            []

        );


        // ==================================================
        // REKAP KAS KELUAR PER KATEGORI
        // ==================================================

        renderKategoriKeluar(

            result.kategoriKeluar ||

            []

        );


        // ==================================================
        // 20 TRANSAKSI TERAKHIR
        // ==================================================

        renderTransaksiTerakhir(

            result.transaksiTerakhir ||

            []

        );


        // ==================================================
        // TOTAL KATEGORI MASUK
        // ==================================================

        const totalKategoriMasuk =
            hitungTotalKategori(

                result.kategoriMasuk ||

                []

            );


        setText(

            'totalKategoriMasuk',

            formatRupiah(
                totalKategoriMasuk
            )

        );


        // ==================================================
        // TOTAL KATEGORI KELUAR
        // ==================================================

        const totalKategoriKeluar =
            hitungTotalKategori(

                result.kategoriKeluar ||

                []

            );


        setText(

            'totalKategoriKeluar',

            formatRupiah(
                totalKategoriKeluar
            )

        );


        // ==================================================
        // HILANGKAN LOADING
        // ==================================================

        hideLoading();


        console.log(
            "===================================="
        );

        console.log(
            "DASHBOARD BERHASIL DIMUAT"
        );

        console.log(
            "===================================="
        );

    }


    catch (error) {

        console.error(
            "===================================="
        );

        console.error(
            "ERROR DASHBOARD:",
            error
        );

        console.error(
            "===================================="
        );


        hideLoading();


        showError(
            error.message
        );

    }

}


// ==========================================================
// HITUNG TOTAL KATEGORI
// ==========================================================

function hitungTotalKategori(
    data
) {

    if (
        !Array.isArray(data)
    ) {

        return 0;

    }


    return data.reduce(

        function(
            total,
            item
        ) {

            return (

                total +

                (
                    Number(
                        item.jumlah
                    ) || 0
                )

            );

        },

        0

    );

}


// ==========================================================
// RENDER KATEGORI KAS MASUK
// ==========================================================

function renderKategoriMasuk(
    data
) {

    const tbody =
        document.getElementById(

            'tbodyRekapMasuk'

        );


    if (!tbody) {

        console.error(

            'ELEMENT tbodyRekapMasuk TIDAK DITEMUKAN'

        );

        return;

    }


    // ======================================================
    // CLEAR
    // ======================================================

    tbody.innerHTML = '';


    // ======================================================
    // VALIDASI ARRAY
    // ======================================================

    if (
        !Array.isArray(data)
    ) {

        data = [];

    }


    // ======================================================
    // SORT JUMLAH TERBESAR
    // ======================================================

    data.sort(

        function(
            a,
            b
        ) {

            return (

                (
                    Number(
                        b.jumlah
                    ) || 0
                )

                -

                (
                    Number(
                        a.jumlah
                    ) || 0
                )

            );

        }

    );


    // ======================================================
    // JIKA KOSONG
    // ======================================================

    if (
        data.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center"
                >

                    Belum ada data

                </td>

            </tr>

        `;

        return;

    }


    // ======================================================
    // RENDER
    // ======================================================

    data.forEach(

        function(
            item,
            index
        ) {

            const tr =
                document.createElement(
                    'tr'
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(
                        item.kategori
                    )}
                </td>

                <td>
                    ${formatAngka(
                        item.transaksi || 0
                    )}
                </td>

                <td class="text-end">

                    ${formatRupiah(
                        item.jumlah || 0
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
// RENDER KATEGORI KAS KELUAR
// ==========================================================

function renderKategoriKeluar(
    data
) {

    const tbody =
        document.getElementById(

            'tbodyRekapKeluar'

        );


    if (!tbody) {

        console.error(

            'ELEMENT tbodyRekapKeluar TIDAK DITEMUKAN'

        );

        return;

    }


    // ======================================================
    // CLEAR
    // ======================================================

    tbody.innerHTML = '';


    // ======================================================
    // VALIDASI ARRAY
    // ======================================================

    if (
        !Array.isArray(data)
    ) {

        data = [];

    }


    // ======================================================
    // SORT JUMLAH TERBESAR
    // ======================================================

    data.sort(

        function(
            a,
            b
        ) {

            return (

                (
                    Number(
                        b.jumlah
                    ) || 0
                )

                -

                (
                    Number(
                        a.jumlah
                    ) || 0
                )

            );

        }

    );


    // ======================================================
    // JIKA KOSONG
    // ======================================================

    if (
        data.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center"
                >

                    Belum ada data

                </td>

            </tr>

        `;

        return;

    }


    // ======================================================
    // RENDER
    // ======================================================

    data.forEach(

        function(
            item,
            index
        ) {

            const tr =
                document.createElement(
                    'tr'
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(
                        item.kategori
                    )}
                </td>

                <td>
                    ${formatAngka(
                        item.transaksi || 0
                    )}
                </td>

                <td class="text-end">

                    ${formatRupiah(
                        item.jumlah || 0
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
// RENDER 20 TRANSAKSI TERAKHIR
// ==========================================================
//
// PENTING:
//
// Kita tidak langsung reverse semua data.
//
// Proses:
//
// 1. Urutkan SEMUA data
//    TERBARU → TERLAMA
//
// 2. Ambil 20 pertama
//    = 20 transaksi terbaru
//
// 3. Reverse 20 transaksi tersebut
//    = TERLAMA → TERBARU
//
// Sehingga:
//
// BARIS ATAS
//     ↓
// transaksi paling lama dari 20 terakhir
//
// BARIS BAWAH
//     ↓
// transaksi paling baru
//
// ==========================================================

function renderTransaksiTerakhir(
    data
) {

    const tbody =
        document.getElementById(

            'tbodyTerakhir'

        );


    if (!tbody) {

        console.error(

            'ELEMENT tbodyTerakhir TIDAK DITEMUKAN'

        );

        return;

    }


    // ======================================================
    // CLEAR
    // ======================================================

    tbody.innerHTML = '';


    // ======================================================
    // VALIDASI
    // ======================================================

    if (
        !Array.isArray(data)
    ) {

        data = [];

    }


    // ======================================================
    // COPY ARRAY
    // ======================================================
    //
    // Jangan sort array asli dari response.
    //
    // ======================================================

    let transaksi =
        data.slice();


    // ======================================================
    // URUTKAN:
    //
    // TERBARU → TERLAMA
    // ======================================================

    transaksi.sort(

        function(
            a,
            b
        ) {

            const dateA =
                getDateValue(
                    a.tanggal
                );


            const dateB =
                getDateValue(
                    b.tanggal
                );


            // ----------------------------------------------
            // TANGGAL
            // ----------------------------------------------

            if (
                dateB !== dateA
            ) {

                return (
                    dateB -
                    dateA
                );

            }


            // ----------------------------------------------
            // JIKA TANGGAL SAMA
            // NOMOR TERBESAR = TERBARU
            // ----------------------------------------------

            return (

                (
                    Number(
                        b.no
                    ) || 0
                )

                -

                (
                    Number(
                        a.no
                    ) || 0
                )

            );

        }

    );


    // ======================================================
    // AMBIL 20 TRANSAKSI TERBARU
    // ======================================================

    transaksi =
        transaksi.slice(
            0,
            20
        );


    // ======================================================
    // BALIK URUTAN
    //
    // SEKARANG:
    //
    // TERLAMA
    //   ↓
    // TERBARU
    //
    // ======================================================

    transaksi.reverse();


    console.log(
        "20 TRANSAKSI SETELAH SORT:",
        transaksi
    );


    // ======================================================
    // JIKA KOSONG
    // ======================================================

    if (
        transaksi.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center"
                >

                    Belum ada transaksi

                </td>

            </tr>

        `;

        return;

    }


    // ======================================================
    // RENDER
    // ======================================================

    transaksi.forEach(

        function(
            item
        ) {

            const tr =
                document.createElement(
                    'tr'
                );


            // ----------------------------------------------
            // BADGE JENIS
            // ----------------------------------------------

            let badgeClass =
                'bg-secondary';


            if (
                item.jenis === 'MASUK'
            ) {

                badgeClass =
                    'bg-success';

            }


            if (
                item.jenis === 'KELUAR'
            ) {

                badgeClass =
                    'bg-danger';

            }


            // ----------------------------------------------
            // HTML
            // ----------------------------------------------

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

            `;


            tbody.appendChild(
                tr
            );

        }

    );

}


// ==========================================================
// GET DATE VALUE
// ==========================================================
//
// Mengubah tanggal menjadi angka timestamp
// untuk keperluan sorting.
//
// ==========================================================

function getDateValue(
    value
) {

    if (!value) {

        return 0;

    }


    // ======================================================
    // YYYY-MM-DD
    // ======================================================

    if (

        typeof value === 'string' &&

        /^\d{4}-\d{2}-\d{2}$/.test(value)

    ) {

        const parts =
            value.split('-');


        return new Date(

            Number(parts[0]),

            Number(parts[1]) - 1,

            Number(parts[2])

        ).getTime();

    }


    // ======================================================
    // ISO / DATE
    // ======================================================

    const d =
        new Date(value);


    if (
        isNaN(
            d.getTime()
        )
    ) {

        return 0;

    }


    return d.getTime();

}


// ==========================================================
// HIDE LOADING
// ==========================================================

function hideLoading() {

    // ======================================================
    // OVERLAY
    // ======================================================

    const loading =
        document.getElementById(

            'loadingOverlay'

        );


    if (loading) {

        loading.style.display =
            'none';

    }


    // ======================================================
    // ELEMENT CLASS LOADING
    // ======================================================

    document
        .querySelectorAll(
            '.loading'
        )
        .forEach(

            function(el) {

                el.style.display =
                    'none';

            }

        );

}


// ==========================================================
// SHOW ERROR
// ==========================================================

function showError(
    message
) {

    console.error(
        "DASHBOARD ERROR:",
        message
    );


    const el =
        document.getElementById(

            'errorMessage'

        );


    if (el) {

        el.textContent =

            'Gagal memuat data: ' +

            message;


        el.style.display =
            'block';

    }

}


// ==========================================================
// DOM READY
// ==========================================================

document.addEventListener(

    'DOMContentLoaded',

    function() {

        console.log(
            "DOM READY"
        );


        console.log(
            "SHEET_URL:",
            SHEET_URL
        );


        // ==================================================
        // LOAD DASHBOARD
        // ==================================================

        loadDashboard();

    }

);
