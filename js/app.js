let dataKas = [];


// ========================================
// FORMAT RUPIAH
// ========================================

function formatRupiah(angka) {

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

    if (!tanggal) return "-";

    const d = new Date(tanggal);

    if (isNaN(d)) {
        return tanggal;
    }

    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

}


// ========================================
// LOAD DATA
// ========================================

async function loadData() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Gagal mengambil data");
        }

        dataKas = await response.json();

        tampilkanData();

    } catch (error) {

        console.error(error);

        document.getElementById("tbodyMasuk").innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Gagal mengambil data kas
                </td>
            </tr>
        `;

        document.getElementById("tbodyKeluar").innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Gagal mengambil data kas
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

    const masuk = dataKas.filter(
        item => String(item.jenis).toUpperCase() === "MASUK"
    );

    const keluar = dataKas.filter(
        item => String(item.jenis).toUpperCase() === "KELUAR"
    );


    // ====================================
    // HITUNG TOTAL
    // ====================================

    masuk.forEach(item => {
        totalMasuk += Number(item.nominal) || 0;
    });

    keluar.forEach(item => {
        totalKeluar += Number(item.nominal) || 0;
    });


    const saldo = totalMasuk - totalKeluar;


    // ====================================
    // TAMPILKAN RINGKASAN
    // ====================================

    document.getElementById("totalMasuk").innerText =
        formatRupiah(totalMasuk);

    document.getElementById("totalKeluar").innerText =
        formatRupiah(totalKeluar);

    document.getElementById("saldo").innerText =
        formatRupiah(saldo);


    // ====================================
    // FOOTER
    // ====================================

    document.getElementById("footerMasuk").innerText =
        formatRupiah(totalMasuk);

    document.getElementById("footerKeluar").innerText =
        formatRupiah(totalKeluar);


    // ====================================
    // REKAP
    // ====================================

    document.getElementById("rekapMasuk").innerText =
        formatRupiah(totalMasuk);

    document.getElementById("rekapKeluar").innerText =
        formatRupiah(totalKeluar);

    document.getElementById("rekapSaldo").innerText =
        formatRupiah(saldo);


    // ====================================
    // JUMLAH TRANSAKSI
    // ====================================

    document.getElementById("jumlahTransaksi").innerText =
        dataKas.length;


    // ====================================
    // TANGGAL UPDATE
    // ====================================

    const sekarang = new Date();

    document.getElementById("lastUpdate").innerText =
        sekarang.toLocaleString("id-ID");


    // ====================================
    // TABEL MASUK
    // ====================================

    let htmlMasuk = "";

    masuk.forEach((item, index) => {

        htmlMasuk += `
            <tr>

                <td>${index + 1}</td>

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

    document.getElementById("tbodyMasuk").innerHTML =
        htmlMasuk;


    // ====================================
    // TABEL KELUAR
    // ====================================

    let htmlKeluar = "";

    keluar.forEach((item, index) => {

        htmlKeluar += `
            <tr>

                <td>${index + 1}</td>

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

    document.getElementById("tbodyKeluar").innerHTML =
        htmlKeluar;

}


// ========================================
// LOAD PERTAMA
// ========================================

loadData();


// ========================================
// AUTO REFRESH 30 DETIK
// ========================================

setInterval(function() {

    loadData();

}, 30000);
