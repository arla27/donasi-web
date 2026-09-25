"use strict";

/* =========================================================
   CONFIG
========================================================= */

let sedangMemuat = false;


/* =========================================================
   FORMATTER
========================================================= */

const rupiahFormatter =
    new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    );


const tanggalFormatter =
    new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(nilai) {

    return rupiahFormatter.format(
        Number(nilai) || 0
    );

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
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value == null ? "" : value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   TANGGAL
   HASIL SELALU:
   DD/MM/YYYY

   TANPA JAM
========================================================= */

function formatTanggal(value) {

    if (!value) {
        return "-";
    }


    const str =
        String(value)
            .trim();


    /*
       FORMAT:
       YYYY-MM-DD
       YYYY-MM-DD HH:mm:ss
       YYYY-MM-DDTHH:mm:ss
    */

    let match =
        str.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );


    if (match) {

        const year =
            match[1];

        const month =
            String(match[2])
                .padStart(2, "0");

        const day =
            String(match[3])
                .padStart(2, "0");


        return (
            day +
            "/" +
            month +
            "/" +
            year
        );

    }


    /*
       FORMAT:
       DD/MM/YYYY
       DD/MM/YYYY HH:mm:ss
    */

    match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
        );


    if (match) {

        const day =
            String(match[1])
                .padStart(2, "0");

        const month =
            String(match[2])
                .padStart(2, "0");

        const year =
            match[3];


        return (
            day +
            "/" +
            month +
            "/" +
            year
        );

    }


    /*
       FORMAT:
       DD-MM-YYYY
       DD-MM-YYYY HH:mm:ss
    */

    match =
        str.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})/
        );


    if (match) {

        const day =
            String(match[1])
                .padStart(2, "0");

        const month =
            String(match[2])
                .padStart(2, "0");

        const year =
            match[3];


        return (
            day +
            "/" +
            month +
            "/" +
            year
        );

    }


    /*
       FALLBACK
       Coba Date
    */

    const d =
        new Date(str);


    if (!isNaN(d.getTime())) {

        return tanggalFormatter.format(d);

    }


    /*
       Kalau tetap tidak bisa,
       jangan tampilkan jam.
    */

    return str.substring(0, 10);

}


/* =========================================================
   TANGGAL UNTUK FILTER
   HASIL:
   YYYY-MM-DD
========================================================= */

function tanggalKeYYYYMMDD(value) {

    if (!value) {
        return "";
    }


    const str =
        String(value)
            .trim();


    /*
       YYYY-MM-DD
    */

    let match =
        str.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );


    if (match) {

        return (
            match[1] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[3]).padStart(2, "0")
        );

    }


    /*
       DD/MM/YYYY
    */

    match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
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


    /*
       DD-MM-YYYY
    */

    match =
        str.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})/
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


    const d =
        new Date(str);


    if (!isNaN(d.getTime())) {

        return (
            d.getFullYear() +
            "-" +
            String(
                d.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                d.getDate()
            ).padStart(2, "0")
        );

    }


    return "";

}


/* =========================================================
   LAST UPDATE
========================================================= */

function tampilkanLastUpdate() {

    const el =
        document.getElementById(
            "lastUpdate"
        );


    if (!el) {
        return;
    }


    const sekarang =
        new Date();


    const tanggal =
        new Intl.DateTimeFormat(
            "id-ID",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        ).format(sekarang);


    const waktu =
        new Intl.DateTimeFormat(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(sekarang);


    el.textContent =
        "Terakhir diperbarui: " +
        tanggal +
        " " +
        waktu;

}


/* =========================================================
   LOADING
========================================================= */

function tampilLoading(status) {

    const el =
        document.getElementById(
            "loadingOverlay"
        );


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
   FETCH DASHBOARD
========================================================= */

async function loadData() {

    if (sedangMemuat) {
        return;
    }


    sedangMemuat = true;


    try {

        /*
           Loading hanya pada load pertama.
           Refresh berikutnya tidak mengganggu tampilan.
        */

        if (
            !window.sudahLoadPertama
        ) {

            tampilLoading(true);

        }


        const url =
            SHEET_URL +
            "?action=dashboard&_=" +
            Date.now();


        console.log(
            "LOAD DASHBOARD:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
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
            "RESPONSE DASHBOARD:",
            result
        );


        /*
           VALIDASI
        */

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Data dashboard tidak valid"
            );

        }


        /*
           TAMPILKAN DATA DASHBOARD
        */

        tampilkanDashboard(
            result
        );


        window.sudahLoadPertama =
            true;


    } catch (error) {

        console.error(
            "ERROR LOAD DASHBOARD:",
            error
        );


        tampilkanError(
            error.message ||
            "Gagal mengambil data dashboard"
        );


    } finally {

        sedangMemuat =
            false;

        tampilLoading(false);

    }

}


