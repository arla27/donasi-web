"use strict";

/* =========================================================
   DATA GLOBAL
========================================================= */

let dataKas = [];

let sedangMemuat = false;

let sudahLoadPertama = false;


/* =========================================================
   FORMATTER
========================================================= */

const rupiahFormatter =
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
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
   KONVERSI TANGGAL
   Menjadi YYYY-MM-DD
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

            String(match[2])
                .padStart(2, "0") +

            "-" +

            String(match[1])
                .padStart(2, "0")

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

            String(match[2])
                .padStart(2, "0") +

            "-" +

            String(match[1])
                .padStart(2, "0")

        );

    }


    /* -----------------------------------------
       DATE / ISO
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
   FORMAT TANGGAL
========================================================= */

function formatTanggal(tanggal) {

    const normal =
        tanggalKeYYYYMMDD(
            tanggal
        );


    if (!normal) {

        return "-";

    }


    const parts =
        normal.split("-");


    if (
        parts.length === 3
    ) {

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
   FORMAT TANGGAL INDONESIA
========================================================= */

function formatTanggalIndonesia(value) {

    if (!value) {

        return "-";

    }


    const parts =
        String(value).split("-");


    if (
        parts.length === 3
    ) {

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
   LOADING
   Hanya ditampilkan saat pertama kali.
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

    }
    else {

        el.classList.remove("show");

    }

}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadData() {

    if (sedangMemuat) {

        return;

    }


    sedangMemuat = true;


    /* -----------------------------------------
       Loading hanya pertama kali
    ----------------------------------------- */

    if (!sudahLoadPertama) {

        tampilLoading(true);

    }


    try {

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
           VALIDASI RESPONSE
        ----------------------------------------- */

        let data = [];


        if (
            Array.isArray(result)
        ) {

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
           NORMALISASI
        ----------------------------------------- */

        dataKas =
            data.map(
                function (
                    item,
                    index
                ) {

                    return {

                        no:
                            item.no ??
                            index + 1,

                        tanggal:
                            item.tanggal ??
                            "",

                        tanggalKey:
                            tanggalKeYYYYMMDD(
                                item.tanggal
                            ),

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
                            ).trim(),

                        keterangan:
                            String(
                                item.keterangan ??
                                ""
                            ).trim(),

                        nominal:
                            Number(
                                item.nominal
                            ) || 0,

                        petugas:
                            String(
                                item.petugas ??
                                ""
                            ).trim()

                    };

                }
            );


        /* -----------------------------------------
           TAMPILKAN
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
         * data lama tetap dipertahankan.
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
       SATU LOOP
    ----------------------------------------- */

    for (
        let i = 0;
        i < dataUntukDitampilkan.length;
        i++
    ) {

        const item =
            dataUntukDitampilkan[i];


        if (
            item.jenis === "MASUK"
        ) {

            dataMasuk.push(item);

            totalMasuk +=
                Number(
                    item.nominal
                ) || 0;

        }
        else if (
            item.jenis === "KELUAR"
        ) {

            dataKeluar.push(item);

            totalKeluar +=
                Number(
                    item.nominal
                ) || 0;

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
        "footerMasuk",
        formatRupiah(
            totalMasuk
        )
    );


    setText(
        "footerKeluar",
        formatRupiah(
            totalKeluar
        )
    );


    setText(
        "rekapMasuk",
        formatRupiah(
            totalMasuk
        )
    );


    setText(
        "rekapKeluar",
        formatRupiah(
            totalKeluar
        )
    );


    setText(
        "rekapSaldo",
        formatRupiah(
            saldo
        )
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
       TABEL UTAMA
    ----------------------------------------- */

    renderKasMasuk(
        dataMasuk
    );


    renderKasKeluar(
        dataKeluar
    );


    /* -----------------------------------------
       REKAP KATEGORI
    ----------------------------------------- */

    renderRekapKategoriMasuk(
        dataMasuk
    );


    renderRekapKategoriKeluar(
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


    if (
        data.length === 0
    ) {

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


    if (
        data.length === 0
    ) {

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
   BUAT REKAP KATEGORI
========================================================= */

function buatRekapKategori(
    data
) {

    const hasil = {};


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const item =
            data[i];


        let kategori =
            String(
                item.kategori || ""
            ).trim();


        if (!kategori) {

            kategori =
                "LAINNYA";

        }


        /*
         * Samakan penulisan kategori.
         *
         * Contoh:
         * Infaq
         * INFAQ
         * infaq
         *
         * menjadi:
         * INFAQ
         */

        kategori =
            kategori.toUpperCase();


        if (
            !hasil[kategori]
        ) {

            hasil[kategori] = {

                transaksi: 0,

                total: 0

            };

        }


        hasil[kategori]
            .transaksi++;


        hasil[kategori]
            .total +=
                Number(
                    item.nominal
                ) || 0;

    }


    return hasil;

}


/* =========================================================
   REKAP KATEGORI MASUK
========================================================= */

function renderRekapKategoriMasuk(
    data
) {

    const tbody =
        document.getElementById(
            "rekapKategoriMasuk"
        );


    if (!tbody) {

        return;

    }


    const rekap =
        buatRekapKategori(
            data
        );


    const kategori =
        Object.keys(
            rekap
        );


    if (
        kategori.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center text-muted py-4"
                >

                    Tidak ada data

                </td>

            </tr>

        `;


        setText(
            "totalKategoriMasuk",
            formatRupiah(0)
        );


        return;

    }


    /*
     * Urutkan dari nominal terbesar
     */

    kategori.sort(
        function (a, b) {

            return (
                rekap[b].total -
                rekap[a].total
            );

        }
    );


    let html = "";

    let total = 0;


    for (
        let i = 0;
        i < kategori.length;
        i++
    ) {

        const nama =
            kategori[i];


        const item =
            rekap[nama];


        total +=
            item.total;


        html += `

            <tr>

                <td>
                    ${i + 1}
                </td>

                <td
                    class="fw-semibold"
                >
                    ${escapeHtml(
                        nama
                    )}
                </td>

                <td class="text-center">

                    ${item.transaksi}

                </td>

                <td
                    class="text-end fw-bold text-success"
                >

                    ${formatRupiah(
                        item.total
                    )}

                </td>

            </tr>

        `;

    }


    tbody.innerHTML =
        html;


    setText(
        "totalKategoriMasuk",
        formatRupiah(
            total
        )
    );

}


/* =========================================================
   REKAP KATEGORI KELUAR
========================================================= */

function renderRekapKategoriKeluar(
    data
) {

    const tbody =
        document.getElementById(
            "rekapKategoriKeluar"
        );


    if (!tbody) {

        return;

    }


    const rekap =
        buatRekapKategori(
            data
        );


    const kategori =
        Object.keys(
            rekap
        );


    if (
        kategori.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center text-muted py-4"
                >

                    Tidak ada data

                </td>

            </tr>

        `;


        setText(
            "totalKategoriKeluar",
            formatRupiah(0)
        );


        return;

    }


    /*
     * Urutkan dari nominal terbesar
     */

    kategori.sort(
        function (a, b) {

            return (
                rekap[b].total -
                rekap[a].total
            );

        }
    );


    let html = "";

    let total = 0;


    for (
        let i = 0;
        i < kategori.length;
        i++
    ) {

        const nama =
            kategori[i];


        const item =
            rekap[nama];


        total +=
            item.total;


        html += `

            <tr>

                <td>
                    ${i + 1}
                </td>

                <td
                    class="fw-semibold"
                >
                    ${escapeHtml(
                        nama
                    )}
                </td>

                <td class="text-center">

                    ${item.transaksi}

                </td>

                <td
                    class="text-end fw-bold text-danger"
                >

                    ${formatRupiah(
                        item.total
                    )}

                </td>

            </tr>

        `;

    }


    tbody.innerHTML =
        html;


    setText(
        "totalKategoriKeluar",
        formatRupiah(
            total
        )
    );

}


/* =========================================================
   FILTER PERIODE
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

    if (
        !mulai ||
        !akhir
    ) {

        alert(
            "Silakan pilih tanggal mulai dan tanggal akhir."
        );

        return;

    }


    if (
        mulai > akhir
    ) {

        alert(
            "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
        );

        return;

    }


    /* -----------------------------------------
       FILTER LOCAL

       Tidak request ke Google Sheet.
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
       LABEL PERIODE
    ----------------------------------------- */

    setText(
        "periode",

        formatTanggalIndonesia(
            mulai
        ) +

        " s/d " +

        formatTanggalIndonesia(
            akhir
        )

    );


    /* -----------------------------------------
       TAMPILKAN

       Termasuk:
       - Summary
       - Tabel masuk
       - Tabel keluar
       - Rekap kategori
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


        if (
            btnTampilkan
        ) {

            btnTampilkan.addEventListener(
                "click",
                filterPeriode
            );

        }


        if (
            btnSemua
        ) {

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
           AUTO REFRESH 30 DETIK
        ----------------------------------------- */

        setInterval(
            function () {

                loadData();

            },
            30000
        );

    }
);
