# SIM-BHP - UPTD Puskesmas Petang I
### Sistem Informasi Persediaan Barang Habis Pakai (BHP)

Aplikasi web pengelolaan dan pemantauan persediaan Barang Habis Pakai (BHP) pada **UPTD Puskesmas Petang I**, dirancang untuk mempermudah pencatatan stok masuk, stok keluar, opname fisik, serta sinkronisasi data dua arah dengan **Google Spreadsheet** dan **Basis Data MySQL**.

---

## 🚀 Fitur Utama
- **Dashboard Monitoring**: Ringkasan total jenis barang, stok menipis, peringatan kadaluarsa, pergerakan barang hari ini, dan total nilai aset persediaan (Rp).
- **Master Data Barang BHP**: Kode barang, nama barang, kategori (Medis, Lab, APD, Farmasi, Umum/ATK), satuan, stok minimum, harga perolehan, tanggal kadaluarsa, dan lokasi rak.
- **Transaksi Penerimaan (Stok Masuk)**: Nomor faktur/BAP, sumber anggaran (APBD/BOK/BLUD), supplier, dan verifikasi otomatis penambahan stok.
- **Transaksi Pengeluaran (Stok Keluar)**: Pencatatan peruntukan unit/ruangan peminta (UGD, Poli Umum, KIA, Laboratorium, Farmasi, dll.) serta nama penerima.
- **Kartu Stok & Laporan Mutasi**: Riwayat mutasi lengkap barang, sisa saldo akhir, filter rentang tanggal, cetak formulir resmi ber-kop Puskesmas, dan ekspor ke Excel/CSV.
- **Sinkronisasi Google Spreadsheet 2 Arah**:
  - Kirim data lokal ke Google Drive Spreadsheet secara otomatis.
  - Tarik data dari Google Spreadsheet kembali ke aplikasi web (termasuk deteksi baris yang telah dihapus di sheet).
- **Cadangan Data & Portabilitas**: Ekspor skema basis data MySQL (`.sql`), backup JSON, dan arsip siap deploy untuk hosting cPanel/Apache.

---

## 🛠️ Teknologi yang Digunakan (Skripsi/Tugas Akhir)
- **Frontend / Client**: React 19, TypeScript, Vite
- **Desain & Tampilan UI**: Tailwind CSS v4, Lucide React Icons
- **Basis Data & Integrasi**:
  - Local Database: IndexedDB / Web Storage Persistence
  - Cloud Realtime: Google Spreadsheet API (Google Apps Script Webhook)
  - Relational Database: MySQL 8 / MariaDB (Skema relasional & foreign key dump)
- **Deployment**: Mendukung GitHub Pages (SPA) & cPanel Apache Web Server

---

## 📜 Lisensi
Proyek ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](./LICENSE) untuk detail lengkap.

**Hak Cipta © 2026 budabejo - UPTD Puskesmas Petang I.**
Semua hak dilindungi undang-undang.

## Sinkronisasi Google Sheets Otomatis

Versi ini sudah dilengkapi sinkronisasi otomatis untuk Master BHP, Penerimaan, dan Pengeluaran.
Setelah GitHub Pages aktif, lakukan konfigurasi Google Apps Script satu kali:

1. Buka folder `google-apps-script/` dan gunakan `Code.gs`.
2. Tempel kode ke Google Sheets -> Ekstensi -> Apps Script.
3. Deploy sebagai Web app, `Execute as: Me`, akses `Anyone`.
4. Salin URL `/exec` ke menu **Pengaturan -> Google Sheets & Hosting -> URL Webhook Google Apps Script** pada aplikasi.
5. Klik **Simpan URL**.

Sesudah itu, tombol Simpan/Tambah/Edit/Hapus pada data Master BHP, Penerimaan, dan Pengeluaran akan otomatis menyinkronkan seluruh data ke tiga sheet.