/* =========================================================
   TAMPILKAN DASHBOARD
========================================================= */

function tampilkanDashboard(result) {

    /*
       Nilai langsung dari Apps Script.

       JANGAN menghitung saldo dari
       20 transaksi terakhir.
    */

    const totalMasuk =
        Number(
            result.totalMasuk
        ) || 0;


    const totalKeluar =
        Number(
            result.totalKeluar
        ) || 0;


    const saldo =
        Number(
            result.saldo
        ) ||
        (
            totalMasuk -
            totalKeluar
        );


    /*
       SUMMARY
    */

    setText(
        "saldo",
        formatRupiah(saldo)
    );


    setText(
        "totalMasuk",
        formatRupiah(totalMasuk)
    );


    setText(
        "totalKeluar",
        formatRupiah(totalKeluar)
    );


    /*
       Elemen tambahan bila ada
    */

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
       KATEGORI
    */

    renderRekapKategoriMasuk(
        result.kategoriMasuk || []
    );


    renderRekapKategoriKeluar(
        result.kategoriKeluar || []
    );


    /*
       20 TRANSAKSI TERAKHIR
    */

    renderTransaksiTerakhir(
        result.transaksiTerakhir || []
    );


    /*
       LAST UPDATE
    */

    tampilkanLastUpdate();

}


/* =========================================================
   RENDER REKAP KATEGORI MASUK
========================================================= */

function renderRekapKategoriMasuk(data) {

    /*
       Cari beberapa kemungkinan ID.
       Ini membuat kode lebih fleksibel
       terhadap HTML versi sebelumnya.
    */

    const tbody =
        cariElement([
            "tbodyRekapMasuk",
            "tbodyKategoriMasuk",
            "kategoriMasukBody"
        ]);


    if (!tbody) {

        console.warn(
            "tbody rekap kas masuk tidak ditemukan"
        );

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="text-center text-muted py-4"
                >
                    Belum ada data
                </td>
            </tr>
        `;

        updateTotalKategori(
            [
                "totalKategoriMasuk",
                "footerKategoriMasuk"
            ],
            0
        );

        return;

    }


    let total =
        0;


    tbody.innerHTML =
        data.map(
            function(item, index) {

                const jumlah =
                    Number(
                        item.jumlah
                    ) || 0;


                total +=
                    jumlah;


                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.kategori ||
                                "LAINNYA"
                            )}
                        </td>

                        <td class="text-center">
                            ${Number(
                                item.transaksi
                            ) || 0}
                        </td>

                        <td class="text-end fw-bold text-success">
                            ${formatRupiah(
                                jumlah
                            )}
                        </td>

                    </tr>
                `;

            }
        ).join("");


    updateTotalKategori(
        [
            "totalKategoriMasuk",
            "footerKategoriMasuk"
        ],
        total
    );

}


/* =========================================================
   RENDER REKAP KATEGORI KELUAR
========================================================= */

function renderRekapKategoriKeluar(data) {

    const tbody =
        cariElement([
            "tbodyRekapKeluar",
            "tbodyKategoriKeluar",
            "kategoriKeluarBody"
        ]);


    if (!tbody) {

        console.warn(
            "tbody rekap kas keluar tidak ditemukan"
        );

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="text-center text-muted py-4"
                >
                    Belum ada data
                </td>
            </tr>
        `;

        updateTotalKategori(
            [
                "totalKategoriKeluar",
                "footerKategoriKeluar"
            ],
            0
        );

        return;

    }


    let total =
        0;


    tbody.innerHTML =
        data.map(
            function(item, index) {

                const jumlah =
                    Number(
                        item.jumlah
                    ) || 0;


                total +=
                    jumlah;


                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.kategori ||
                                "LAINNYA"
                            )}
                        </td>

                        <td class="text-center">
                            ${Number(
                                item.transaksi
                            ) || 0}
                        </td>

                        <td class="text-end fw-bold text-danger">
                            ${formatRupiah(
                                jumlah
                            )}
                        </td>

                    </tr>
                `;

            }
        ).join("");


    updateTotalKategori(
        [
            "totalKategoriKeluar",
            "footerKategoriKeluar"
        ],
        total
    );

}


