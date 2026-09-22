// ======================================================
// DATA GLOBAL
// ======================================================

let dataKas = [];


// ======================================================
// FORMAT RUPIAH
// ======================================================

function formatRupiah(angka) {

    angka = Number(angka) || 0;

    return new Intl.NumberFormat("id-ID", {

        style: "currency",

        currency: "IDR",

        minimumFractionDigits: 0

    }).format(angka);

}



// ======================================================
// FORMAT TANGGAL UNTUK TAMPILAN
// ======================================================

function formatTanggal(tanggal) {

    if (!tanggal) {

        return "-";

    }


    // ----------------------------------------------
    // FORMAT DD/MM/YYYY
    // ----------------------------------------------

    if (typeof tanggal === "string") {

        const match = tanggal.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


        if (match) {

            return (

                String(match[1]).padStart(2, "0")
                + "/"
                +
                String(match[2]).padStart(2, "0")
                + "/"
                +
                match[3]

            );

        }


        // ------------------------------------------
        // FORMAT YYYY-MM-DD
        // ------------------------------------------

        const matchISO = tanggal.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );


        if (matchISO) {

            return (

                String(matchISO[3]).padStart(2, "0")
                + "/"
                +
                String(matchISO[2]).padStart(2, "0")
                + "/"
                +
                matchISO[1]

            );

        }

    }


    return tanggal;

}



// ======================================================
// PARSE TANGGAL
// ======================================================

function parseTanggal(tanggal) {

    if (!tanggal) {

        return null;

    }


    // ==================================================
    // FORMAT DD/MM/YYYY
    // ==================================================

    if (typeof tanggal === "string") {

        const match = tanggal.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


        if (match) {

            const hari =
                parseInt(match[1], 10);

            const bulan =
                parseInt(match[2], 10) - 1;

            const tahun =
                parseInt(match[3], 10);


            return new Date(
                tahun,
                bulan,
                hari
            );

        }


        // ==================================================
        // FORMAT YYYY-MM-DD
        // ==================================================

        const matchISO = tanggal.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );


        if (matchISO) {

            return new Date(

                parseInt(matchISO[1], 10),

                parseInt(matchISO[2], 10) - 1,

                parseInt(matchISO[3], 10)

            );

        }

    }


    // ==================================================
    // FORMAT DATE / ISO
    // ==================================================

    const d = new Date(tanggal);


    if (!isNaN(d.getTime())) {

        return new Date(

            d.getFullYear(),

            d.getMonth(),

            d.getDate()

        );

    }


    return null;

}



// ======================================================
// LOAD DATA DARI GOOGLE APPS SCRIPT
// ======================================================

async function loadData() {

    try {

        console.log(
            "===================================="
        );

        console.log(
            "LOAD DATA KAS DKM"
        );

        console.log(
            "URL:",
            SHEET_URL
        );


        // ==================================================
        // REQUEST
        // ==================================================

        const response = await fetch(

            SHEET_URL,

            {

                method: "GET",

                cache: "no-cache"

            }

        );


        console.log(
            "HTTP STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(

                "HTTP Error " +
                response.status

            );

        }


        // ==================================================
        // JSON
        // ==================================================

        const result =
            await response.json();


        console.log(
            "RESPON API:",
            result
        );


        // ==================================================
        // CEK ERROR DARI API
        // ==================================================

        if (
            result &&
            result.success === false
        ) {

            throw new Error(

                result.message ||
                "API mengembalikan error"

            );

        }


        // ==================================================
        // AMBIL DATA
        // ==================================================

        if (
            Array.isArray(result)
        ) {

            // API langsung mengembalikan array

            dataKas = result;

        }

        else if (
            result &&
            Array.isArray(result.data)
        ) {

            // API mengembalikan:
            // {success:true,data:[]}

            dataKas = result.data;

        }

        else {

            throw new Error(

                "Format data dari Google Apps Script tidak dikenali"

            );

        }


        console.log(
            "JUMLAH DATA:",
            dataKas.length
        );


        // ==================================================
        // TAMPILKAN SEMUA DATA
        // ==================================================

        tampilkanData(dataKas);


    }

    catch (error) {


        console.error(
            "ERROR LOAD DATA:",
            error
        );


        // ==================================================
        // TABEL MASUK
        // ==================================================

        document.getElementById(
            "tbodyMasuk"
        ).innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-danger"
                >

                    Gagal mengambil data kas

                    <br>

                    <small>

                        ${error.message}

                    </small>

                </td>

            </tr>

        `;


        // ==================================================
        // TABEL KELUAR
        // ==================================================

        document.getElementById(
            "tbodyKeluar"
        ).innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-danger"
                >

                    Gagal mengambil data kas

                    <br>

                    <small>

                        ${error.message}

                    </small>

                </td>

            </tr>

        `;

    }

}



