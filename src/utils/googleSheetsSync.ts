import { Barang, PenerimaanBarang, PengeluaranBarang } from '../types';

export const SPREADSHEET_ID = '1EjRfRzHEA2ILgw0xO6cCtZ5j6yfygbwAq9V3zywUhD0';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=0#gid=0`;

/**
 * URL Webhook Google Apps Script bawaan (default).
 * Jika diisi, semua perangkat (HP, Laptop, PC, Penguji) otomatis tersambung tanpa perlu input ulang di browser HP.
 */
export const DEFAULT_GAS_WEBHOOK_URL = '';

/**
 * Mengambil URL Webhook yang aktif: mengutamakan yang tersimpan di LocalStorage HP/Laptop,
 * jika belum ada, menggunakan DEFAULT_GAS_WEBHOOK_URL.
 */
export const getEffectiveWebhookUrl = (): string => {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sim_bhp_gas_webhook') : null;
    if (saved && saved.trim().startsWith('https://script.google.com/')) {
      return saved.trim();
    }
  } catch {
    // fallback
  }
  return DEFAULT_GAS_WEBHOOK_URL.trim();
};

/**
 * Cek apakah Google Sheets Webhook sudah terhubung
 */
export const isGoogleSheetsConnected = (): boolean => {
  const url = getEffectiveWebhookUrl();
  return Boolean(url && url.startsWith('https://script.google.com/'));
};

/**
 * Generate CSV data that can be directly imported/pasted into Google Sheets
 */
export const generateSheetsCSV = (
  listBarang: Barang[],
  listPenerimaan: PenerimaanBarang[],
  listPengeluaran: PengeluaranBarang[]
): string => {
  let csv = '=== DATA MASTER BARANG HABIS PAKAI (SIM-BHP PUSKESMAS PETANG I) ===\n';
  csv += 'ID,Kode Barcode,Nama Barang,Kategori,Satuan,Stok Awal,Stok Saat Ini,Stok Min,Harga Satuan,Total Aset,Lokasi Rak,Status\n';

  listBarang.forEach(b => {
    const totalAset = b.stokSaatIni * b.hargaSatuan;
    const status = b.stokSaatIni <= (b.stokMinimum || 5) ? 'KRITIS' : 'AMAN';
    csv += `"${b.id}","${b.kode}","${b.nama}","${b.kategori}","${b.satuan}",${b.stokAwalMaster},${b.stokSaatIni},${b.stokMinimum || 5},${b.hargaSatuan},${totalAset},"${b.lokasiRak || '-'}","${status}"\n`;
  });

  csv += '\n=== RIWAYAT TRANSAKSI PENERIMAAN BARANG MASUK ===\n';
  csv += 'No Urut,No Faktur,Tanggal,Nama Barang,Kategori,Jumlah Masuk,Satuan,Harga Satuan,Jumlah Total,Supplier,Sumber Dana\n';
  listPenerimaan.forEach(p => {
    csv += `"${p.noUrut}","${p.noFaktur}","${p.tanggal}","${p.namaBarang}","${p.kategori}",${p.jumlahMasuk},"${p.satuan}",${p.hargaSatuan},${p.jumlahTotal},"${p.supplier || '-'}","${p.sumberPengadaan}"\n`;
  });

  csv += '\n=== RIWAYAT TRANSAKSI PENGELUARAN BARANG (AMPRAHAN) ===\n';
  csv += 'No Bukti,Tanggal,Nama Barang,Kategori,Jumlah Keluar,Satuan,Tujuan Ruangan,Penerima,Sisa Stok\n';
  listPengeluaran.forEach(k => {
    csv += `"${k.noBukti}","${k.tanggal}","${k.namaBarang}","${k.kategori}",${k.jumlahKeluar},"${k.satuan}","${k.tujuanRuangan}","${k.penerima || '-'}","${k.sisaStok || '-'}"\n`;
  });

  return csv;
};

/**
 * Download CSV for Google Sheets
 */
