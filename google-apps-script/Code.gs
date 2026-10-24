/**
 * GOOGLE APPS SCRIPT - SINKRONISASI 2 ARAH SIM-BHP PUSKESMAS PETANG I
 * Pasang skrip ini di Google Spreadsheet Anda:
 * 1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1EjRfRzHEA2ILgw0xO6cCtZ5j6yfygbwAq9V3zywUhD0/edit
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script"
 * 3. Hapus seluruh kode bawaan lama, lalu tempelkan (paste) seluruh kode di bawah ini
 * 4. Klik ikon "Simpan" (Ctrl+S)
 * 5. Klik "Terapkan" (Deploy) > "Penerapan Baru" (New Deployment)
 *    (Jika sudah pernah deploy, pilih "Kelola Penerapan" > Edit > Versi Baru / New Version)
 * 6. Pilih Jenis: "Aplikasi Web" (Web app)
 * 7. Konfigurasi:
 *    - Jalankan sebagai (Execute as): Saya (Me / email Anda)
 *    - Siapa yang memiliki akses (Who has access): Siapa saja (Anyone)
 * 8. Klik "Terapkan" (Deploy), lalu Salin "URL Aplikasi Web" (Web app URL)
 * 9. Tempelkan URL tersebut ke Pengaturan SIM-BHP tab "Google Sheets & Hosting"
 */

