// ==========================================================
// APP.JS - DASHBOARD KAS DKM
// ==========================================================

console.log("====================================");
console.log("APP.JS START");
console.log("====================================");


// ==========================================================
// API
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
// FORMAT TANGGAL
// ==========================================================

function formatTanggal(value) {

    if (!value) {
        return '-';
    }


    // ==========================================
    // YYYY-MM-DD
    // ==========================================

    if (
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        const p = value.split('-');

        return (
            p[2] +
            '/' +
            p[1] +
            '/' +
            p[0]
        );

    }


    // ==========================================
    // ISO DATE
    // ==========================================

    const d = new Date(value);


    if (isNaN(d.getTime())) {
        return value;
    }


    return new Intl.DateTimeFormat(
        'id-ID',
        {
            timeZone: 'Asia/Jakarta',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }
    ).format(d);

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


// ==========================================================
// SET TEXT
// ==========================================================

function setText(id, value) {

    const el = document.getElementById(id);

    if (el) {
        el.textContent = value;
    }

}


// ==========================================================
// LOAD DASHBOARD
// ==========================================================

async function loadDashboard() {

    console.log("====================================");
    console.log("LOAD DASHBOARD");
    console.log("====================================");


    try {

        // ==========================================
        // URL API
        // ==========================================

        const url =
            API_URL +
            '?action=dashboard&_=' +
            Date.now();


        console.log("API URL:", url);


        // ==========================================
        // FETCH
        // ==========================================

        const response = await fetch(
            url,
            {
                method: 'GET',
                cache: 'no-store'
            }
        );


        console.log(
            "HTTP STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                'HTTP Error ' +
                response.status
            );

        }


        // ==========================================
        // JSON
        // ==========================================

        const result =
            await response.json();


        console.log(
            "RESPONSE API:",
            result
        );


        // ==========================================
        // CEK SUCCESS
        // ==========================================

        if (!result.success) {

            throw new Error(
                result.message ||
                'API mengembalikan error'
            );

        }


        // ==========================================
        // DEBUG
        // ==========================================

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
            "TRANSAKSI TERAKHIR:",
            result.transaksiTerakhir
        );


        // ==========================================
        // KPI
        // ==========================================

        setText(
            'saldo',
            formatRupiah(
                result.saldo
            )
        );


        setText(
            'totalMasuk',
            formatRupiah(
                result.totalMasuk
            )
        );


        setText(
            'totalKeluar',
            formatRupiah(
                result.totalKeluar
            )
        );


        setText(
            'jumlahTransaksi',
            result.jumlahTransaksi || 0
        );


        // ==========================================
        // KATEGORI MASUK
        // ==========================================

        renderKategoriMasuk(
            result.kategoriMasuk || []
        );


        // ==========================================
        // KATEGORI KELUAR
        // ==========================================

        renderKategoriKeluar(
            result.kategoriKeluar || []
        );


        // ==========================================
        // 20 TRANSAKSI TERAKHIR
        // ==========================================

        renderTransaksiTerakhir(
            result.transaksiTerakhir || []
        );


        // ==========================================
        // TOTAL KATEGORI
        // ==========================================

        setText(
            'totalKategoriMasuk',
            formatRupiah(
                totalKategori(
                    result.kategoriMasuk || []
                )
            )
        );


        setText(
            'totalKategoriKeluar',
            formatRupiah(
                totalKategori(
                    result.kategoriKeluar || []
                )
            )
        );


        // ==========================================
        // HIDE LOADING
        // ==========================================

        hideLoading();


        console.log(
            "DASHBOARD BERHASIL DIMUAT"
        );

    }

    catch (error) {

        console.error(
            "ERROR DASHBOARD:",
            error
        );


        hideLoading();


        showError(
            error.message
        );

    }

}


// ==========================================================
// TOTAL KATEGORI
// ==========================================================

