"use strict";

/* =========================================================
   GLOBAL
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
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(nilai);

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(id, value) {

    const el =
        document.getElementById(id);

    if (el) {

        el.textContent =
            value == null
                ? ""
                : String(value);

    }

}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(value) {

    if (!value) {
        return "-";
    }

    const str =
        String(value).trim();


    /* YYYY-MM-DD */

    let match =
        str.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

    if (match) {

        return (
            match[3] +
            "/" +
            match[2] +
            "/" +
            match[1]
        );

    }


    /* DD/MM/YYYY */

    match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

    if (match) {

        return (
            String(match[1]).padStart(2, "0") +
            "/" +
            String(match[2]).padStart(2, "0") +
            "/" +
            match[3]
        );

    }


    /* ISO DATE */

    const d =
        new Date(value);

    if (
        isNaN(d.getTime())
    ) {

        return str;

    }

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            timeZone: "Asia/Jakarta",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(d);

}


/* =========================================================
   GET DATE VALUE
========================================================= */

function getDateValue(value) {

    if (!value) {
        return 0;
    }

    const str =
        String(value).trim();


    /* YYYY-MM-DD */

    let match =
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


    /* DD/MM/YYYY */

    match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

    if (match) {

        return new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1])
        ).getTime();

    }


    /* DATE OBJECT / ISO */

    const d =
        new Date(value);

    if (
        isNaN(d.getTime())
    ) {

        return 0;

    }

    return d.getTime();

}


/* =========================================================
   DATE KE YYYY-MM-DD
========================================================= */

function tanggalKeYYYYMMDD(value) {

    if (!value) {
        return "";
    }

    const str =
        String(value).trim();


    /* Sudah YYYY-MM-DD */

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

        return (
            match[3] +
            "-" +
            String(match[2]).padStart(2, "0") +
            "-" +
            String(match[1]).padStart(2, "0")
        );

    }


    /* DD-MM-YYYY */

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


    const d =
        new Date(value);

    if (
        isNaN(d.getTime())
    ) {

        return "";

    }

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
   LOAD DASHBOARD
========================================================= */

