import { Barang, PenerimaanBarang, PengeluaranBarang } from '../types';

export function generateMySQLDump(
  listBarang: Barang[],
  listPenerimaan: PenerimaanBarang[],
  listPengeluaran: PengeluaranBarang[]
): string {
  return `-- ========================================================
-- SISTEM INFORMASI MANAJEMEN PERSEDIAAN BARANG HABIS PAKAI (SIM-BHP)
-- STANDAR BLUD PUSKESMAS / DINAS KESEHATAN
-- Compatible with: XAMPP MySQL / MariaDB / Niagahoster cPanel
-- Generated: 2026-09-25
-- ========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

CREATE DATABASE IF NOT EXISTS \`db_sim_bhp_puskesmas\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`db_sim_bhp_puskesmas\`;

-- --------------------------------------------------------
-- Table structure for \`users\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`username\` varchar(50) NOT NULL UNIQUE,
  \`password\` varchar(255) NOT NULL,
  \`nama\` varchar(100) NOT NULL,
  \`nip\` varchar(50) DEFAULT NULL,
  \`jabatan\` varchar(100) DEFAULT NULL,
  \`role\` enum('admin','petugas','kapusk') NOT NULL DEFAULT 'petugas',
  \`phone\` varchar(20) DEFAULT NULL,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`nama\`, \`nip\`, \`jabatan\`, \`role\`, \`phone\`) VALUES
(1, 'admin', MD5('admin123'), 'I Ketut Buda Antara', '19930920 201802 1 003', 'Pengurus Barang / Admin', 'admin', '6281234567890'),
(2, 'logistik', MD5('logistik123'), 'Budi Santoso, S.Kom.', '19950110 202012 1 002', 'Petugas Logistik Gudang BHP', 'petugas', '6285712345678'),
(3, 'kapusk', MD5('kapusk123'), 'dr. H. Rahmat Hidayat, M.Kes.', '19790412 200604 1 008', 'Kepala UPTD Puskesmas', 'kapusk', '6281398765432'),
(4, 'ktu', MD5('ktu123'), 'Hj. Siti Marlina, S.ST., M.M.', '19820715 200801 2 012', 'Kepala Tata Usaha (KTU)', 'kapusk', '6281299887766');

-- --------------------------------------------------------
-- Table structure for \`barang\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`barang\` (
  \`id\` varchar(50) NOT NULL,
  \`kode\` varchar(50) NOT NULL UNIQUE,
  \`nama\` varchar(200) NOT NULL,
  \`kategori\` enum('Alat Listrik','ATK','Perabot Kantor/Kebersihan','Benda Pos','Bahan Cetak') NOT NULL,
  \`sumber_dana\` varchar(50) NOT NULL DEFAULT 'BLUD',
  \`satuan\` varchar(50) NOT NULL,
  \`harga_satuan\` decimal(15,2) NOT NULL DEFAULT 0.00,
  \`stok_awal_master\` int(11) NOT NULL DEFAULT 0,
  \`stok_saat_ini\` int(11) NOT NULL DEFAULT 0,
  \`stok_minimum\` int(11) NOT NULL DEFAULT 5,
  \`lokasi_rak\` varchar(100) DEFAULT NULL,
  \`spesifikasi\` text DEFAULT NULL,
  \`created_at\` date DEFAULT CURRENT_DATE,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Barang
${listBarang.map(b => `INSERT INTO \`barang\` (\`id\`, \`kode\`, \`nama\`, \`kategori\`, \`sumber_dana\`, \`satuan\`, \`harga_satuan\`, \`stok_awal_master\`, \`stok_saat_ini\`, \`stok_minimum\`, \`lokasi_rak\`, \`spesifikasi\`) VALUES 
('${b.id}', '${b.kode}', '${b.nama.replace(/'/g, "''")}', '${b.kategori}', '${b.sumberDana || 'BLUD'}', '${b.satuan}', ${b.hargaSatuan}, ${b.stokAwalMaster}, ${b.stokSaatIni}, ${b.stokMinimum}, '${b.lokasiRak || ''}', '${(b.spesifikasi || '').replace(/'/g, "''")}');`).join('\n')}

