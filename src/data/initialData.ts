import { Barang, CategoryType, KopPuskesmas, PenerimaanBarang, PengeluaranBarang, UserProfile } from '../types';

export const CATEGORIES: CategoryType[] = [
  'Alat Listrik',
  'ATK',
  'Perabot Kantor/Kebersihan',
  'Benda Pos',
  'Bahan Cetak'
];

export const SUMBER_DANA_OPTIONS = [
  'BLUD',
  'BLUD Dana JKN',
  'APBD Dinas Kesehatan',
  'Hibah / Bantuan'
];

export const DAFTAR_RUANGAN = [
  'Poli Umum',
  'UGD / Tindakan',
  'Poli Gigi',
  'Poli KIA / KB & Imunisasi',
  'Ruang Pendaftaran & Rekam Medis',
  'Tata Usaha (TU) & Manajemen',
  'Laboratorium',
  'Farmasi / Apotek',
  'Poli MTBS & Anak',
  'Poli TB-DOTS & Paru',
  'Ruang Rawat Inap',
  'Ruang Bersalin (VK)',
  'Gudang Kebersihan & Sanitasi',
  'Klinik Sanitasi & Promkes'
];

export const INITIAL_KOP: KopPuskesmas = {
  namaPemerintah: 'PEMERINTAH KABUPATEN BADUNG',
  namaDinas: 'DINAS KESEHATAN',
  namaPuskesmas: 'UPTD PUSKESMAS PETANG I',
  alamat: 'Jl. Jahuripan-Petang, Desa Petang, Kecamatan Petang, Kabupaten Badung',
  kota: 'Kabupaten Badung',
  kodePos: '80353',
  telepon: '0361 813379',
  email: 'petang1_dikesbadung@yahoo.com',
  website: 'https://puskesmaspetang1.badungkab.go.id/',
  namaKapusk: 'dr. I Ketut Dwipayana, M.Kes.',
  nipKapusk: '19783112 200712 1 004',
  namaKTU: '',
  nipKTU: '',
  namaPengurusBarang: 'I Ketut Buda Antara',
  nipPengurusBarang: '19930920 201802 1 003',
  nomorWhatsAppNotif: '6281234567890',
  nomorWhatsAppList: [
    '6281234567890',
    '6281398765432',
    '6285712345678',
    '',
    ''
  ]
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-1',
    username: 'admin',
    password: 'admin',
    nama: 'I Ketut Buda Antara',
    jabatan: 'Pengurus Barang / Admin SIM-BHP',
    nip: '19930920 201802 1 003',
    role: 'admin',
    phone: '6281234567890'
  },
  {
    id: 'user-2',
    username: 'user',
    password: 'user',
    nama: 'Pegawai Logistik Puskesmas',
    jabatan: 'Petugas Pengelola Gudang BHP',
    nip: '19950110 202012 1 002',
    role: 'petugas',
    phone: '6285712345678'
  }
];

