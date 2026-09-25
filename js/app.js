const API_URL = SHEET_URL;


// =====================================================
// FORMAT RUPIAH
// =====================================================

function formatRupiah(value) {

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Number(value) || 0);

}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggal(value) {

    if (!value) return '-';


    // Kalau sudah YYYY-MM-DD

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {

        const p = value.split('-');

        return p[2] + '/' + p[1] + '/' + p[0];

    }


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


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        console.log('LOAD DASHBOARD');


        const url =
            API_URL +
            '?action=dashboard&_=' +
            Date.now();


        console.log('API:', url);


        const response =
            await fetch(url, {
                cache: 'no-store'
            });


        console.log(
            'HTTP STATUS:',
            response.status
        );


        const result =
            await response.json();


        console.log(
            'RESPONSE:',
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                'API gagal'
            );

        }


        // =========================
        // KPI
        // =========================

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
            'saldo',
            formatRupiah(
                result.saldo
            )
        );


        setText(
            'jumlahTransaksi',
            result.jumlahTransaksi || 0
        );


        // =========================
        // REKAP KATEGORI MASUK
        // =========================

        renderKategori(
            'tbodyRekapMasuk',
            result.kategoriMasuk || []
        );


        // =========================
        // REKAP KATEGORI KELUAR
        // =========================

        renderKategori(
            'tbodyRekapKeluar',
            result.kategoriKeluar || []
        );


        // =========================
        // TRANSAKSI TERAKHIR
        // =========================

        renderTransaksiTerakhir(
            result.transaksiTerakhir || []
        );


        hideLoading();


    } catch (error) {

        console.error(
            'ERROR DASHBOARD:',
            error
        );


        showError(
            error.message
        );

        hideLoading();

    }

}


// =====================================================
// SET TEXT
// =====================================================

function setText(id, value) {

    const el =
        document.getElementById(id);


    if (el) {
        el.textContent = value;
    }

}


// =====================================================
// REKAP KATEGORI
// =====================================================

function renderKategori(
    tbodyId,
    data
) {

    const tbody =
        document.getElementById(
            tbodyId
        );


    if (!tbody) return;


    tbody.innerHTML = '';


    if (!data.length) {

        tbody.innerHTML =
            '<tr>' +
            '<td colspan="4" class="text-center">' +
            'Belum ada data' +
            '</td>' +
            '</tr>';

        return;

    }


    data.forEach(function(item, index) {

        const tr =
            document.createElement('tr');


        tr.innerHTML =

            '<td>' +
            (index + 1) +
            '</td>' +

            '<td>' +
            escapeHtml(
                item.kategori
            ) +
            '</td>' +

            '<td>' +
            Number(
                item.transaksi || 0
            ) +
            '</td>' +

            '<td class="text-end">' +
            formatRupiah(
                item.jumlah
            ) +
            '</td>';


        tbody.appendChild(tr);

    });

}


// =====================================================
// TRANSAKSI TERAKHIR
// =====================================================

function renderTransaksiTerakhir(
    data
) {

    const tbody =
        document.getElementById(
            'tbodyTerakhir'
        );


    if (!tbody) return;


    tbody.innerHTML = '';


    if (!data.length) {

        tbody.innerHTML =
            '<tr>' +
            '<td colspan="7" class="text-center">' +
            'Belum ada transaksi' +
            '</td>' +
            '</tr>';

        return;

    }


    data.forEach(function(item) {

        const tr =
            document.createElement('tr');


        tr.innerHTML =

            '<td>' +
            escapeHtml(
                String(item.no)
            ) +
            '</td>' +

            '<td>' +
            formatTanggal(
                item.tanggal
            ) +
            '</td>' +

            '<td>' +
            '<span class="badge ' +
            (
                item.jenis === 'MASUK'
                    ? 'bg-success'
                    : 'bg-danger'
            ) +
            '">' +
            escapeHtml(
                item.jenis
            ) +
            '</span>' +
            '</td>' +

            '<td>' +
            escapeHtml(
                item.kategori
            ) +
            '</td>' +

            '<td>' +
            escapeHtml(
                item.keterangan
            ) +
            '</td>' +

            '<td class="text-end">' +
            formatRupiah(
                item.nominal
            ) +
            '</td>' +

            '<td>' +
            escapeHtml(
                item.petugas || '-'
            ) +
            '</td>';


        tbody.appendChild(tr);

    });

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {

    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


// =====================================================
// LOADING
// =====================================================

function hideLoading() {

    const el =
        document.getElementById(
            'loadingOverlay'
        );


    if (el) {
        el.style.display = 'none';
    }

}


// =====================================================
// ERROR
// =====================================================

function showError(message) {

    console.error(message);


    const el =
        document.getElementById(
            'errorMessage'
        );


    if (el) {

        el.textContent =
            'Gagal memuat data: ' +
            message;

        el.style.display = 'block';

    }

}


// =====================================================
// START
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    function() {

        console.log(
            'DOM READY'
        );

        loadDashboard();

    }
);