function totalKategori(data) {

    return data.reduce(
        function(total, item) {

            return (
                total +
                (Number(item.jumlah) || 0)
            );

        },
        0
    );

}


// ==========================================================
// RENDER KATEGORI MASUK
// ==========================================================

function renderKategoriMasuk(data) {

    const tbody =
        document.getElementById(
            'tbodyRekapMasuk'
        );


    if (!tbody) {

        console.error(
            'tbodyRekapMasuk tidak ditemukan'
        );

        return;

    }


    tbody.innerHTML = '';


    // ==========================================
    // SORT TERBESAR
    // ==========================================

    data.sort(
        function(a, b) {

            return (
                Number(b.jumlah || 0) -
                Number(a.jumlah || 0)
            );

        }
    );


    if (!data.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    Belum ada data
                </td>
            </tr>
        `;

        return;

    }


    data.forEach(
        function(item, index) {

            const tr =
                document.createElement('tr');


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
                    ${Number(
                        item.transaksi || 0
                    )}
                </td>

                <td class="text-end">
                    ${formatRupiah(
                        item.jumlah
                    )}
                </td>

            `;


            tbody.appendChild(tr);

        }
    );

}


// ==========================================================
// RENDER KATEGORI KELUAR
// ==========================================================

function renderKategoriKeluar(data) {

    const tbody =
        document.getElementById(
            'tbodyRekapKeluar'
        );


    if (!tbody) {

        console.error(
            'tbodyRekapKeluar tidak ditemukan'
        );

        return;

    }


    tbody.innerHTML = '';


    // ==========================================
    // SORT TERBESAR
    // ==========================================

    data.sort(
        function(a, b) {

            return (
                Number(b.jumlah || 0) -
                Number(a.jumlah || 0)
            );

        }
    );


    if (!data.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    Belum ada data
                </td>
            </tr>
        `;

        return;

    }


    data.forEach(
        function(item, index) {

            const tr =
                document.createElement('tr');


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
                    ${Number(
                        item.transaksi || 0
                    )}
                </td>

                <td class="text-end">
                    ${formatRupiah(
                        item.jumlah
                    )}
                </td>

            `;


            tbody.appendChild(tr);

        }
    );

}


// ==========================================================
// RENDER 20 TRANSAKSI TERAKHIR
// ==========================================================

function renderTransaksiTerakhir(data) {

    const tbody =
        document.getElementById(
            'tbodyTerakhir'
        );


    if (!tbody) {

        console.error(
            'tbodyTerakhir tidak ditemukan'
        );

        return;

    }


    tbody.innerHTML = '';


    // ======================================================
    // URUTKAN TERBARU → TERLAMA
    //
    // Ini penting:
    // transaksi terbaru HARUS berada di BARIS PALING ATAS
    // ======================================================

    data.sort(
        function(a, b) {

            const dateA =
                new Date(
                    a.tanggal
                ).getTime();


            const dateB =
                new Date(
                    b.tanggal
                ).getTime();


            if (dateB !== dateA) {

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


    // ==========================================
    // AMBIL 20
    // ==========================================

    data =
        data.slice(0, 20);


    // ==========================================
    // TIDAK ADA DATA
    // ==========================================

    if (!data.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Belum ada transaksi
                </td>
            </tr>
        `;

        return;

    }


    // ==========================================
    // RENDER
    // ==========================================

    data.forEach(
        function(item) {

            const tr =
                document.createElement('tr');


            const badgeClass =
                item.jenis === 'MASUK'
                    ? 'bg-success'
                    : 'bg-danger';


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
                    <span class="badge ${badgeClass}">
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


            tbody.appendChild(tr);

        }
    );

}


// ==========================================================
// LOADING
// ==========================================================

function hideLoading() {

    const loading =
        document.getElementById(
            'loadingOverlay'
        );


    if (loading) {

        loading.style.display =
            'none';

    }


    // Jika ada teks Memuat...

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
// ERROR
// ==========================================================

function showError(message) {

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


        loadDashboard();

    }
);
