"use strict";

/* =========================================================
   KONFIGURASI
========================================================= */

let dataKas = [];

let sedangMemuat = false;

let sudahLoadPertama = false;


/* =========================================================
   FORMATTER
   Dibuat sekali saja supaya tidak membuat formatter
   berulang-ulang saat tabel dirender.
========================================================= */

const rupiahFormatter =
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    });


const tanggalFormatter =
    new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });


const waktuFormatter =
    new Intl.DateTimeFormat("id-ID", {
        dateStyle: "short",
        timeStyle: "medium"
    });


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
        el.textContent = value;
    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   KONVERSI TANGGAL KE YYYY-MM-DD

   Format yang didukung:

   DD/MM/YYYY
   DD-MM-YYYY
   YYYY-MM-DD
   Date
   ISO Date
========================================================= */

function tanggalKeYYYYMMDD(value) {

    if (!value) {
        return "";
    }


    /* -----------------------------------------
       DATE OBJECT
    ----------------------------------------- */

    if (value instanceof Date) {

        if (isNaN(value.getTime())) {
            return "";
        }

        return (
            value.getFullYear() +
            "-" +
            String(
                value.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                value.getDate()
            ).padStart(2, "0")
        );

    }


    const str =
        String(value).trim();


    /* -----------------------------------------
       YYYY-MM-DD
    ----------------------------------------- */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(str)
    ) {

        return str;

    }


    /* -----------------------------------------
       DD/MM/YYYY
    ----------------------------------------- */

    let match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
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


    /* -----------------------------------------
       DD-MM-YYYY
    ----------------------------------------- */

    match =
        str.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
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


    /* -----------------------------------------
       ISO / DATE STRING
    ----------------------------------------- */

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
   FORMAT TANGGAL TAMPILAN
========================================================= */

function formatTanggal(tanggal) {

    const normal =
        tanggalKeYYYYMMDD(tanggal);


    if (!normal) {
        return "-";
    }


    const parts =
        normal.split("-");


    if (parts.length === 3) {

        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );

    }


    return normal;

}


/* =========================================================
   FORMAT TANGGAL INPUT
========================================================= */

function formatTanggalIndonesia(value) {

    if (!value) {
        return "-";
    }


    const parts =
        String(value).split("-");


    if (parts.length === 3) {

        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );

    }


    return value;

}


/* =========================================================
   LOADING AWAL SAJA
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
   LOAD DATA

   Penting:
   - Loading hanya saat pertama kali.
   - Refresh berikutnya berjalan di background.
   - Tidak membuat halaman blank/loading setiap 30 detik.
========================================================= */