export const INITIAL_BARANG: Barang[] = [
  // 1. ATK
  {
    id: 'BRG-ATK-001',
    kode: 'BHP-ATK-001',
    nama: 'Kertas HVS A4 70gr Sinar Dunia',
    kategori: 'ATK',
    sumberDana: 'BLUD',
    satuan: 'Rim',
    hargaSatuan: 55000,
    stokAwalMaster: 30,
    stokSaatIni: 22,
    stokMinimum: 5,
    lokasiRak: 'Lemari ATK-1',
    spesifikasi: '70 gsm, 500 lembar per rim',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-ATK-002',
    kode: 'BHP-ATK-002',
    nama: 'Kertas HVS F4 70gr Sinar Dunia',
    kategori: 'ATK',
    sumberDana: 'BLUD',
    satuan: 'Rim',
    hargaSatuan: 60000,
    stokAwalMaster: 25,
    stokSaatIni: 4, // Kritis <= 5
    stokMinimum: 5,
    lokasiRak: 'Lemari ATK-1',
    spesifikasi: '70 gsm Folio, 500 lembar',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-ATK-003',
    kode: 'BHP-ATK-003',
    nama: 'Pulpen Ballpoint Snowman V-1 Hitam',
    kategori: 'ATK',
    sumberDana: 'BLUD',
    satuan: 'Lusin',
    hargaSatuan: 28000,
    stokAwalMaster: 15,
    stokSaatIni: 3, // Kritis <= 5
    stokMinimum: 5,
    lokasiRak: 'Kotak ATK-B',
    spesifikasi: '0.7mm warna hitam pekat',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-ATK-004',
    kode: 'BHP-ATK-004',
    nama: 'Map Snelhefter Kertas Stopmap',
    kategori: 'ATK',
    sumberDana: 'BLUD',
    satuan: 'Pak',
    hargaSatuan: 45000,
    stokAwalMaster: 20,
    stokSaatIni: 14,
    stokMinimum: 5,
    lokasiRak: 'Rak Arsip A-01',
    spesifikasi: 'Isi 50 map per pak, warna biru/merah',
    createdAt: '2026-01-06'
  },
  {
    id: 'BRG-ATK-005',
    kode: 'BHP-ATK-005',
    nama: 'Spidol Whiteboard Snowman BG-12 Hitam',
    kategori: 'ATK',
    sumberDana: 'BLUD',
    satuan: 'Lusin',
    hargaSatuan: 85000,
    stokAwalMaster: 8,
    stokSaatIni: 6,
    stokMinimum: 5,
    lokasiRak: 'Kotak ATK-C',
    spesifikasi: 'Boardmarker mudah dihapus',
    createdAt: '2026-01-06'
  },

  // 2. Alat Listrik
  {
    id: 'BRG-ELK-001',
    kode: 'BHP-ELK-001',
    nama: 'Lampu LED Philips 19 Watt Cool Daylight',
    kategori: 'Alat Listrik',
    sumberDana: 'BLUD',
    satuan: 'Buah',
    hargaSatuan: 65000,
    stokAwalMaster: 20,
    stokSaatIni: 5, // Kritis <= 5
    stokMinimum: 5,
    lokasiRak: 'Lemari Listrik L-1',
    spesifikasi: 'Putih terang 2300 Lumen E27',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-ELK-002',
    kode: 'BHP-ELK-002',
    nama: 'Baterai AA Alkaline ABC (Isi 2)',
    kategori: 'Alat Listrik',
    sumberDana: 'BLUD',
    satuan: 'Pasang',
    hargaSatuan: 14000,
    stokAwalMaster: 40,
    stokSaatIni: 2, // Kritis <= 5
    stokMinimum: 5,
    lokasiRak: 'Laci Baterai L-2',
    spesifikasi: 'Tegangan 1.5V untuk Tensimeter Digital',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-ELK-003',
    kode: 'BHP-ELK-003',
    nama: 'Kabel Roll Terminal Listrik 10 Meter',
    kategori: 'Alat Listrik',
    sumberDana: 'BLUD',
    satuan: 'Buah',
    hargaSatuan: 85000,
    stokAwalMaster: 6,
    stokSaatIni: 4, // Kritis <= 5
    stokMinimum: 5,
    lokasiRak: 'Gudang Logistik Rak C',
    spesifikasi: '4 Lubang arde SNI dengan saklar indikator',
    createdAt: '2026-01-07'
  },
  {
    id: 'BRG-ELK-004',
    kode: 'BHP-ELK-004',
    nama: 'Steker Listrik Arde Broco',
    kategori: 'Alat Listrik',
    sumberDana: 'BLUD',
    satuan: 'Buah',
    hargaSatuan: 18000,
    stokAwalMaster: 15,
    stokSaatIni: 11,
    stokMinimum: 5,
    lokasiRak: 'Lemari Listrik L-1',
    spesifikasi: 'Standar SNI 16A 250V',
    createdAt: '2026-01-07'
  },

  // 3. Perabot Kantor/Kebersihan
  {
    id: 'BRG-KBR-001',
    kode: 'BHP-KBR-001',
    nama: 'Sabun Cuci Tangan Cair / Handsoap Antiseptik 5 Liter',
    kategori: 'Perabot Kantor/Kebersihan',
    sumberDana: 'BLUD',
    satuan: 'Jerigen',
    hargaSatuan: 85000,
    stokAwalMaster: 12,
    stokSaatIni: 8,
    stokMinimum: 5,
    lokasiRak: 'Gudang Kebersihan G-1',
    spesifikasi: 'Formula antiseptik wangi apel/lemon',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-KBR-002',
    kode: 'BHP-KBR-002',
    nama: 'Karbol Disinfektan Pembersih Lantai 5 Liter',
    kategori: 'Perabot Kantor/Kebersihan',
    sumberDana: 'BLUD',
    satuan: 'Jerigen',
    hargaSatuan: 75000,
    stokAwalMaster: 10,
    stokSaatIni: 3, // Kritis <= 5
    stokMinimum: 5,
    lokasiRak: 'Gudang Kebersihan G-1',
    spesifikasi: 'Disinfektan aroma pinus medis',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-KBR-003',
    kode: 'BHP-KBR-003',
    nama: 'Kantong Plastik Sampah Medis Kuning 60x80cm',
    kategori: 'Perabot Kantor/Kebersihan',
    sumberDana: 'BLUD',
    satuan: 'Pak',
    hargaSatuan: 38000,
    stokAwalMaster: 25,
    stokSaatIni: 16,
    stokMinimum: 5,
    lokasiRak: 'Rak Sanitasi S-2',
    spesifikasi: 'Isi 20 lembar bertanda Biohazard medis',
    createdAt: '2026-01-08'
  },
  {
    id: 'BRG-KBR-004',
    kode: 'BHP-KBR-004',
    nama: 'Sapu Ijuk Rayung Nagata & Serokan Sampah',
    kategori: 'Perabot Kantor/Kebersihan',
    sumberDana: 'BLUD',
    satuan: 'Set',
    hargaSatuan: 42000,
    stokAwalMaster: 10,
    stokSaatIni: 7,
    stokMinimum: 5,
    lokasiRak: 'Pojok Gudang Kebersihan',
    spesifikasi: 'Gagang kokoh ringan',
    createdAt: '2026-01-08'
  },

  // 4. Benda Pos
  {
    id: 'BRG-POS-001',
    kode: 'BHP-POS-001',
    nama: 'Materai Tempel Rp 10.000 (Asli Kantor Pos)',
    kategori: 'Benda Pos',
    sumberDana: 'BLUD',
    satuan: 'Lembar',
    hargaSatuan: 11000,
    stokAwalMaster: 50,
    stokSaatIni: 5, // Kritis <= 5
    stokMinimum: 5,
    lokasiRak: 'Brankas Tata Usaha',
    spesifikasi: 'Materai resmi Dirjen Pajak RI',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-POS-002',
    kode: 'BHP-POS-002',
    nama: 'Amplop Coklat Folio Bertali Tebal',
    kategori: 'Benda Pos',
    sumberDana: 'BLUD',
    satuan: 'Pak',
    hargaSatuan: 35000,
    stokAwalMaster: 10,
    stokSaatIni: 8,
    stokMinimum: 5,
    lokasiRak: 'Lemari Arsip TU-1',
    spesifikasi: 'Isi 100 lembar per pak ukuran F4',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-POS-003',
    kode: 'BHP-POS-003',
    nama: 'Amplop Putih Berperekat Jaya Ukuran Kabinet',
    kategori: 'Benda Pos',
    sumberDana: 'BLUD',
    satuan: 'Kotak',
    hargaSatuan: 24000,
    stokAwalMaster: 12,
    stokSaatIni: 10,
    stokMinimum: 5,
    lokasiRak: 'Lemari Arsip TU-1',
    spesifikasi: 'Isi 100 lembar berlem otomatis',
    createdAt: '2026-01-06'
  },

  // 5. Bahan Cetak
  {
    id: 'BRG-CTK-001',
    kode: 'BHP-CTK-001',
    nama: 'Buku Rekam Medis (Family Folder / Status Pasien)',
    kategori: 'Bahan Cetak',
    sumberDana: 'BLUD',
    satuan: 'Buku',
    hargaSatuan: 12500,
    stokAwalMaster: 200,
    stokSaatIni: 130,
    stokMinimum: 20,
    lokasiRak: 'Rak Rekam Medis RM-1',
    spesifikasi: 'Cover Buffalo Kuning Cetak 2 Sisi 8 Lembar',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-CTK-002',
    kode: 'BHP-CTK-002',
    nama: 'Lembar Resep Obat Berkop Puskesmas',
    kategori: 'Bahan Cetak',
    sumberDana: 'BLUD',
    satuan: 'Buku',
    hargaSatuan: 15000,
    stokAwalMaster: 50,
    stokSaatIni: 12,
    stokMinimum: 10,
    lokasiRak: 'Lemari Farmasi F-1',
    spesifikasi: 'Isi 100 lembar per buku bernomor seri',
    createdAt: '2026-01-05'
  },
  {
    id: 'BRG-CTK-003',
    kode: 'BHP-CTK-003',
    nama: 'Kartu Identitas Berobat Pasien (KIB)',
    kategori: 'Bahan Cetak',
    sumberDana: 'BLUD',
    satuan: 'Kotak',
    hargaSatuan: 40000,
    stokAwalMaster: 15,
    stokSaatIni: 1, // Kritis <= 5
    stokMinimum: 5,
    lokasiRak: 'Loket Pendaftaran R-1',
    spesifikasi: 'Isi 200 kartu bahan BC tebal',
    createdAt: '2026-01-06'
  },
  {
    id: 'BRG-CTK-004',
    kode: 'BHP-CTK-004',
    nama: 'Formulir Permintaan Pemeriksaan Laboratorium',
    kategori: 'Bahan Cetak',
    sumberDana: 'BLUD',
    satuan: 'Buku',
    hargaSatuan: 16000,
    stokAwalMaster: 20,
    stokSaatIni: 15,
    stokMinimum: 5,
    lokasiRak: 'Ruang Lab L-01',
    spesifikasi: 'Rangkap 2 (NCR) isi 50 set per buku',
    createdAt: '2026-01-07'
  }
];