async function loadData() {

    if (sedangMemuat) {
        return;
    }

    sedangMemuat = true;

    try {

        tampilLoading(true);


        /* =====================================
           API DASHBOARD
        ===================================== */

        const url =
            SHEET_URL +
            "?action=dashboard&_=" +
            Date.now();


        console.log(
            "DASHBOARD API:",
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
            "DASHBOARD RESPONSE:",
            result
        );


        /* =====================================
           VALIDASI API
        ===================================== */

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Response API tidak valid."
            );

        }


        /* =====================================
           AMBIL DATA TRANSAKSI
           
           PRIORITAS:
           transaksiTerakhir
           lalu data
        ===================================== */

        if (
            Array.isArray(
                result.transaksiTerakhir
            )
        ) {

            dataKas =
                result.transaksiTerakhir.slice();

        }

        else if (
            Array.isArray(
                result.data
            )
        ) {

            dataKas =
                result.data.slice();

        }

        else {

            dataKas = [];

        }


        console.log(
            "DATA KAS:",
            dataKas
        );


        console.log(
            "JUMLAH DATA:",
            dataKas.length
        );


        /* =====================================
           NORMALISASI DATA
        ===================================== */

        dataKas =
            dataKas.map(
                function(item, index) {

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
           KPI DARI REKAP
           
           Backend:
           REKAP!B3 = Total Masuk
           REKAP!B4 = Total Keluar
           REKAP!B5 = Saldo
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
           TAMPILKAN KPI
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
           KAS MASUK
        ===================================== */

        renderKasMasuk(
            dataKas.filter(
                function(item) {

                    return (
                        item.jenis ===
                        "MASUK"
                    );

                }
            )
        );


        /* =====================================
           KAS KELUAR
        ===================================== */

        renderKasKeluar(
            dataKas.filter(
                function(item) {

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


    }

    catch(error) {

        console.error(
            "ERROR LOAD DASHBOARD:",
            error
        );

        tampilkanError();

    }

    finally {

        sedangMemuat = false;

        tampilLoading(false);

    }

}


/* =========================================================
   ERROR
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
   AMAN
========================================================= */

function createCell(
    value,
    className = ""
) {

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
   KAS MASUK
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
        function(item, index) {

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
   KAS KELUAR
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
        function(item, index) {

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
        function(item, index) {

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
                    item.transaksi || 0,
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
========================================================= */

function renderTransaksiTerakhir(data) {

    const tbody =
        document.getElementById(
            "tbodyTransaksiTerakhir"
        );


    console.log(
        "TARGET 20 TRANSAKSI:",
        tbody
    );


    if (!tbody) {

        console.error(
            "ID tbodyTransaksiTerakhir TIDAK ADA DI HTML."
        );

        return;

    }


    /* =====================================
       BERSIHKAN
    ===================================== */

    tbody.innerHTML = "";


    /* =====================================
       TIDAK ADA DATA
    ===================================== */

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


    console.log(
        "DATA UNTUK 20 TRANSAKSI:",
        data
    );


    /* =====================================
       COPY DATA
    ===================================== */

    let transaksi =
        data.slice();


    /* =====================================
       SORT TERBARU → TERLAMA
    ===================================== */

    transaksi.sort(
        function(a, b) {

            const tanggalA =
                getDateValue(
                    a.tanggal
                );

            const tanggalB =
                getDateValue(
                    b.tanggal
                );


            if (
                tanggalB !== tanggalA
            ) {

                return (
                    tanggalB -
                    tanggalA
                );

            }


            return (
                Number(b.no || 0) -
                Number(a.no || 0)
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
       URUT TERLAMA → TERBARU
    ===================================== */

    transaksi.reverse();


    console.log(
        "20 TRANSAKSI FINAL:",
        transaksi
    );


    /* =====================================
       RENDER
    ===================================== */

    transaksi.forEach(
        function(item) {

            const tr =
                document.createElement("tr");


            /* NO */

            tr.appendChild(
                createCell(
                    item.no
                )
            );


            /* TANGGAL */

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


            const jenis =
                String(
                    item.jenis || ""
                ).toUpperCase();


            badge.textContent =
                jenis;


            if (
                jenis === "MASUK"
            ) {

                badge.className =
                    "badge bg-success";

            }

            else {

                badge.className =
                    "badge bg-danger";

            }


            tdJenis.appendChild(
                badge
            );


            tr.appendChild(
                tdJenis
            );


            /* KATEGORI */

            tr.appendChild(
                createCell(
                    item.kategori
                )
            );


            /* KETERANGAN */

            tr.appendChild(
                createCell(
                    item.keterangan
                )
            );


            /* NOMINAL */

            tr.appendChild(
                createCell(
                    formatRupiah(
                        item.nominal
                    ),
                    "text-end fw-bold"
                )
            );


            /* PETUGAS */

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


    const hasil =
        dataKas.filter(
            function(item) {

                const tanggal =
                    tanggalKeYYYYMMDD(
                        item.tanggal
                    );

                return (
                    tanggal >= mulai &&
                    tanggal <= akhir
                );

            }
        );


    /* =====================================
       PERIODE
    ===================================== */

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
       TABLE MASUK
    ===================================== */

    renderKasMasuk(
        hasil.filter(
            function(item) {

                return (
                    item.jenis ===
                    "MASUK"
                );

            }
        )
    );


    /* =====================================
       TABLE KELUAR
    ===================================== */

    renderKasKeluar(
        hasil.filter(
            function(item) {

                return (
                    item.jenis ===
                    "KELUAR"
                );

            }
        )
    );


    /* =====================================
       KPI FILTER
    ===================================== */

    let masuk = 0;
    let keluar = 0;


    hasil.forEach(
        function(item) {

            if (
                item.jenis ===
                "MASUK"
            ) {

                masuk +=
                    Number(
                        item.nominal
                    ) || 0;

            }


            if (
                item.jenis ===
                "KELUAR"
            ) {

                keluar +=
                    Number(
                        item.nominal
                    ) || 0;

            }

        }
    );


    setText(
        "totalMasuk",
        formatRupiah(
            masuk
        )
    );


    setText(
        "totalKeluar",
        formatRupiah(
            keluar
        )
    );


    setText(
        "saldo",
        formatRupiah(
            masuk - keluar
        )
    );


    setText(
        "jumlahTransaksi",
        hasil.length
    );


    /* =====================================
       20 TRANSAKSI HASIL FILTER
    ===================================== */

    renderTransaksiTerakhir(
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


    /* =====================================
       KEMBALIKAN DATA DARI SERVER
    ===================================== */

    loadData();

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "DOM READY"
        );


        /* =====================================
           BUTTON TAMPILKAN
        ===================================== */

        const btnTampilkan =
            document.getElementById(
                "btnTampilkan"
            );


        if (btnTampilkan) {

            btnTampilkan.addEventListener(
                "click",
                filterPeriode
            );

        }


        /* =====================================
           BUTTON SEMUA DATA
        ===================================== */

        const btnSemua =
            document.getElementById(
                "btnSemua"
            );


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
            function() {

                loadData();

            },
            30000
        );

    }
);
