const API_URL = SHEET_URL;


// =====================================================
// STATE
// =====================================================

let currentPage = 1;

const limit = 50;


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


    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {

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


    const d =
        new Date(value);


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
// ESCAPE HTML
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
// LOAD TRANSAKSI
// =====================================================

async function loadTransaksi(
    page = 1
) {

    try {

        currentPage = page;


        const mulai =
            document.getElementById(
                'tanggalMulai'
            )?.value || '';


        const akhir =
            document.getElementById(
                'tanggalAkhir'
            )?.value || '';


        const jenis =
            document.getElementById(
                'filterJenis'
            )?.value || '';


        const kategori =
            document.getElementById(
                'filterKategori'
            )?.value || '';


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


        if (mulai) {

            params.set(
                'mulai',
                mulai
            );

        }


        if (akhir) {

            params.set(
                'akhir',
                akhir
            );

        }


        if (jenis) {

            params.set(
                'jenis',
                jenis
            );

        }


        if (kategori) {

            params.set(
                'kategori',
                kategori
            );

        }


        params.set(
            '_',
            Date.now()
        );


        const url =
            API_URL +
            '?' +
            params.toString();


        console.log(
            'TRANSAKSI API:',
            url
        );


        const response =
            await fetch(url, {
                cache: 'no-store'
            });


        const result =
            await response.json();


        console.log(
            'TRANSAKSI RESPONSE:',
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                'API gagal'
            );

        }


        renderTable(
            result.data || []
        );


        // KPI FILTER

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
            result.total || 0
        );


        renderPagination(
            result.page,
            result.totalPages
        );


        hideLoading();


    } catch (error) {

        console.error(
            'ERROR:',
            error
        );


        hideLoading();


        const tbody =
            document.getElementById(
                'tbodyTransaksi'
            );


        if (tbody) {

            tbody.innerHTML =
                '<tr>' +
                '<td colspan="7" class="text-center text-danger">' +
                escapeHtml(
                    error.message
                ) +
                '</td>' +
                '</tr>';

        }

    }

}


// =====================================================
// RENDER TABLE
// =====================================================

function renderTable(data) {

    const tbody =
        document.getElementById(
            'tbodyTransaksi'
        );


    if (!tbody) return;


    tbody.innerHTML = '';


    if (!data.length) {

        tbody.innerHTML =
            '<tr>' +
            '<td colspan="7" class="text-center">' +
            'Data tidak ditemukan' +
            '</td>' +
            '</tr>';

        return;

    }


    data.forEach(function(item) {

        const tr =
            document.createElement(
                'tr'
            );


        tr.innerHTML =

            '<td>' +
            escapeHtml(
                item.no
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
// PAGINATION
// =====================================================

function renderPagination(
    page,
    totalPages
) {

    const container =
        document.getElementById(
            'pagination'
        );


    if (!container) return;


    container.innerHTML = '';


    if (totalPages <= 1) {
        return;
    }


    const prev =
        document.createElement(
            'button'
        );


    prev.className =
        'btn btn-sm btn-outline-primary me-1';


    prev.textContent =
        '‹ Sebelumnya';


    prev.disabled =
        page <= 1;


    prev.onclick =
        function() {

            if (page > 1) {

                loadTransaksi(
                    page - 1
                );

            }

        };


    container.appendChild(prev);


    const info =
        document.createElement(
            'span'
        );


    info.className =
        'mx-2';


    info.textContent =
        'Halaman ' +
        page +
        ' / ' +
        totalPages;


    container.appendChild(info);


    const next =
        document.createElement(
            'button'
        );


    next.className =
        'btn btn-sm btn-outline-primary ms-1';


    next.textContent =
        'Berikutnya ›';


    next.disabled =
        page >= totalPages;


    next.onclick =
        function() {

            if (page < totalPages) {

                loadTransaksi(
                    page + 1
                );

            }

        };


    container.appendChild(next);

}


// =====================================================
// SET TEXT
// =====================================================

function setText(id, value) {

    const el =
        document.getElementById(id);


    if (el) {

        el.textContent =
            value;

    }

}


// =====================================================
// FILTER
// =====================================================

function filterData() {

    loadTransaksi(1);

}


// =====================================================
// RESET FILTER
// =====================================================

function resetFilter() {

    const ids = [
        'tanggalMulai',
        'tanggalAkhir',
        'filterJenis',
        'filterKategori'
    ];


    ids.forEach(function(id) {

        const el =
            document.getElementById(id);


        if (el) {
            el.value = '';
        }

    });


    loadTransaksi(1);

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

        el.style.display =
            'none';

    }

}


// =====================================================
// START
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    function() {

        console.log(
            'TRANSAKSI DOM READY'
        );


        loadTransaksi(1);

    }
);