async function loadData() {

    if (sedangMemuat) {
        return;
    }


    sedangMemuat = true;


    /* -----------------------------------------
       Loading hanya load pertama
    ----------------------------------------- */

    if (!sudahLoadPertama) {
        tampilLoading(true);
    }


    try {

        /*
         * Jangan gunakan cache: "no-store"
         * karena kita ingin request berikutnya
         * tetap dapat memanfaatkan koneksi/cache
         * browser bila memungkinkan.
         *
         * Timestamp tetap digunakan agar Apps Script
         * tidak menyajikan response lama.
         */

        const separator =
            SHEET_URL.includes("?")
                ? "&"
                : "?";


        const url =
            SHEET_URL +
            separator +
            "v=" +
            Date.now();


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
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


        /* -----------------------------------------
           VALIDASI
        ----------------------------------------- */

        let data = [];


        if (Array.isArray(result)) {

            data = result;

        }
        else if (
            result &&
            result.success === true &&
            Array.isArray(result.data)
        ) {

            data =
                result.data;

        }
        else {

            throw new Error(
                result.message ||
                "Format data API tidak valid"
            );

        }


        /* -----------------------------------------
           NORMALISASI DATA

           Sekalian simpan tanggal dalam format
           YYYY-MM-DD supaya filter jauh lebih cepat.
        ----------------------------------------- */

        dataKas =
            data.map(
                function (item, index) {

                    const tanggal =
                        tanggalKeYYYYMMDD(
                            item.tanggal
                        );


                    return {

                        no:
                            item.no ??
                            index + 1,

                        tanggal:
                            item.tanggal ??
                            "",

                        tanggalKey:
                            tanggal,

                        jenis:
                            String(
                                item.jenis ??
                                ""
                            )
                            .trim()
                            .toUpperCase(),

                        kategori:
                            String(
                                item.kategori ??
                                ""
                            ),

                        keterangan:
                            String(
                                item.keterangan ??
                                ""
                            ),

                        nominal:
                            Number(
                                item.nominal
                            ) || 0,

                        petugas:
                            String(
                                item.petugas ??
                                ""
                            )

                    };

                }
            );


        /* -----------------------------------------
           TAMPILKAN DATA
        ----------------------------------------- */

        tampilkanData(
            dataKas
        );


        sudahLoadPertama = true;


    }
    catch (error) {

        console.error(
            "ERROR LOAD DATA:",
            error
        );


        /*
         * Kalau refresh background gagal,
         * jangan hapus data lama.
         *
         * Ini penting agar website tidak tiba-tiba
         * menjadi kosong hanya karena API timeout.
         */

        if (!sudahLoadPertama) {

            tampilkanError(
                error.message ||
                "Gagal mengambil data"
            );

        }

    }
    finally {

        sedangMemuat = false;

        if (!sudahLoadPertama) {
            tampilLoading(false);
        }

    }

}


/* =========================================================
   ERROR
========================================================= */

function tampilkanError(pesan) {

    const masuk =
        document.getElementById(
            "tbodyMasuk"
        );


    const keluar =
        document.getElementById(
            "tbodyKeluar"
        );


    if (masuk) {

        masuk.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-danger py-4"
                >

                    Gagal mengambil data kas.

                    <br>

                    <small>
                        ${escapeHtml(pesan)}
                    </small>

                </td>

            </tr>

        `;

    }


    if (keluar) {

        keluar.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-danger py-4"
                >

                    Data tidak dapat dimuat.

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   TAMPILKAN DATA
========================================================= */

function tampilkanData(
    dataUntukDitampilkan
) {

    const dataMasuk = [];

    const dataKeluar = [];

    let totalMasuk = 0;

    let totalKeluar = 0;


    /* -----------------------------------------
       SATU LOOP SAJA

       Sebelumnya filter + reduce dilakukan
       beberapa kali.
    ----------------------------------------- */

    for (
        let i = 0;
        i < dataUntukDitampilkan.length;
        i++
    ) {

        const item =
            dataUntukDitampilkan[i];


        if (item.jenis === "MASUK") {

            dataMasuk.push(item);

            totalMasuk +=
                Number(item.nominal) || 0;

        }
        else if (
            item.jenis === "KELUAR"
        ) {

            dataKeluar.push(item);

            totalKeluar +=
                Number(item.nominal) || 0;

        }

    }


    const saldo =
        totalMasuk -
        totalKeluar;


    /* -----------------------------------------
       SUMMARY
    ----------------------------------------- */

    setText(
        "totalMasuk",
        formatRupiah(totalMasuk)
    );


    setText(
        "totalKeluar",
        formatRupiah(totalKeluar)
    );


    setText(
        "saldo",
        formatRupiah(saldo)
    );


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


    setText(
        "jumlahTransaksi",
        dataUntukDitampilkan.length
    );


    setText(
        "lastUpdate",
        waktuFormatter.format(
            new Date()
        )
    );


    /* -----------------------------------------
       TABLE
    ----------------------------------------- */

    renderKasMasuk(
        dataMasuk
    );


    renderKasKeluar(
        dataKeluar
    );

}


/* =========================================================
   RENDER KAS MASUK
========================================================= */

function renderKasMasuk(data) {

    const tbody =
        document.getElementById(
            "tbodyMasuk"
        );


    if (!tbody) {
        return;
    }


    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted py-4"
                >

                    Tidak ada transaksi kas masuk

                </td>

            </tr>

        `;

        return;

    }


    let html = "";


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const item =
            data[i];


        html += `

            <tr>

                <td>
                    ${i + 1}
                </td>

                <td>
                    ${escapeHtml(
                        formatTanggal(
                            item.tanggal
                        )
                    )}
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

                <td
                    class="text-end fw-bold text-success"
                >
                    ${formatRupiah(
                        item.nominal
                    )}
                </td>

            </tr>

        `;

    }


    tbody.innerHTML =
        html;

}