export const INITIAL_PENERIMAAN: PenerimaanBarang[] = [
  {
    id: 'RCV-2026-001',
    noUrut: 'BM-2026/01/001',
    noFaktur: 'FAK-BLUD/2026/012',
    tanggal: '2026-01-10',
    sumberPengadaan: 'BLUD',
    barangId: 'BRG-ATK-001',
    namaBarang: 'Kertas HVS A4 70gr Sinar Dunia',
    kategori: 'ATK',
    satuan: 'Rim',
    hargaSatuan: 55000,
    jumlahMasuk: 10,
    jumlahTotal: 550000,
    supplier: 'CV. Sejahtera Mandiri Jaya',
    keterangan: 'Pengadaan Rutin Belanja Bahan Habis Pakai BLUD Tahap I'
  },
  {
    id: 'RCV-2026-002',
    noUrut: 'BM-2026/01/002',
    noFaktur: 'FAK-BLUD/2026/015',
    tanggal: '2026-01-12',
    sumberPengadaan: 'BLUD',
    barangId: 'BRG-KBR-001',
    namaBarang: 'Sabun Cuci Tangan Cair / Handsoap Antiseptik 5 Liter',
    kategori: 'Perabot Kantor/Kebersihan',
    satuan: 'Jerigen',
    hargaSatuan: 85000,
    jumlahMasuk: 8,
    jumlahTotal: 680000,
    supplier: 'PT. Medika Sanitasi Bersama',
    keterangan: 'Belanja Sanitasi Lingkungan & PPI Puskesmas'
  },
  {
    id: 'RCV-2026-003',
    noUrut: 'BM-2026/01/003',
    noFaktur: 'BAP-POS/2026/004',
    tanggal: '2026-01-15',
    sumberPengadaan: 'BLUD',
    barangId: 'BRG-POS-001',
    namaBarang: 'Materai Tempel Rp 10.000 (Asli Kantor Pos)',
    kategori: 'Benda Pos',
    satuan: 'Lembar',
    hargaSatuan: 11000,
    jumlahMasuk: 20,
    jumlahTotal: 220000,
    supplier: 'PT. Pos Indonesia (Persero)',
    keterangan: 'Kebutuhan SPJ Keuangan & Surat Perjanjian BLUD'
  },
  {
    id: 'RCV-2026-004',
    noUrut: 'BM-2026/02/001',
    noFaktur: 'FAK-CTK/2026/088',
    tanggal: '2026-02-05',
    sumberPengadaan: 'BLUD',
    barangId: 'BRG-CTK-001',
    namaBarang: 'Buku Rekam Medis (Family Folder / Status Pasien)',
    kategori: 'Bahan Cetak',
    satuan: 'Buku',
    hargaSatuan: 12500,
    jumlahMasuk: 100,
    jumlahTotal: 1250000,
    supplier: 'Percetakan Grafika Sehat',
    keterangan: 'Pencetakan Formulir Pelayanan Pasien Rawat Jalan'
  },
  {
    id: 'RCV-2026-005',
    noUrut: 'BM-2026/02/002',
    noFaktur: 'FAK-ELK/2026/031',
    tanggal: '2026-02-18',
    sumberPengadaan: 'BLUD',
    barangId: 'BRG-ELK-001',
    namaBarang: 'Lampu LED Philips 19 Watt Cool Daylight',
    kategori: 'Alat Listrik',
    satuan: 'Buah',
    hargaSatuan: 65000,
    jumlahMasuk: 10,
    jumlahTotal: 650000,
    supplier: 'Toko Terang Abadi Jaya',
    keterangan: 'Cadangan Penerangan Ruang Tindakan & Kamar Obat'
  }
];