export const downloadForGoogleSheets = (
  listBarang: Barang[],
  listPenerimaan: PenerimaanBarang[],
  listPengeluaran: PengeluaranBarang[]
) => {
  const content = generateSheetsCSV(listBarang, listPenerimaan, listPengeluaran);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SIM_BHP_Petang_GoogleSheets_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Google Apps Script (GAS) code template to copy-paste into Google Sheets Extensions -> Apps Script
 * Versi 2026: Sinkronisasi 2-Arah + Notifikasi Otomatis WhatsApp (Gateway API)
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - SINKRONISASI 2 ARAH & NOTIFIKASI OTOMATIS WA SIM-BHP
 * UPTD PUSKESMAS PETANG I KABUPATEN BADUNG
 * ==============================================================================
 * Petunjuk Pemasangan di Google Spreadsheet:
 * 1. Buka spreadsheet Anda di Google Drive.
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus SEMUA kode lama yang ada di editor, lalu TEMPELKAN (paste) seluruh kode ini.
 * 4. (OPSIONAL) Jika ingin notifikasi WhatsApp terkirim otomatis di latar belakang:
 *    Daftar gratis di https://fonnte.com, lalu masukkan token Anda di variabel WA_GATEWAY_TOKEN di bawah.
 * 5. Klik ikon "Simpan" (Ctrl + S).
 * 6. Klik "Terapkan" (Deploy) > "Penerapan Baru" (New Deployment).
 *    (Jika sudah pernah deploy, pilih "Kelola Penerapan" > Edit > Versi Baru).
 * 7. Pilih Jenis: "Aplikasi Web" (Web app).
 * 8. Konfigurasi:
 *    - Jalankan sebagai: Saya (email Anda)
 *    - Siapa yang memiliki akses: Siapa saja (Anyone)
 * 9. Klik "Terapkan" (Deploy) dan Salin "URL Aplikasi Web" (Web app URL).
 * 10. Tempelkan URL tersebut ke Pengaturan SIM-BHP di aplikasi web.
 */

// ============================================================================
// KONFIGURASI WHATSAPP OTOMATIS (FONNTE / WA GATEWAY)
// ============================================================================
// Masukkan Token Fonnte (dapat diperoleh gratis di https://fonnte.com):
var WA_GATEWAY_TOKEN = "MASUKKAN_TOKEN_FONNTE_DISINI"; 
// Nomor default Pengurus Barang / KTU jika tidak ditentukan dari web:
var WA_DEFAULT_PHONE = "6281234567890"; 

// Fungsi Pembantu: Mengirim pesan WhatsApp via Gateway secara background
function kirimPesanWhatsAppOtomatis(pesan, nomorTujuan) {
  if (!WA_GATEWAY_TOKEN || WA_GATEWAY_TOKEN === "MASUKKAN_TOKEN_FONNTE_DISINI") {
    Logger.log("Token WhatsApp Gateway belum diatur. Pesan: " + pesan);
    return false;
  }
  try {
    var target = (nomorTujuan || WA_DEFAULT_PHONE).toString().replace(/\\D/g, "");
    var payload = {
      target: target,
      message: pesan,
      countryCode: "62"
    };
    var options = {
      method: "post",
      headers: {
        "Authorization": WA_GATEWAY_TOKEN
      },
      payload: payload,
      muteHttpExceptions: true
    };
    var resp = UrlFetchApp.fetch("https://api.fonnte.com/send", options);
    Logger.log("Respons WhatsApp API: " + resp.getContentText());
    return true;
  } catch (err) {
    Logger.log("Error kirim WA: " + err.toString());
    return false;
  }
}

// 1. FUNGSI POST: MENYIMPAN / MENGOSONGKAN / NOTIFIKASI WA DARI SIM-BHP
function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // AKSI 1: Hanya Mengirim Notifikasi WhatsApp Otomatis
    if (data.action === "notifyWhatsApp" && data.message) {
      var waSent = kirimPesanWhatsAppOtomatis(data.message, data.targetPhone);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: waSent ? "Notifikasi WA otomatis berhasil dikirim!" : "Pesan diproses (Token WA belum diisi di Apps Script)",
        sent: waSent
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Lembar Master BHP
    var sheetBarang = ss.getSheetByName("Master_BHP") || ss.insertSheet("Master_BHP");
    sheetBarang.clear();
    var headersBarang = [["ID", "Kode Barcode", "Nama Barang", "Kategori", "Satuan", "Stok Awal", "Stok Saat Ini", "Stok Minimum", "Harga Satuan (Rp)", "Nilai Aset (Rp)", "Lokasi Rak", "Status", "Terakhir Diperbarui"]];
    sheetBarang.getRange(1, 1, 1, headersBarang[0].length).setValues(headersBarang).setFontWeight("bold").setBackground("#d1fae5");

    var barangKritisList = [];

    if (data.barang && Array.isArray(data.barang) && data.barang.length > 0) {
      var rowsBarang = data.barang.map(function(b) {
        var stokNow = Number(b.stokSaatIni) || 0;
        var stokMin = Number(b.stokMinimum) || 5;
        var harga = Number(b.hargaSatuan) || 0;
        var total = stokNow * harga;
        var isKritis = stokNow <= stokMin;
        var status = isKritis ? "KRITIS (<=" + stokMin + ")" : "AMAN";

        if (isKritis) {
          barangKritisList.push("• " + b.nama + " (Sisa: " + stokNow + " " + (b.satuan || "Unit") + ", Min: " + stokMin + ")");
        }

        return [
          b.id,
          b.kode,
          b.nama,
          b.kategori,
          b.satuan,
          Number(b.stokAwalMaster) || 0,
          stokNow,
          stokMin,
          harga,
          total,
          b.lokasiRak || "-",
          status,
          new Date().toLocaleString("id-ID")
        ];
      });

      sheetBarang.getRange(2, 1, rowsBarang.length, headersBarang[0].length).setValues(rowsBarang);
    }

    // 2. Lembar Transaksi Penerimaan
    var sheetTerima = ss.getSheetByName("Penerimaan_Masuk") || ss.insertSheet("Penerimaan_Masuk");
    sheetTerima.clear();
    var headersTerima = [["No Urut", "No Faktur", "Tanggal", "Nama Barang", "Kategori", "Jumlah Masuk", "Satuan", "Harga Satuan", "Total Nilai", "Supplier", "Sumber Dana", "Waktu Input"]];
    sheetTerima.getRange(1, 1, 1, headersTerima[0].length).setValues(headersTerima).setFontWeight("bold").setBackground("#e0f2fe");

    if (data.penerimaan && Array.isArray(data.penerimaan) && data.penerimaan.length > 0) {
      var rowsTerima = data.penerimaan.map(function(p) {
        return [
          p.noUrut,
          p.noFaktur,
          p.tanggal,
          p.namaBarang,
          p.kategori,
          Number(p.jumlahMasuk) || 0,
          p.satuan,
          Number(p.hargaSatuan) || 0,
          Number(p.jumlahTotal) || 0,
          p.supplier || "-",
          p.sumberPengadaan,
          new Date().toLocaleString("id-ID")
        ];
      });

      sheetTerima.getRange(2, 1, rowsTerima.length, headersTerima[0].length).setValues(rowsTerima);
    }

    // 3. Lembar Transaksi Pengeluaran
    var sheetKeluar = ss.getSheetByName("Pengeluaran_Amprahan") || ss.insertSheet("Pengeluaran_Amprahan");
    sheetKeluar.clear();
    var headersKeluar = [["No Bukti", "Tanggal", "Nama Barang", "Kategori", "Jumlah Keluar", "Satuan", "Tujuan Ruangan", "Penerima", "Sisa Stok", "Waktu Input"]];
    sheetKeluar.getRange(1, 1, 1, headersKeluar[0].length).setValues(headersKeluar).setFontWeight("bold").setBackground("#fef3c7");

    if (data.pengeluaran && Array.isArray(data.pengeluaran) && data.pengeluaran.length > 0) {
      var rowsKeluar = data.pengeluaran.map(function(k) {
        return [
          k.noBukti,
          k.tanggal,
          k.namaBarang,
          k.kategori,
          Number(k.jumlahKeluar) || 0,
          k.satuan,
          k.tujuanRuangan,
          k.penerima || "-",
          Number(k.sisaStok) || 0,
          new Date().toLocaleString("id-ID")
        ];
      });

      sheetKeluar.getRange(2, 1, rowsKeluar.length, headersKeluar[0].length).setValues(rowsKeluar);
    }

    // Auto WhatsApp trigger jika ada barang kritis dan bukan aksi kosongkan data
    if (barangKritisList.length > 0 && data.action !== "clearAll") {
      var waMsg = "🚨 *NOTIFIKASI OTOMATIS STOK MINIMUM BHP* 🚨\\n" +
        "UPTD PUSKESMAS PETANG I\\n\\n" +
        "Pemberitahuan Sistem Persediaan:\\n" +
        "Terdapat " + barangKritisList.length + " barang yang telah mencapai batas minimum:\\n" +
        barangKritisList.slice(0, 10).join("\\n") + "\\n\\n" +
        "Mohon segera diproses pengadaan BHP. Terima kasih.\\n" +
        "_SIM-BHP UPTD Puskesmas Petang I_";
      kirimPesanWhatsAppOtomatis(waMsg, data.targetPhone);
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: data.action === "clearAll" ? "Seluruh sheet telah dikosongkan!" : "Sinkronisasi berhasil!",
      counts: {
        barang: (data.barang && data.barang.length) || 0,
        penerimaan: (data.penerimaan && data.penerimaan.length) || 0,
        pengeluaran: (data.pengeluaran && data.pengeluaran.length) || 0
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. FUNGSI GET: MEMBACA / MENARIK DATA DARI GOOGLE SHEETS KE SIM-BHP (SINKRONISASI 2-ARAH)
// Ketika baris di Google Sheets dihapus atau spreadsheet kosong, data web langsung mengikuti data spreadsheet
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

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
        return b.nama && b.nama !== "" && b.nama !== "undefined";
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
        var sumberPengadaan = String(r[10] || "BLUD").trim();

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
        return p.namaBarang && p.namaBarang !== "" && p.namaBarang !== "undefined";
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
        return k.namaBarang && k.namaBarang !== "" && k.namaBarang !== "undefined";
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
`;

/**
 * Send data to user's Google Apps Script Webhook (Push)
 */
export const sendToGoogleAppsScriptWebhook = async (
  webhookUrl?: string,
  listBarang: Barang[] = [],
  listPenerimaan: PenerimaanBarang[] = [],
  listPengeluaran: PengeluaranBarang[] = [],
  action: 'sync' | 'clearAll' = 'sync'
): Promise<{ success: boolean; message: string }> => {
  const targetUrl = (webhookUrl && webhookUrl.trim()) || getEffectiveWebhookUrl();

  if (!targetUrl || !targetUrl.startsWith('https://script.google.com/')) {
    return {
      success: false,
      message: 'URL Webhook Google Apps Script belum valid (harus diawali https://script.google.com/macros/s/...).'
    };
  }

  const payload = {
    action: action,
    barang: listBarang,
    penerimaan: listPenerimaan,
    pengeluaran: listPengeluaran,
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: action === 'clearAll'
        ? 'Perintah pengosongan database berhasil dikirim ke Google Spreadsheet! Tab sheet telah dibersihkan.'
        : 'Perintah sinkronisasi berhasil dikirim ke Google Spreadsheet! Data Master BHP, Penerimaan, dan Pengeluaran telah tersimpan di lembar sheet Anda.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal mengirim ke Google Sheets: ${err?.message || 'Koneksi terputus'}`
    };
  }
};

/**
 * Pull data from Google Apps Script Webhook (Pull / 2-way sync)
 * If items were deleted in Google Sheets, pulling directly reflects the deletions in the web application.
 * If all rows were deleted in Google Sheets, it returns 0 items cleanly, allowing starting fresh from 0.
 */
export const pullDataFromGoogleSheets = async (
  webhookUrl?: string
): Promise<{
  success: boolean;
  message: string;
  data?: {
    barang: Barang[];
    penerimaan: PenerimaanBarang[];
    pengeluaran: PengeluaranBarang[];
  };
}> => {
  const targetUrl = (webhookUrl && webhookUrl.trim()) || getEffectiveWebhookUrl();

  if (!targetUrl || !targetUrl.startsWith('https://script.google.com/')) {
    return {
      success: false,
      message: 'URL Webhook Google Apps Script belum valid (harus diawali https://script.google.com/macros/s/...).'
    };
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();

    if (json.status !== 'success' || !Array.isArray(json.barang)) {
      if (typeof json === 'string' && json.includes('Webhook SIM-BHP')) {
        return {
          success: false,
          message: 'Kode Apps Script di Google Sheets Anda masih versi lama (hanya kirim 1-arah). Silakan salin & terapkan kode Apps Script terbaru (Penerapan Baru) untuk mengaktifkan fitur Tarik Data 2-Arah.'
        };
      }
      throw new Error(json.error || 'Format respons dari Google Sheets tidak dikenali.');
    }

    // When Google Sheets returns 0 items, THIS IS VALID! (User deleted rows or cleared spreadsheet to start fresh)
    if (json.barang.length === 0) {
      return {
        success: true,
        message: 'Sinkronisasi berhasil! Database Google Spreadsheet saat ini kosong (0 barang). Data di SIM-BHP telah disesuaikan menjadi kosong mengikuti spreadsheet.',
        data: {
          barang: [],
          penerimaan: json.penerimaan || [],
          pengeluaran: json.pengeluaran || []
        }
      };
    }

    return {
      success: true,
      message: `Sinkronisasi berhasil! Berhasil memuat ${json.barang.length} barang, ${json.penerimaan ? json.penerimaan.length : 0} penerimaan, dan ${json.pengeluaran ? json.pengeluaran.length : 0} pengeluaran langsung dari Google Sheets.`,
      data: {
        barang: json.barang,
        penerimaan: json.penerimaan || [],
        pengeluaran: json.pengeluaran || []
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menarik data dari Google Sheets: ${err?.message || 'Pastikan izin deployment diatur ke "Siapa Saja / Anyone" dan kode versi baru sudah diterapkan.'}`
    };
  }
};