/* =========================================================
   RENDER KAS KELUAR
========================================================= */

function renderKasKeluar(data) {

    const tbody =
        document.getElementById(
            "tbodyKeluar"
        );


    if (!tbody) {
        return;
    }


    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted py-4"
                >

                    Tidak ada transaksi kas keluar

                </td>

            </tr>

        `;

        return;

    }


    let html = "";


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const item =
            data[i];


        html += `

            <tr>

                <td>
                    ${i + 1}
                </td>

                <td>
                    ${escapeHtml(
                        formatTanggal(
                            item.tanggal
                        )
                    )}
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

                <td
                    class="text-end fw-bold text-danger"
                >
                    ${formatRupiah(
                        item.nominal
                    )}
                </td>

            </tr>

        `;

    }


    tbody.innerHTML =
        html;

}


/* =========================================================
   FILTER PERIODE

   TIDAK MEMANGGIL API.

   Filter langsung dari dataKas yang sudah ada.
   Jadi klik Tampilkan sangat cepat.
========================================================= */

function filterPeriode() {

    const inputMulai =
        document.getElementById(
            "tanggalMulai"
        );


    const inputAkhir =
        document.getElementById(
            "tanggalAkhir"
        );


    const mulai =
        inputMulai.value;


    const akhir =
        inputAkhir.value;


    /* -----------------------------------------
       VALIDASI
    ----------------------------------------- */

    if (!mulai || !akhir) {

        alert(
            "Silakan pilih tanggal mulai dan tanggal akhir."
        );

        return;

    }


    if (mulai > akhir) {

        alert(
            "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
        );

        return;

    }


    /* -----------------------------------------
       FILTER

       tanggalKey sudah dibuat ketika API load,
       jadi tidak perlu parse tanggal lagi.
    ----------------------------------------- */

    const hasil =
        dataKas.filter(
            function (item) {

                return (
                    item.tanggalKey >= mulai &&
                    item.tanggalKey <= akhir
                );

            }
        );


    /* -----------------------------------------
       PERIODE
    ----------------------------------------- */

    setText(
        "periode",
        formatTanggalIndonesia(mulai) +
        " s/d " +
        formatTanggalIndonesia(akhir)
    );


    /* -----------------------------------------
       TAMPILKAN
    ----------------------------------------- */

    tampilkanData(
        hasil
    );

}


/* =========================================================
   SEMUA DATA
========================================================= */

function tampilkanSemuaData() {

    const mulai =
        document.getElementById(
            "tanggalMulai"
        );


    const akhir =
        document.getElementById(
            "tanggalAkhir"
        );


    if (mulai) {
        mulai.value = "";
    }


    if (akhir) {
        akhir.value = "";
    }


    setText(
        "periode",
        "Semua Data"
    );


    tampilkanData(
        dataKas
    );

}


/* =========================================================
   EVENT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const btnTampilkan =
            document.getElementById(
                "btnTampilkan"
            );


        const btnSemua =
            document.getElementById(
                "btnSemua"
            );


        if (btnTampilkan) {

            btnTampilkan.addEventListener(
                "click",
                filterPeriode
            );

        }


        if (btnSemua) {

            btnSemua.addEventListener(
                "click",
                tampilkanSemuaData
            );

        }


        /* -----------------------------------------
           LOAD PERTAMA
        ----------------------------------------- */

        loadData();


        /* -----------------------------------------
           REFRESH BACKGROUND 30 DETIK
        ----------------------------------------- */

        setInterval(
            function () {

                loadData();

            },
            30000
        );

    }
);
