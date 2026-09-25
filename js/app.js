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
   SET TEXT - AMAN
========================================================= */

function setText(id, value) {

    const el =
        document.getElementById(id);

    if (el) {

        el.textContent =
            value == null ? "" : String(value);

    }

}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const d =
        parseTanggal(tanggal);

    if (!d || isNaN(d.getTime())) {
        return String(tanggal);
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


    /* -----------------------------------------
       YYYY-MM-DD
    ----------------------------------------- */

    let match =
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


    /* -----------------------------------------
       DD/MM/YYYY
    ----------------------------------------- */

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


    /* -----------------------------------------
       DD-MM-YYYY
    ----------------------------------------- */

    match =
        str.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
        );

    if (match) {

        return new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1])
        );

    }


    /* -----------------------------------------
       ISO / DATE OBJECT STRING
    ----------------------------------------- */

    const parsed =
        new Date(str);

    if (!isNaN(parsed.getTime())) {
        return parsed;
    }

    return null;

}


/* =========================================================
   KONVERSI TANGGAL KE YYYY-MM-DD
========================================================= */

function tanggalKeYYYYMMDD(value) {

    if (!value) {
        return "";
    }

    const str =
        String(value).trim();


    /* YYYY-MM-DD */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(str)
    ) {

        return str;

    }


    /* DD/MM/YYYY */

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


    /* DD-MM-YYYY */

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


    /* DATE / ISO */

    const d =
        new Date(value);

    if (!isNaN(d.getTime())) {

        const year =
            d.getFullYear();

        const month =
            String(d.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(d.getDate())
                .padStart(2, "0");

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

    return String(value);

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
                "?action=dashboard&_=" +
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


        console.log(
            "DASHBOARD API:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "API tidak mengembalikan data yang valid."
            );

        }


        /* =====================================
           DATA TRANSAKSI
        ===================================== */

        if (
            Array.isArray(result.data)
        ) {

            dataKas =
                result.data;

        } else if (
            Array.isArray(result.transaksiTerakhir)
        ) {

            dataKas =
                result.transaksiTerakhir;

        } else {

            dataKas = [];

        }


        /* =====================================
           NORMALISASI DATA
        ===================================== */

        dataKas =
            dataKas.map(
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
                            String(
                                item.kategori ??
                                "LAINNYA"
                            )
                            .trim()
                            .toUpperCase(),

                        keterangan:
                            String(
                                item.keterangan ??
                                ""
                            )
                            .trim(),

                        nominal:
                            Number(
                                item.nominal
                            ) || 0,

                        petugas:
                            String(
                                item.petugas ??
                                ""
                            )
                            .trim()

                    };

                }
            );


        /* =====================================
           SUMMARY DARI REKAP
           
           PENTING:
           Backend dashboard harus mengirim:
           
           result.totalMasuk
           result.totalKeluar
           result.saldo
           
           yang berasal dari SHEET REKAP.
        ===================================== */

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
            ) || 0;


        /* =====================================
           KPI
        ===================================== */

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
            dataKas.length
        );


        setText(
            "lastUpdate",
            new Intl.DateTimeFormat(
                "id-ID",
                {
                    dateStyle: "short",
                    timeStyle: "medium"
                }
            ).format(
                new Date()
            )
        );


        /* =====================================
           TABEL
        ===================================== */

        renderKasMasuk(
            dataKas.filter(
                function (item) {

                    return (
                        item.jenis ===
                        "MASUK"
                    );

                }
            )
        );


        renderKasKeluar(
            dataKas.filter(
                function (item) {

                    return (
                        item.jenis ===
                        "KELUAR"
                    );

                }
            )
        );


        /* =====================================
           REKAP KATEGORI
        ===================================== */

        renderRekapKategori(
            result.kategoriMasuk || [],
            "tbodyRekapMasuk"
        );


        renderRekapKategori(
            result.kategoriKeluar || [],
            "tbodyRekapKeluar"
        );


        /* =====================================
           20 TRANSAKSI TERAKHIR
        ===================================== */

        renderTransaksiTerakhir(
            dataKas
        );


    } catch (error) {

        console.error(
            "ERROR LOAD DASHBOARD:",
            error
        );


        tampilkanError();


    } finally {

        sedangMemuat = false;

        tampilLoading(false);

    }

}


/* =========================================================
   RENDER ERROR
========================================================= */