// ======================================================
// TAMPILKAN DATA
// ======================================================

function tampilkanData(dataUntukDitampilkan) {


    // ==================================================
    // PASTIKAN ARRAY
    // ==================================================

    if (!Array.isArray(dataUntukDitampilkan)) {

        dataUntukDitampilkan = [];

    }


    // ==================================================
    // TOTAL
    // ==================================================

    let totalMasuk = 0;

    let totalKeluar = 0;



    // ==================================================
    // FILTER KAS MASUK
    // ==================================================

    const masuk =
        dataUntukDitampilkan.filter(

            item => {

                return String(
                    item.jenis || ""
                )
                .trim()
                .toUpperCase()
                === "MASUK";

            }

        );



    // ==================================================
    // FILTER KAS KELUAR
    // ==================================================

    const keluar =
        dataUntukDitampilkan.filter(

            item => {

                return String(
                    item.jenis || ""
                )
                .trim()
                .toUpperCase()
                === "KELUAR";

            }

        );



    // ==================================================
    // HITUNG KAS MASUK
    // ==================================================

    masuk.forEach(

        item => {

            totalMasuk +=
                Number(item.nominal) || 0;

        }

    );



    // ==================================================
    // HITUNG KAS KELUAR
    // ==================================================

    keluar.forEach(

        item => {

            totalKeluar +=
                Number(item.nominal) || 0;

        }

    );



    // ==================================================
    // SALDO
    // ==================================================

    const saldo =
        totalMasuk - totalKeluar;



    // ==================================================
    // CARD KAS MASUK
    // ==================================================

    document.getElementById(
        "totalMasuk"
    ).innerText =
        formatRupiah(totalMasuk);



    // ==================================================
    // CARD KAS KELUAR
    // ==================================================

    document.getElementById(
        "totalKeluar"
    ).innerText =
        formatRupiah(totalKeluar);



    // ==================================================
    // CARD SALDO
    // ==================================================

    document.getElementById(
        "saldo"
    ).innerText =
        formatRupiah(saldo);



    // ==================================================
    // FOOTER MASUK
    // ==================================================

    document.getElementById(
        "footerMasuk"
    ).innerText =
        formatRupiah(totalMasuk);



    // ==================================================
    // FOOTER KELUAR
    // ==================================================

    document.getElementById(
        "footerKeluar"
    ).innerText =
        formatRupiah(totalKeluar);



    // ==================================================
    // REKAP MASUK
    // ==================================================

    document.getElementById(
        "rekapMasuk"
    ).innerText =
        formatRupiah(totalMasuk);



    // ==================================================
    // REKAP KELUAR
    // ==================================================

    document.getElementById(
        "rekapKeluar"
    ).innerText =
        formatRupiah(totalKeluar);



    // ==================================================
    // REKAP SALDO
    // ==================================================

    document.getElementById(
        "rekapSaldo"
    ).innerText =
        formatRupiah(saldo);



    // ==================================================
    // JUMLAH TRANSAKSI
    // ==================================================

    document.getElementById(
        "jumlahTransaksi"
    ).innerText =
        dataUntukDitampilkan.length;



    // ==================================================
    // UPDATE TERAKHIR
    // ==================================================

    document.getElementById(
        "lastUpdate"
    ).innerText =
        new Date().toLocaleString(
            "id-ID"
        );



    // ==================================================
    // TABEL KAS MASUK
    // ==================================================

    let htmlMasuk = "";


    masuk.forEach(

        (item, index) => {


            htmlMasuk += `

                <tr>

                    <td>

                        ${index + 1}

                    </td>


                    <td>

                        ${formatTanggal(
                            item.tanggal
                        )}

                    </td>


                    <td>

                        ${
                            item.kategori ||
                            "-"
                        }

                    </td>


                    <td>

                        ${
                            item.keterangan ||
                            "-"
                        }

                    </td>


                    <td
                        class="text-end text-success fw-bold"
                    >

                        ${formatRupiah(
                            item.nominal
                        )}

                    </td>

                </tr>

            `;

        }

    );



    // ==================================================
    // TIDAK ADA KAS MASUK
    // ==================================================

    if (htmlMasuk === "") {

        htmlMasuk = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted"
                >

                    Tidak ada kas masuk
                    pada periode ini

                </td>

            </tr>

        `;

    }



    document.getElementById(
        "tbodyMasuk"
    ).innerHTML =
        htmlMasuk;



    // ==================================================
    // TABEL KAS KELUAR
    // ==================================================

    let htmlKeluar = "";


    keluar.forEach(

        (item, index) => {


            htmlKeluar += `

                <tr>

                    <td>

                        ${index + 1}

                    </td>


                    <td>

                        ${formatTanggal(
                            item.tanggal
                        )}

                    </td>


                    <td>

                        ${
                            item.kategori ||
                            "-"
                        }

                    </td>


                    <td>

                        ${
                            item.keterangan ||
                            "-"
                        }

                    </td>


                    <td
                        class="text-end text-danger fw-bold"
                    >

                        ${formatRupiah(
                            item.nominal
                        )}

                    </td>

                </tr>

            `;

        }

    );



    // ==================================================
    // TIDAK ADA KAS KELUAR
    // ==================================================

    if (htmlKeluar === "") {

        htmlKeluar = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted"
                >

                    Tidak ada kas keluar
                    pada periode ini

                </td>

            </tr>

        `;

    }



    document.getElementById(
        "tbodyKeluar"
    ).innerHTML =
        htmlKeluar;

}