-- --------------------------------------------------------
-- Table structure for \`penerimaan_barang\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`penerimaan_barang\` (
  \`id\` varchar(50) NOT NULL,
  \`no_urut\` varchar(50) NOT NULL,
  \`no_faktur\` varchar(50) NOT NULL,
  \`tanggal\` date NOT NULL,
  \`sumber_pengadaan\` varchar(100) NOT NULL DEFAULT 'BLUD',
  \`barang_id\` varchar(50) NOT NULL,
  \`satuan\` varchar(50) NOT NULL,
  \`harga_satuan\` decimal(15,2) NOT NULL DEFAULT 0.00,
  \`jumlah_masuk\` int(11) NOT NULL DEFAULT 0,
  \`jumlah_total\` decimal(15,2) NOT NULL DEFAULT 0.00,
  \`supplier\` varchar(150) DEFAULT NULL,
  \`keterangan\` text DEFAULT NULL,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_penerimaan_barang\` (\`barang_id\`),
  CONSTRAINT \`fk_penerimaan_barang\` FOREIGN KEY (\`barang_id\`) REFERENCES \`barang\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Penerimaan
${listPenerimaan.map(p => `INSERT INTO \`penerimaan_barang\` (\`id\`, \`no_urut\`, \`no_faktur\`, \`tanggal\`, \`sumber_pengadaan\`, \`barang_id\`, \`satuan\`, \`harga_satuan\`, \`jumlah_masuk\`, \`jumlah_total\`, \`supplier\`, \`keterangan\`) VALUES
('${p.id}', '${p.noUrut}', '${p.noFaktur}', '${p.tanggal}', '${p.sumberPengadaan}', '${p.barangId}', '${p.satuan}', ${p.hargaSatuan}, ${p.jumlahMasuk}, ${p.jumlahTotal}, '${(p.supplier || '').replace(/'/g, "''")}', '${(p.keterangan || '').replace(/'/g, "''")}');`).join('\n')}

-- --------------------------------------------------------
-- Table structure for \`pengeluaran_barang\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`pengeluaran_barang\` (
  \`id\` varchar(50) NOT NULL,
  \`no_bukti\` varchar(50) NOT NULL,
  \`tanggal\` date NOT NULL,
  \`barang_id\` varchar(50) NOT NULL,
  \`satuan\` varchar(50) NOT NULL,
  \`harga_satuan\` decimal(15,2) NOT NULL DEFAULT 0.00,
  \`stok_awal\` int(11) NOT NULL DEFAULT 0,
  \`jumlah_keluar\` int(11) NOT NULL DEFAULT 0,
  \`sisa_stok\` int(11) NOT NULL DEFAULT 0,
  \`total_harga\` decimal(15,2) NOT NULL DEFAULT 0.00,
  \`tujuan_ruangan\` varchar(100) NOT NULL,
  \`penerima\` varchar(100) DEFAULT NULL,
  \`keterangan\` text DEFAULT NULL,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_pengeluaran_barang\` (\`barang_id\`),
  CONSTRAINT \`fk_pengeluaran_barang\` FOREIGN KEY (\`barang_id\`) REFERENCES \`barang\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Pengeluaran
${listPengeluaran.map(q => `INSERT INTO \`pengeluaran_barang\` (\`id\`, \`no_bukti\`, \`tanggal\`, \`barang_id\`, \`satuan\`, \`harga_satuan\`, \`stok_awal\`, \`jumlah_keluar\`, \`sisa_stok\`, \`total_harga\`, \`tujuan_ruangan\`, \`penerima\`, \`keterangan\`) VALUES
('${q.id}', '${q.noBukti}', '${q.tanggal}', '${q.barangId}', '${q.satuan}', ${q.hargaSatuan}, ${q.stokAwal}, ${q.jumlahKeluar}, ${q.sisaStok}, ${q.totalHarga}, '${(q.tujuanRuangan || '').replace(/'/g, "''")}', '${(q.penerima || '').replace(/'/g, "''")}');`).join('\n')}

COMMIT;
`;
}