function tampilkanError() {

    const masuk =
        document.getElementById(
            "tbodyMasuk"
        );

    const keluar =
        document.getElementById(
            "tbodyKeluar"
        );

    const terakhir =
        document.getElementById(
            "tbodyTransaksiTerakhir"
        );


    if (masuk) {

        masuk.innerHTML = "";

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 5;

        td.className =
            "text-center text-danger py-4";

        td.textContent =
            "Data kas masuk tidak dapat dimuat.";

        tr.appendChild(td);

        masuk.appendChild(tr);

    }


    if (keluar) {

        keluar.innerHTML = "";

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 5;

        td.className =
            "text-center text-danger py-4";

        td.textContent =
            "Data kas keluar tidak dapat dimuat.";

        tr.appendChild(td);

        keluar.appendChild(tr);

    }


    if (terakhir) {

        terakhir.innerHTML = "";

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 7;

        td.className =
            "text-center text-danger py-4";

        td.textContent =
            "Data transaksi tidak dapat dimuat.";

        tr.appendChild(td);

        terakhir.appendChild(tr);

    }

}


/* =========================================================
   CREATE CELL
   AMAN DARI HTML / SCRIPT DARI DATA API
========================================================= */

function createCell(value, className) {

    const td =
        document.createElement("td");

    td.textContent =
        value == null
            ? ""
            : String(value);

    if (className) {

        td.className =
            className;

    }

    return td;

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


    tbody.innerHTML = "";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 5;

        td.className =
            "text-center text-muted py-4";

        td.textContent =
            "Tidak ada transaksi kas masuk";

        tr.appendChild(td);

        tbody.appendChild(tr);

        return;

    }


    data.forEach(
        function (item, index) {

            const tr =
                document.createElement("tr");


            tr.appendChild(
                createCell(
                    index + 1
                )
            );


            tr.appendChild(
                createCell(
                    formatTanggal(
                        item.tanggal
                    )
                )
            );


            tr.appendChild(
                createCell(
                    item.kategori
                )
            );


            tr.appendChild(
                createCell(
                    item.keterangan
                )
            );


            tr.appendChild(
                createCell(
                    formatRupiah(
                        item.nominal
                    ),
                    "text-end fw-bold text-success"
                )
            );


            tbody.appendChild(tr);

        }
    );

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


    tbody.innerHTML = "";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 5;

        td.className =
            "text-center text-muted py-4";

        td.textContent =
            "Tidak ada transaksi kas keluar";

        tr.appendChild(td);

        tbody.appendChild(tr);

        return;

    }


    data.forEach(
        function (item, index) {

            const tr =
                document.createElement("tr");


            tr.appendChild(
                createCell(
                    index + 1
                )
            );


            tr.appendChild(
                createCell(
                    formatTanggal(
                        item.tanggal
                    )
                )
            );


            tr.appendChild(
                createCell(
                    item.kategori
                )
            );


            tr.appendChild(
                createCell(
                    item.keterangan
                )
            );


            tr.appendChild(
                createCell(
                    formatRupiah(
                        item.nominal
                    ),
                    "text-end fw-bold text-danger"
                )
            );


            tbody.appendChild(tr);

        }
    );

}


/* =========================================================
   REKAP KATEGORI
========================================================= */

function renderRekapKategori(
    data,
    targetId
) {

    const tbody =
        document.getElementById(
            targetId
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 4;

        td.className =
            "text-center text-muted py-4";

        td.textContent =
            "Belum ada data.";

        tr.appendChild(td);

        tbody.appendChild(tr);

        return;

    }


    data.forEach(
        function (item, index) {

            const tr =
                document.createElement("tr");


            tr.appendChild(
                createCell(
                    index + 1
                )
            );


            tr.appendChild(
                createCell(
                    item.kategori ||
                    "LAINNYA"
                )
            );


            tr.appendChild(
                createCell(
                    item.transaksi ||
                    0,
                    "text-center"
                )
            );


            tr.appendChild(
                createCell(
                    formatRupiah(
                        item.jumlah
                    ),
                    "text-end"
                )
            );


            tbody.appendChild(tr);

        }
    );

}


/* =========================================================
   20 TRANSAKSI TERAKHIR
   URUTAN:
   TERLAMA → TERBARU
========================================================= */