export const INITIAL_PENGELUARAN: PengeluaranBarang[] = [
  {
    id: 'OUT-2026-001',
    noBukti: 'BK-2026/01/001',
    tanggal: '2026-01-18',
    barangId: 'BRG-ATK-001',
    namaBarang: 'Kertas HVS A4 70gr Sinar Dunia',
    kategori: 'ATK',
    satuan: 'Rim',
    hargaSatuan: 55000,
    stokAwal: 40,
    jumlahKeluar: 10,
    sisaStok: 30,
    totalHarga: 550000,
    tujuanRuangan: 'Tata Usaha (TU) & Manajemen',
    penerima: 'Hj. Siti Marlina, S.ST.',
    keterangan: 'Kebutuhan administrasi kepegawaian dan laporan bulanan'
  },
  {
    id: 'OUT-2026-002',
    noBukti: 'BK-2026/01/002',
    tanggal: '2026-01-20',
    barangId: 'BRG-KBR-001',
    namaBarang: 'Sabun Cuci Tangan Cair / Handsoap Antiseptik 5 Liter',
    kategori: 'Perabot Kantor/Kebersihan',
    satuan: 'Jerigen',
    hargaSatuan: 85000,
    stokAwal: 20,
    jumlahKeluar: 6,
    sisaStok: 14,
    totalHarga: 510000,
    tujuanRuangan: 'Gudang Kebersihan & Sanitasi',
    penerima: 'Pak Slamet (Petugas Kebersihan)',
    keterangan: 'Distribusi wastafel semua poli rawat jalan'
  },
  {
    id: 'OUT-2026-003',
    noBukti: 'BK-2026/02/001',
    tanggal: '2026-02-10',
    barangId: 'BRG-ATK-001',
    namaBarang: 'Kertas HVS A4 70gr Sinar Dunia',
    kategori: 'ATK',
    satuan: 'Rim',
    hargaSatuan: 55000,
    stokAwal: 30,
    jumlahKeluar: 8,
    sisaStok: 22,
    totalHarga: 440000,
    tujuanRuangan: 'Ruang Pendaftaran & Rekam Medis',
    penerima: 'Andi Saputra',
    keterangan: 'Pencetakan formulir pendaftaran loket umum'
  },
  {
    id: 'OUT-2026-004',
    noBukti: 'BK-2026/02/002',
    tanggal: '2026-02-15',
    barangId: 'BRG-POS-001',
    namaBarang: 'Materai Tempel Rp 10.000 (Asli Kantor Pos)',
    kategori: 'Benda Pos',
    satuan: 'Lembar',
    hargaSatuan: 11000,
    stokAwal: 70,
    jumlahKeluar: 65,
    sisaStok: 5, // tinggal 5
    totalHarga: 715000,
    tujuanRuangan: 'Tata Usaha (TU) & Manajemen',
    penerima: 'Ibu Ningsih (Bendahara BLUD)',
    keterangan: 'Penandatanganan SPK Kontrak Pengadaan BLUD & PKS BPJS'
  },
  {
    id: 'OUT-2026-005',
    noBukti: 'BK-2026/02/003',
    tanggal: '2026-02-22',
    barangId: 'BRG-ELK-001',
    namaBarang: 'Lampu LED Philips 19 Watt Cool Daylight',
    kategori: 'Alat Listrik',
    satuan: 'Buah',
    hargaSatuan: 65000,
    stokAwal: 30,
    jumlahKeluar: 25,
    sisaStok: 5, // tinggal 5
    totalHarga: 1625000,
    tujuanRuangan: 'UGD / Tindakan',
    penerima: 'Ns. Hendra, S.Kep.',
    keterangan: 'Penggantian lampu koridor dan ruang tindakan gawat darurat'
  }
];
