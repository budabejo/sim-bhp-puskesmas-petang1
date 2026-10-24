export type CategoryType = 
  | 'Alat Listrik'
  | 'ATK'
  | 'Perabot Kantor/Kebersihan'
  | 'Benda Pos'
  | 'Bahan Cetak';

export type UserRole = 'admin' | 'petugas' | 'kapusk';

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  nama: string;
  jabatan: string;
  nip: string;
  role: UserRole;
  phone: string;
}

export interface Barang {
  id: string;
  kode: string;
  nama: string;
  kategori: CategoryType;
  sumberDana: string; // default "BLUD"
  satuan: string; // Rim, Pcs, Kotak, Botol, Buah, Lembar, Rol, dll
  hargaSatuan: number;
  stokAwalMaster: number; // Stok awal baseline awal tahun/periode
  stokSaatIni: number;
  stokMinimum: number; // default 5
  lokasiRak: string;
  spesifikasi?: string;
  createdAt: string;
}

export interface PenerimaanBarang {
  id: string;
  noUrut: string; // e.g. BM-2026-001
  noFaktur: string; // Bukti BAP / Faktur
  tanggal: string; // YYYY-MM-DD
  sumberPengadaan: string; // default "BLUD"
  barangId: string;
  namaBarang: string;
  kategori: CategoryType;
  satuan: string;
  hargaSatuan: number;
  jumlahMasuk: number;
  jumlahTotal: number;
  supplier: string;
  keterangan: string;
}

export interface PengeluaranBarang {
  id: string;
  noBukti: string; // e.g. BK-2026-001
  tanggal: string; // YYYY-MM-DD
  barangId: string;
  namaBarang: string;
  kategori: CategoryType;
  satuan: string;
  hargaSatuan: number;
  stokAwal: number; // Stok sebelum keluar
  jumlahKeluar: number;
  sisaStok: number; // Stok setelah keluar
  totalHarga: number;
  tujuanRuangan: string; // Poli Umum, UGD, Tata Usaha, dll
  penerima: string;
  keterangan: string;
}

export interface MutasiKartuStok {
  id: string;
  tanggal: string;
  noTransaksi: string;
  jenis: 'AWAL' | 'MASUK' | 'KELUAR';
  keterangan: string;
  stokAwal: number;
  masuk: number;
  keluar: number;
  sisaStok: number;
  hargaSatuan: number;
  tujuan?: string;
}

export interface KopPuskesmas {
  namaPemerintah: string;
  namaDinas: string;
  namaPuskesmas: string;
  alamat: string;
  kota: string;
  kodePos: string;
  telepon: string;
  email: string;
  website?: string;
  namaKapusk: string;
  nipKapusk: string;
  namaKTU?: string;
  nipKTU?: string;
  namaPengurusBarang: string;
  nipPengurusBarang: string;
  nomorWhatsAppNotif: string;
  nomorWhatsAppList?: string[];
}