function renderTransaksiTerakhir(data) {

    const tbody =
        document.getElementById(
            "tbodyTransaksiTerakhir"
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const tr =
            document.createElement("tr");

        const td =
            document.createElement("td");

        td.colSpan = 7;

        td.className =
            "text-center text-muted py-4";

        td.textContent =
            "Belum ada transaksi.";

        tr.appendChild(td);

        tbody.appendChild(tr);

        return;

    }


    let transaksi =
        data.slice();


    /* =====================================
       TERBARU → TERLAMA
    ===================================== */

    transaksi.sort(
        function (a, b) {

            const dateA =
                getDateValue(
                    a.tanggal
                );

            const dateB =
                getDateValue(
                    b.tanggal
                );


            if (
                dateB !== dateA
            ) {

                return dateB - dateA;

            }


            return (
                (Number(b.no) || 0) -
                (Number(a.no) || 0)
            );

        }
    );


    /* =====================================
       AMBIL 20 TERBARU
    ===================================== */

    transaksi =
        transaksi.slice(
            0,
            20
        );


    /* =====================================
       TAMPILKAN TERLAMA → TERBARU
    ===================================== */

    transaksi.reverse();


    transaksi.forEach(
        function (item) {

            const tr =
                document.createElement("tr");


            tr.appendChild(
                createCell(
                    item.no
                )
            );


            tr.appendChild(
                createCell(
                    formatTanggal(
                        item.tanggal
                    )
                )
            );


            /* JENIS */

            const tdJenis =
                document.createElement("td");


            const badge =
                document.createElement("span");


            badge.textContent =
                item.jenis || "";


            if (
                String(item.jenis)
                    .toUpperCase() ===
                "MASUK"
            ) {

                badge.className =
                    "badge bg-success";

            } else {

                badge.className =
                    "badge bg-danger";

            }


            tdJenis.appendChild(
                badge
            );


            tr.appendChild(
                tdJenis
            );


            tr.appendChild(
                createCell(
                    item.kategori
                )
            );


            tr.appendChild(
                createCell(
                    item.keterangan
                )
            );


            tr.appendChild(
                createCell(
                    formatRupiah(
                        item.nominal
                    ),
                    "text-end"
                )
            );


            tr.appendChild(
                createCell(
                    item.petugas ||
                    "-"
                )
            );


            tbody.appendChild(tr);

        }
    );

}


/* =========================================================
   DATE VALUE UNTUK SORTING
========================================================= */

function getDateValue(value) {

    if (!value) {
        return 0;
    }


    const str =
        String(value).trim();


    /* YYYY-MM-DD */

    const match =
        str.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (match) {

        return new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        ).getTime();

    }


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
        inputMulai
            ? inputMulai.value
            : "";


    const akhir =
        inputAkhir
            ? inputAkhir.value
            : "";


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


    const hasil =
        dataKas.filter(
            function (item) {

                const tanggalItem =
                    tanggalKeYYYYMMDD(
                        item.tanggal
                    );


                if (!tanggalItem) {
                    return false;
                }


                return (
                    tanggalItem >= mulai &&
                    tanggalItem <= akhir
                );

            }
        );


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


    /* =====================================
       FILTER TABLE
    ===================================== */

    renderKasMasuk(
        hasil.filter(
            function (item) {
                return (
                    item.jenis ===
                    "MASUK"
                );
            }
        )
    );


    renderKasKeluar(
        hasil.filter(
            function (item) {
                return (
                    item.jenis ===
                    "KELUAR"
                );
            }
        )
    );


    /* =====================================
       KPI FILTER
       
       KPI periode menggunakan data hasil
       filter.
    ===================================== */

    const masuk =
        hasil.reduce(
            function (total, item) {

                if (
                    item.jenis ===
                    "MASUK"
                ) {

                    return (
                        total +
                        Number(
                            item.nominal
                        ) || 0
                    );

                }

                return total;

            },
            0
        );


    const keluar =
        hasil.reduce(
            function (total, item) {

                if (
                    item.jenis ===
                    "KELUAR"
                ) {

                    return (
                        total +
                        Number(
                            item.nominal
                        ) || 0
                    );

                }

                return total;

            },
            0
        );


    const saldo =
        masuk - keluar;


    setText(
        "totalMasuk",
        formatRupiah(masuk)
    );


    setText(
        "totalKeluar",
        formatRupiah(keluar)
    );


    setText(
        "saldo",
        formatRupiah(saldo)
    );


    setText(
        "jumlahTransaksi",
        hasil.length
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


    /* =====================================
       KEMBALIKAN KPI DARI REKAP
       
       Karena data dashboard asli disimpan
       dari response API.
    ===================================== */

    loadData();

}


/* =========================================================
   EVENT DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        console.log(
            "DOM READY"
        );


        /* =====================================
           BUTTON FILTER
        ===================================== */

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


        /* =====================================
           LOAD PERTAMA
        ===================================== */

        loadData();


        /* =====================================
           AUTO REFRESH 30 DETIK
        ===================================== */

        setInterval(
            function () {

                loadData();

            },
            30000
        );

    }
);
