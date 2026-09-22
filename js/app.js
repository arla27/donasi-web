let dataKas = [];


// ========================================
// FORMAT RUPIAH
// ========================================

function formatRupiah(angka) {

    angka = Number(angka) || 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);

}


// ========================================
// FORMAT TANGGAL
// ========================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    // Jika Google mengirim Date object/string ISO
    if (typeof tanggal === "string") {

        // Format DD/MM/YYYY
        const match = tanggal.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

        if (match) {

            return String(match[1]).padStart(2, "0") + "/" +
                   String(match[2]).padStart(2, "0") + "/" +
                   match[3];

        }

        // Format YYYY-MM-DD
        const matchISO = tanggal.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );

        if (matchISO) {

            return String(matchISO[3]).padStart(2, "0") + "/" +
                   String(matchISO[2]).padStart(2, "0") + "/" +
                   matchISO[1];

        }

    }

    return tanggal;

}


// ========================================
// LOAD DATA
// ========================================

async function loadData() {

    try {

        console.log("================================");
        console.log("LOAD DATA KAS DKM");
        console.log("URL:", SHEET_URL);


        const response = await fetch(SHEET_URL, {
            method: "GET",
            cache: "no-cache"
        });


        console.log(
            "HTTP STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP Error " + response.status
            );

        }


        const result = await response.json();


        console.log(
            "RESPON GOOGLE APPS SCRIPT:",
            result
        );


        // ====================================
        // CEK FORMAT RESPONSE
        // ====================================

        if (result.success === false) {

            throw new Error(
                result.message || "API mengembalikan error"
            );

        }


        // ====================================
        // AMBIL DATA
        // ====================================

        if (Array.isArray(result)) {

            // Jika Apps Script langsung mengirim array
            dataKas = result;

        } else if (Array.isArray(result.data)) {

            // Jika Apps Script mengirim:
            // {success:true,data:[...]}

            dataKas = result.data;

        } else {

            throw new Error(
                "Format data dari Apps Script tidak dikenali"
            );

        }


        console.log(
            "JUMLAH DATA:",
            dataKas.length
        );


        tampilkanData();


    } catch (error) {

        console.error(
            "ERROR LOAD DATA:",
            error
        );


        document.getElementById(
            "tbodyMasuk"
        ).innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-danger">

                    Gagal mengambil data kas

                    <br>

                    <small>
                        ${error.message}
                    </small>

                </td>
            </tr>
        `;


        document.getElementById(
            "tbodyKeluar"
        ).innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-danger">

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


// ========================================
// TAMPILKAN DATA
// ========================================

function tampilkanData() {

    let totalMasuk = 0;
    let totalKeluar = 0;


    // ====================================
    // FILTER MASUK
    // ====================================

    const masuk = dataKas.filter(item => {

        return String(item.jenis || "")
            .trim()
            .toUpperCase() === "MASUK";

    });


    // ====================================
    // FILTER KELUAR
    // ====================================

    const keluar = dataKas.filter(item => {

        return String(item.jenis || "")
            .trim()
            .toUpperCase() === "KELUAR";

    });


    // ====================================
    // HITUNG TOTAL MASUK
    // ====================================

    masuk.forEach(item => {

        totalMasuk += Number(item.nominal) || 0;

    });


    // ====================================
    // HITUNG TOTAL KELUAR
    // ====================================

    keluar.forEach(item => {

        totalKeluar += Number(item.nominal) || 0;

    });


    // ====================================
    // SALDO
    // ====================================

    const saldo =
        totalMasuk - totalKeluar;


    // ====================================
    // SUMMARY
    // ====================================

    document.getElementById(
        "totalMasuk"
    ).innerText =
        formatRupiah(totalMasuk);


    document.getElementById(
        "totalKeluar"
    ).innerText =
        formatRupiah(totalKeluar);


    document.getElementById(
        "saldo"
    ).innerText =
        formatRupiah(saldo);


    // ====================================
    // FOOTER
    // ====================================

    document.getElementById(
        "footerMasuk"
    ).innerText =
        formatRupiah(totalMasuk);


    document.getElementById(
        "footerKeluar"
    ).innerText =
        formatRupiah(totalKeluar);


    // ====================================
    // REKAP
    // ====================================

    document.getElementById(
        "rekapMasuk"
    ).innerText =
        formatRupiah(totalMasuk);


    document.getElementById(
        "rekapKeluar"
    ).innerText =
        formatRupiah(totalKeluar);


    document.getElementById(
        "rekapSaldo"
    ).innerText =
        formatRupiah(saldo);


    // ====================================
    // JUMLAH TRANSAKSI
    // ====================================

    document.getElementById(
        "jumlahTransaksi"
    ).innerText =
        dataKas.length;


    // ====================================
    // UPDATE TERAKHIR
    // ====================================

    document.getElementById(
        "lastUpdate"
    ).innerText =
        new Date().toLocaleString("id-ID");


    // ====================================
    // TABEL KAS MASUK
    // ====================================

    let htmlMasuk = "";


    masuk.forEach((item, index) => {

        htmlMasuk += `

            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${formatTanggal(item.tanggal)}
                </td>

                <td>
                    ${item.kategori || "-"}
                </td>

                <td>
                    ${item.keterangan || "-"}
                </td>

                <td class="text-end text-success fw-bold">

                    ${formatRupiah(item.nominal)}

                </td>

            </tr>

        `;

    });


    if (htmlMasuk === "") {

        htmlMasuk = `

            <tr>

                <td colspan="5"
                    class="text-center text-muted">

                    Belum ada kas masuk

                </td>

            </tr>

        `;

    }


    document.getElementById(
        "tbodyMasuk"
    ).innerHTML =
        htmlMasuk;


    // ====================================
    // TABEL KAS KELUAR
    // ====================================

    let htmlKeluar = "";


    keluar.forEach((item, index) => {

        htmlKeluar += `

            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${formatTanggal(item.tanggal)}
                </td>

                <td>
                    ${item.kategori || "-"}
                </td>

                <td>
                    ${item.keterangan || "-"}
                </td>

                <td class="text-end text-danger fw-bold">

                    ${formatRupiah(item.nominal)}

                </td>

            </tr>

        `;

    });


    if (htmlKeluar === "") {

        htmlKeluar = `

            <tr>

                <td colspan="5"
                    class="text-center text-muted">

                    Belum ada kas keluar

                </td>

            </tr>

        `;

    }


    document.getElementById(
        "tbodyKeluar"
    ).innerHTML =
        htmlKeluar;

}


// ========================================
// LOAD PERTAMA
// ========================================

loadData();


// ========================================
// AUTO REFRESH 30 DETIK
// ========================================

setInterval(() => {

    loadData();

}, 30000);