// 1. FUNGSI POST: MENYIMPAN / MENGIRIM DATA DARI SIM-BHP KE GOOGLE SHEETS
function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.openById("1EjRfRzHEA2Ilgw0xO6cCtZ5j6yfygbwAq9V3zywUhD0");

    // 1. Lembar Master BHP
    if (data.barang && Array.isArray(data.barang)) {
      var sheetBarang = ss.getSheetByName("Master_BHP") || ss.insertSheet("Master_BHP");
      sheetBarang.clear();
      var headersBarang = [["ID", "Kode Barcode", "Nama Barang", "Kategori", "Satuan", "Stok Awal", "Stok Saat Ini", "Stok Minimum", "Harga Satuan (Rp)", "Nilai Aset (Rp)", "Lokasi Rak", "Status", "Terakhir Diperbarui"]];
      sheetBarang.getRange(1, 1, 1, headersBarang[0].length).setValues(headersBarang).setFontWeight("bold").setBackground("#d1fae5");

      var rowsBarang = data.barang.map(function(b) {
        var total = (b.stokSaatIni || 0) * (b.hargaSatuan || 0);
        var status = (b.stokSaatIni <= (b.stokMinimum || 5)) ? "KRITIS (<=5)" : "AMAN";
        return [
          b.id,
          b.kode,
          b.nama,
          b.kategori,
          b.satuan,
          b.stokAwalMaster || 0,
          b.stokSaatIni || 0,
          b.stokMinimum || 5,
          b.hargaSatuan || 0,
          total,
          b.lokasiRak || "-",
          status,
          new Date().toLocaleString("id-ID")
        ];
      });

      if (rowsBarang.length > 0) {
        sheetBarang.getRange(2, 1, rowsBarang.length, headersBarang[0].length).setValues(rowsBarang);
      }
    }

    // 2. Lembar Transaksi Penerimaan
    if (data.penerimaan && Array.isArray(data.penerimaan)) {
      var sheetTerima = ss.getSheetByName("Penerimaan_Masuk") || ss.insertSheet("Penerimaan_Masuk");
      sheetTerima.clear();
      var headersTerima = [["No Urut", "No Faktur", "Tanggal", "Nama Barang", "Kategori", "Jumlah Masuk", "Satuan", "Harga Satuan", "Total Nilai", "Supplier", "Sumber Dana", "Waktu Input"]];
      sheetTerima.getRange(1, 1, 1, headersTerima[0].length).setValues(headersTerima).setFontWeight("bold").setBackground("#e0f2fe");

      var rowsTerima = data.penerimaan.map(function(p) {
        return [
          p.noUrut,
          p.noFaktur,
          p.tanggal,
          p.namaBarang,
          p.kategori,
          p.jumlahMasuk,
          p.satuan,
          p.hargaSatuan,
          p.jumlahTotal,
          p.supplier || "-",
          p.sumberPengadaan,
          new Date().toLocaleString("id-ID")
        ];
      });

      if (rowsTerima.length > 0) {
        sheetTerima.getRange(2, 1, rowsTerima.length, headersTerima[0].length).setValues(rowsTerima);
      }
    }

    // 3. Lembar Transaksi Pengeluaran
    if (data.pengeluaran && Array.isArray(data.pengeluaran)) {
      var sheetKeluar = ss.getSheetByName("Pengeluaran_Amprahan") || ss.insertSheet("Pengeluaran_Amprahan");
      sheetKeluar.clear();
      var headersKeluar = [["No Bukti", "Tanggal", "Nama Barang", "Kategori", "Jumlah Keluar", "Satuan", "Tujuan Ruangan", "Penerima", "Sisa Stok", "Waktu Input"]];
      sheetKeluar.getRange(1, 1, 1, headersKeluar[0].length).setValues(headersKeluar).setFontWeight("bold").setBackground("#fef3c7");

      var rowsKeluar = data.pengeluaran.map(function(k) {
        return [
          k.noBukti,
          k.tanggal,
          k.namaBarang,
          k.kategori,
          k.jumlahKeluar,
          k.satuan,
          k.tujuanRuangan,
          k.penerima || "-",
          k.sisaStok || "-",
          new Date().toLocaleString("id-ID")
        ];
      });

      if (rowsKeluar.length > 0) {
        sheetKeluar.getRange(2, 1, rowsKeluar.length, headersKeluar[0].length).setValues(rowsKeluar);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Sinkronisasi berhasil!" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. FUNGSI GET: MEMBACA / MENARIK DATA DARI GOOGLE SHEETS KE SIM-BHP (SINKRONISASI 2-ARAH)
// Jika baris di Google Sheets dihapus atau diedit, fungsi ini mengembalikan data terbaru ke SIM-BHP
function doGet(e) {
  try {
    var ss = SpreadsheetApp.openById("1EjRfRzHEA2Ilgw0xO6cCtZ5j6yfygbwAq9V3zywUhD0");

    // 1. Membaca Sheet Master_BHP
    var sheetBarang = ss.getSheetByName("Master_BHP");
    var listBarang = [];
    if (sheetBarang && sheetBarang.getLastRow() > 1) {
      var numRowsB = sheetBarang.getLastRow() - 1;
      var valuesB = sheetBarang.getRange(2, 1, numRowsB, 12).getValues();
      listBarang = valuesB.map(function(r) {
        var id = String(r[0] || "").trim();
        var kode = String(r[1] || "").trim();
        var nama = String(r[2] || "").trim();
        var kategori = String(r[3] || "ALAT MEDIS HABIS PAKAI").trim();
        var satuan = String(r[4] || "Pcs").trim();
        var stokAwal = Number(r[5]) || 0;
        var stokSaatIni = Number(r[6]) || 0;
        var stokMin = Number(r[7]) || 5;
        var harga = Number(r[8]) || 0;
        var lokasi = String(r[10] || "-").trim();

        return {
          id: id || ("BHP-" + Math.random().toString(36).substr(2, 6)),
          kode: kode || ("KODE-" + Math.random().toString(36).substr(2, 4)),
          nama: nama,
          kategori: kategori,
          satuan: satuan,
          stokAwalMaster: stokAwal,
          stokSaatIni: stokSaatIni,
          stokMinimum: stokMin,
          hargaSatuan: harga,
          lokasiRak: lokasi
        };
      }).filter(function(b) {
        return b.nama && b.nama !== "";
      });
    }

    // 2. Membaca Sheet Penerimaan_Masuk
    var sheetTerima = ss.getSheetByName("Penerimaan_Masuk");
    var listPenerimaan = [];
    if (sheetTerima && sheetTerima.getLastRow() > 1) {
      var numRowsT = sheetTerima.getLastRow() - 1;
      var valuesT = sheetTerima.getRange(2, 1, numRowsT, 11).getValues();
      listPenerimaan = valuesT.map(function(r, idx) {
        var noUrut = Number(r[0]) || (idx + 1);
        var noFaktur = String(r[1] || "-").trim();
        var tgl = r[2];
        var tanggalStr = "";
        if (tgl instanceof Date) {
          tanggalStr = Utilities.formatDate(tgl, "GMT+8", "yyyy-MM-dd");
        } else {
          tanggalStr = String(tgl || "").trim();
        }
        var namaBarang = String(r[3] || "").trim();
        var kategori = String(r[4] || "ALAT MEDIS HABIS PAKAI").trim();
        var jumlahMasuk = Number(r[5]) || 0;
        var satuan = String(r[6] || "Pcs").trim();
        var hargaSatuan = Number(r[7]) || 0;
        var jumlahTotal = Number(r[8]) || (jumlahMasuk * hargaSatuan);
        var supplier = String(r[9] || "-").trim();
        var sumberPengadaan = String(r[10] || "APBD / DAK").trim();

        return {
          id: "TRX-" + noUrut + "-" + (idx + 1),
          noUrut: noUrut,
          noFaktur: noFaktur,
          tanggal: tanggalStr,
          namaBarang: namaBarang,
          kategori: kategori,
          jumlahMasuk: jumlahMasuk,
          satuan: satuan,
          hargaSatuan: hargaSatuan,
          jumlahTotal: jumlahTotal,
          supplier: supplier,
          sumberPengadaan: sumberPengadaan
        };
      }).filter(function(p) {
        return p.namaBarang && p.namaBarang !== "";
      });
    }

    // 3. Membaca Sheet Pengeluaran_Amprahan
    var sheetKeluar = ss.getSheetByName("Pengeluaran_Amprahan");
    var listPengeluaran = [];
    if (sheetKeluar && sheetKeluar.getLastRow() > 1) {
      var numRowsK = sheetKeluar.getLastRow() - 1;
      var valuesK = sheetKeluar.getRange(2, 1, numRowsK, 9).getValues();
      listPengeluaran = valuesK.map(function(r, idx) {
        var noBukti = String(r[0] || ("OUT-" + (idx + 1))).trim();
        var tgl = r[1];
        var tanggalStr = "";
        if (tgl instanceof Date) {
          tanggalStr = Utilities.formatDate(tgl, "GMT+8", "yyyy-MM-dd");
        } else {
          tanggalStr = String(tgl || "").trim();
        }
        var namaBarang = String(r[2] || "").trim();
        var kategori = String(r[3] || "ALAT MEDIS HABIS PAKAI").trim();
        var jumlahKeluar = Number(r[4]) || 0;
        var satuan = String(r[5] || "Pcs").trim();
        var tujuanRuangan = String(r[6] || "UGD").trim();
        var penerima = String(r[7] || "-").trim();
        var sisaStok = Number(r[8]) || 0;

        return {
          id: "OUT-" + noBukti + "-" + (idx + 1),
          noBukti: noBukti,
          tanggal: tanggalStr,
          namaBarang: namaBarang,
          kategori: kategori,
          jumlahKeluar: jumlahKeluar,
          satuan: satuan,
          tujuanRuangan: tujuanRuangan,
          penerima: penerima,
          sisaStok: sisaStok
        };
      }).filter(function(k) {
        return k.namaBarang && k.namaBarang !== "";
      });
    }

    var result = {
      status: "success",
      source: "Google Spreadsheet SIM-BHP Puskesmas Petang I",
      timestamp: new Date().toISOString(),
      counts: {
        barang: listBarang.length,
        penerimaan: listPenerimaan.length,
        pengeluaran: listPengeluaran.length
      },
      barang: listBarang,
      penerimaan: listPenerimaan,
      pengeluaran: listPengeluaran
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}