// ======================================================
// FILTER PERIODE
// ======================================================

function filterPeriode() {


    // ==================================================
    // AMBIL INPUT
    // ==================================================

    const tanggalMulai =
        document.getElementById(
            "tanggalMulai"
        ).value;


    const tanggalAkhir =
        document.getElementById(
            "tanggalAkhir"
        ).value;



    // ==================================================
    // VALIDASI TANGGAL
    // ==================================================

    if (
        !tanggalMulai ||
        !tanggalAkhir
    ) {

        alert(
            "Silakan pilih tanggal mulai dan tanggal akhir."
        );

        return;

    }



    // ==================================================
    // VALIDASI URUTAN
    // ==================================================

    if (
        tanggalMulai >
        tanggalAkhir
    ) {

        alert(
            "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
        );

        return;

    }



    // ==================================================
    // BUAT TANGGAL
    // ==================================================

    const mulai =
        new Date(
            tanggalMulai +
            "T00:00:00"
        );


    const akhir =
        new Date(
            tanggalAkhir +
            "T23:59:59"
        );



    // ==================================================
    // FILTER
    // ==================================================

    const hasil =
        dataKas.filter(

            item => {


                const tanggalData =
                    parseTanggal(
                        item.tanggal
                    );


                if (!tanggalData) {

                    return false;

                }


                return (

                    tanggalData >= mulai &&
                    tanggalData <= akhir

                );

            }

        );



    // ==================================================
    // TAMPILKAN
    // ==================================================

    tampilkanData(
        hasil
    );



    // ==================================================
    // FORMAT LABEL PERIODE
    // ==================================================

    const mulaiText =
        new Date(
            tanggalMulai +
            "T00:00:00"
        ).toLocaleDateString(
            "id-ID",
            {

                day: "2-digit",

                month: "2-digit",

                year: "numeric"

            }
        );


    const akhirText =
        new Date(
            tanggalAkhir +
            "T00:00:00"
        ).toLocaleDateString(
            "id-ID",
            {

                day: "2-digit",

                month: "2-digit",

                year: "numeric"

            }
        );



    document.getElementById(
        "periode"
    ).innerText =

        mulaiText +
        " s/d " +
        akhirText;

}



// ======================================================
// SEMUA DATA
// ======================================================

function tampilkanSemuaData() {


    // ==================================================
    // KOSONGKAN INPUT
    // ==================================================

    document.getElementById(
        "tanggalMulai"
    ).value = "";


    document.getElementById(
        "tanggalAkhir"
    ).value = "";



    // ==================================================
    // LABEL
    // ==================================================

    document.getElementById(
        "periode"
    ).innerText =
        "Semua Data";



    // ==================================================
    // TAMPILKAN SEMUA
    // ==================================================

    tampilkanData(
        dataKas
    );

}



// ======================================================
// EVENT BUTTON
// ======================================================

document
    .getElementById(
        "btnTampilkan"
    )
    .addEventListener(
        "click",
        filterPeriode
    );



document
    .getElementById(
        "btnSemua"
    )
    .addEventListener(
        "click",
        tampilkanSemuaData
    );



// ======================================================
// LOAD DATA PERTAMA
// ======================================================

loadData();



// ======================================================
// AUTO REFRESH 30 DETIK
// ======================================================

setInterval(

    function() {

        loadData();

    },

    30000

);
