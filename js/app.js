"use strict";


/* =========================================================
   DATA GLOBAL
========================================================= */

let dataKas = [];

let sedangMemuat = false;



/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(nilai) {

    nilai = Number(nilai) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(nilai);

}



/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }


    const d = parseTanggal(tanggal);


    if (!d || isNaN(d.getTime())) {
        return tanggal;
    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(d);

}



/* =========================================================
   PARSE TANGGAL
========================================================= */

function parseTanggal(value) {

    if (!value) {
        return null;
    }


    if (value instanceof Date) {
        return value;
    }


    const str =
        String(value).trim();


    /* DD/MM/YYYY */

    let match =
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


    /* YYYY-MM-DD */

    match =
        str.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );


    if (match) {

        return new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        );

    }


    /* ISO DATE */

    const parsed =
        new Date(str);


    if (!isNaN(parsed.getTime())) {

        return parsed;

    }


    return null;

}



/* =========================================================
   FORMAT UNTUK INPUT DATE
========================================================= */

function formatDateInput(value) {

    const d =
        parseTanggal(value);


    if (!d || isNaN(d.getTime())) {

        return "";

    }


    const y =
        d.getFullYear();


    const m =
        String(d.getMonth() + 1)
        .padStart(2, "0");


    const day =
        String(d.getDate())
        .padStart(2, "0");


    return `${y}-${m}-${day}`;

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
   LOAD DATA
========================================================= */

async function loadData() {


    if (sedangMemuat) {
        return;
    }


    sedangMemuat = true;


    try {

        tampilLoading(true);


        const response =
            await fetch(
                SHEET_URL +
                "?_=" +
                Date.now(),
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


        /* =====================================
           VALIDASI RESPONSE
        ===================================== */

        let data;


        if (Array.isArray(result)) {

            data = result;

        } else if (
            result &&
            result.success === true &&
            Array.isArray(result.data)
        ) {

            data = result.data;

        } else {

            throw new Error(
                result.message ||
                "Format data API tidak valid"
            );

        }


        /* =====================================
           NORMALISASI DATA
        ===================================== */

        dataKas =
            data.map(
                function (item, index) {

                    return {

                        no:
                            item.no ??
                            index + 1,

                        tanggal:
                            item.tanggal ??
                            "",

                        jenis:
                            String(
                                item.jenis ??
                                ""
                            )
                            .trim()
                            .toUpperCase(),

                        kategori:
                            item.kategori ??
                            "",

                        keterangan:
                            item.keterangan ??
                            "",

                        nominal:
                            Number(
                                item.nominal
                            ) || 0,

                        petugas:
                            item.petugas ??
                            ""

                    };

                }
            );


        /* =====================================
           TAMPILKAN
        ===================================== */

        tampilkanData(dataKas);


    } catch (error) {

        console.error(
            "ERROR LOAD DATA:",
            error
        );


        tampilkanError(
            error.message ||
            "Gagal mengambil data"
        );


    } finally {

        sedangMemuat = false;

        tampilLoading(false);

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
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
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
   TAMPILKAN DATA
========================================================= */

function tampilkanData(
    dataUntukDitampilkan
) {


    const dataMasuk =
        dataUntukDitampilkan.filter(
            function (item) {

                return item.jenis === "MASUK";

            }
        );


    const dataKeluar =
        dataUntukDitampilkan.filter(
            function (item) {

                return item.jenis === "KELUAR";

            }
        );


    /* =====================================
       TOTAL
    ===================================== */

    const totalMasuk =
        dataMasuk.reduce(
            function (total, item) {

                return total +
                    Number(item.nominal || 0);

            },
            0
        );


    const totalKeluar =
        dataKeluar.reduce(
            function (total, item) {

                return total +
                    Number(item.nominal || 0);

            },
            0
        );


    const saldo =
        totalMasuk -
        totalKeluar;



    /* =====================================
       SUMMARY
    ===================================== */

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
        new Intl.DateTimeFormat(
            "id-ID",
            {
                dateStyle: "short",
                timeStyle: "medium"
            }
        ).format(new Date())
    );



    /* =====================================
       TABLE
    ===================================== */

    renderKasMasuk(
        dataMasuk
    );


    renderKasKeluar(
        dataKeluar
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


    if (!data.length) {

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


    tbody.innerHTML =
        data.map(
            function (item, index) {

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
                            ${escapeHtml(
                                item.kategori
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.keterangan
                            )}
                        </td>

                        <td class="text-end fw-bold text-success">
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


    if (!data.length) {

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


    tbody.innerHTML =
        data.map(
            function (item, index) {

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
                            ${escapeHtml(
                                item.kategori
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.keterangan
                            )}
                        </td>

                        <td class="text-end fw-bold text-danger">
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
   FILTER PERIODE
========================================================= */

/* =========================================================
   FILTER PERIODE
========================================================= */

function filterPeriode() {

    const inputMulai = document.getElementById("tanggalMulai");
    const inputAkhir = document.getElementById("tanggalAkhir");

    const mulai = inputMulai.value;
    const akhir = inputAkhir.value;

    console.log("Tanggal mulai :", mulai);
    console.log("Tanggal akhir :", akhir);
    console.log("Total data    :", dataKas.length);


    // ============================================
    // VALIDASI
    // ============================================

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


    // ============================================
    // FILTER DATA
    // ============================================

    const hasil = dataKas.filter(function (item) {

        const tanggalItem =
            tanggalKeYYYYMMDD(item.tanggal);

        console.log(
            "Data:",
            item.tanggal,
            "=>",
            tanggalItem
        );


        if (!tanggalItem) {
            return false;
        }


        return (
            tanggalItem >= mulai &&
            tanggalItem <= akhir
        );

    });


    console.log(
        "Hasil filter:",
        hasil
    );


    // ============================================
    // TAMPILKAN PERIODE
    // ============================================

    setText(
        "periode",
        formatTanggalIndonesia(mulai) +
        " s/d " +
        formatTanggalIndonesia(akhir)
    );


    // ============================================
    // TAMPILKAN HASIL
    // ============================================

    tampilkanData(hasil);

}



/* =========================================================
   KONVERSI TANGGAL KE YYYY-MM-DD
========================================================= */

function tanggalKeYYYYMMDD(value) {

    if (!value) {
        return "";
    }


    // ---------------------------------------------
    // Kalau sudah YYYY-MM-DD
    // ---------------------------------------------

    const str =
        String(value).trim();


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(str)
    ) {

        return str;

    }


    // ---------------------------------------------
    // DD/MM/YYYY
    // ---------------------------------------------

    let match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
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
            year +
            "-" +
            month +
            "-" +
            day
        );

    }


    // ---------------------------------------------
    // DD-MM-YYYY
    // ---------------------------------------------

    match =
        str.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
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
            year +
            "-" +
            month +
            "-" +
            day
        );

    }


    // ---------------------------------------------
    // DATE OBJECT / ISO
    // ---------------------------------------------

    const d =
        new Date(value);


    if (
        !isNaN(d.getTime())
    ) {

        const year =
            d.getFullYear();

        const month =
            String(
                d.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                d.getDate()
            ).padStart(2, "0");


        return (
            year +
            "-" +
            month +
            "-" +
            day
        );

    }


    return "";

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


        /* LOAD PERTAMA */

        loadData();


        /* AUTO REFRESH 30 DETIK */

        setInterval(
            loadData,
            30000
        );

    }
);