/* =========================================================
   UPDATE TOTAL KATEGORI
========================================================= */

function updateTotalKategori(
    ids,
    total
) {

    for (
        let i = 0;
        i < ids.length;
        i++
    ) {

        const el =
            document.getElementById(
                ids[i]
            );


        if (el) {

            el.textContent =
                formatRupiah(total);

        }

    }

}


/* =========================================================
   CARI ELEMENT
========================================================= */

function cariElement(ids) {

    for (
        let i = 0;
        i < ids.length;
        i++
    ) {

        const el =
            document.getElementById(
                ids[i]
            );


        if (el) {
            return el;
        }

    }


    return null;

}


/* =========================================================
   RENDER 20 TRANSAKSI TERAKHIR
========================================================= */

function renderTransaksiTerakhir(data) {

    const tbody =
        cariElement([
            "tbodyTerakhir",
            "tbodyTransaksiTerakhir",
            "tbodyRecent",
            "transaksiTerakhirBody"
        ]);


    if (!tbody) {

        console.warn(
            "tbody transaksi terakhir tidak ditemukan"
        );

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="text-center text-muted py-4"
                >
                    Belum ada transaksi
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.map(
            function(item, index) {

                const jenis =
                    String(
                        item.jenis || ""
                    )
                    .trim()
                    .toUpperCase();


                let jenisClass =
                    "";


                if (
                    jenis === "MASUK"
                ) {

                    jenisClass =
                        "text-success fw-bold";

                }


                if (
                    jenis === "KELUAR"
                ) {

                    jenisClass =
                        "text-danger fw-bold";

                }


                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                formatTanggal(
                                    item.tanggal
                                )
                            )}
                        </td>

                        <td>
                            <span class="${jenisClass}">
                                ${escapeHtml(
                                    jenis
                                )}
                            </span>
                        </td>

                        <td>
                            ${escapeHtml(
                                item.kategori ||
                                ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.keterangan ||
                                ""
                            )}
                        </td>

                        <td class="text-end fw-bold">
                            ${formatRupiah(
                                item.nominal
                            )}
                        </td>

                    </tr>
                `;

            }
        ).join("");

}


/* =========================================================
   ERROR
========================================================= */

function tampilkanError(pesan) {

    console.error(
        "ERROR:",
        pesan
    );


    /*
       Dashboard utama
    */

    const tbody =
        cariElement([
            "tbodyTerakhir",
            "tbodyTransaksiTerakhir",
            "tbodyRecent",
            "transaksiTerakhirBody"
        ]);


    if (tbody) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="text-center text-danger py-4"
                >

                    Gagal mengambil data.

                    <br>

                    <small>
                        ${escapeHtml(pesan)}
                    </small>

                </td>
            </tr>
        `;

    }


    /*
       Rekap masuk
    */

    const masuk =
        cariElement([
            "tbodyRekapMasuk",
            "tbodyKategoriMasuk",
            "kategoriMasukBody"
        ]);


    if (masuk) {

        masuk.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="text-center text-danger py-4"
                >
                    Data gagal dimuat
                </td>
            </tr>
        `;

    }


    /*
       Rekap keluar
    */

    const keluar =
        cariElement([
            "tbodyRekapKeluar",
            "tbodyKategoriKeluar",
            "kategoriKeluarBody"
        ]);


    if (keluar) {

        keluar.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="text-center text-danger py-4"
                >
                    Data gagal dimuat
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   TOMBOL DETAIL TRANSAKSI
========================================================= */

function bukaDetailTransaksi() {

    window.location.href =
        "transaksi.html";

}


/* =========================================================
   EVENT DOM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Tombol lihat semua transaksi
        */

        const tombol =
            document.querySelector(
                "#btnLihatSemua, " +
                "#btnSemuaTransaksi, " +
                ".btn-lihat-semua"
            );


        if (tombol) {

            tombol.addEventListener(
                "click",
                function(e) {

                    /*
                       Jika HTML sudah punya href,
                       biarkan browser bekerja.
                    */

                    const href =
                        tombol.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href === "#"
                    ) {

                        e.preventDefault();

                        bukaDetailTransaksi();

                    }

                }
            );

        }


        /*
           LOAD PERTAMA
        */

        loadData();


        /*
           AUTO REFRESH
           60 DETIK
        */

        setInterval(
            function() {

                loadData();

            },
            60000
        );

    }
);
