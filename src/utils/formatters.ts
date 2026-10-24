import { Barang, CategoryType, MutasiKartuStok, PenerimaanBarang, PengeluaranBarang } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

export function formatAngka(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount || 0);
}

export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatTanggalWaktuLengkap(date: Date = new Date()): string {
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ][date.getMonth()];
  const tgl = date.getDate();
  const thn = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${hari}, ${tgl} ${bulan} ${thn} | ${hh}:${mm}:${ss} WIB`;
}

/**
 * Kartu Stok mutasi riwayat berjalan
 */
export function buildKartuStok(
  barang: Barang,
  penerimaanList: PenerimaanBarang[],
  pengeluaranList: PengeluaranBarang[]
): MutasiKartuStok[] {
  // Filter for this barang
  const penerimaan = penerimaanList.filter(p => p.barangId === barang.id);
  const pengeluaran = pengeluaranList.filter(p => p.barangId === barang.id);

  interface RawTx {
    id: string;
    tanggal: string;
    noTransaksi: string;
    jenis: 'MASUK' | 'KELUAR';
    keterangan: string;
    masuk: number;
    keluar: number;
    tujuan?: string;
    timestamp: number;
  }

  const rawTxList: RawTx[] = [];

  penerimaan.forEach(p => {
    rawTxList.push({
      id: p.id,
      tanggal: p.tanggal,
      noTransaksi: p.noUrut || p.noFaktur,
      jenis: 'MASUK',
      keterangan: `Penerimaan Barang (${p.sumberPengadaan}) - ${p.supplier || 'Penyedia BLUD'}`,
      masuk: p.jumlahMasuk,
      keluar: 0,
      timestamp: new Date(p.tanggal).getTime()
    });
  });

  pengeluaran.forEach(p => {
    rawTxList.push({
      id: p.id,
      tanggal: p.tanggal,
      noTransaksi: p.noBukti,
      jenis: 'KELUAR',
      keterangan: `Pengeluaran ke ${p.tujuanRuangan} (${p.penerima || '-'}) - ${p.keterangan || ''}`,
      masuk: 0,
      keluar: p.jumlahKeluar,
      tujuan: p.tujuanRuangan,
      timestamp: new Date(p.tanggal).getTime()
    });
  });

  // Sort ascending by date and id
  rawTxList.sort((a, b) => {
    if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    return a.id.localeCompare(b.id);
  });

  const kartu: MutasiKartuStok[] = [];
  
  // Saldo awal awal periode
  let currentSaldo = barang.stokAwalMaster || 0;

  kartu.push({
    id: `INIT-${barang.id}`,
    tanggal: barang.createdAt || '2026-01-01',
    noTransaksi: 'SALDO-AWAL',
    jenis: 'AWAL',
    keterangan: 'Saldo Awal Awal Periode / Master Barang',
    stokAwal: currentSaldo,
    masuk: 0,
    keluar: 0,
    sisaStok: currentSaldo,
    hargaSatuan: barang.hargaSatuan
  });

  for (const tx of rawTxList) {
    const prevSaldo = currentSaldo;
    const newSaldo = prevSaldo + tx.masuk - tx.keluar;
    currentSaldo = newSaldo;

    kartu.push({
      id: tx.id,
      tanggal: tx.tanggal,
      noTransaksi: tx.noTransaksi,
      jenis: tx.jenis,
      keterangan: tx.keterangan,
      stokAwal: prevSaldo,
      masuk: tx.masuk,
      keluar: tx.keluar,
      sisaStok: newSaldo,
      hargaSatuan: barang.hargaSatuan,
      tujuan: tx.tujuan
    });
  }

  return kartu;
}

export interface ItemLaporanRow {
  no: number;
  barangId: string;
  kode: string;
  namaBarang: string;
  kategori: CategoryType;
  satuan: string;
  hargaSatuan: number;
  
  // Stok Awal
  stokAwalJumlah: number;
  stokAwalTotalHarga: number;
  
  // Penerimaan
  penerimaanJumlah: number;
  penerimaanTotalHarga: number;
  
  // Pengeluaran
  pengeluaranJumlah: number;
  pengeluaranTotalHarga: number;
  
  // Sisa Stok
  sisaStokJumlah: number;
  sisaStokTotalHarga: number;
  
  statusStok: 'AMAN' | 'MINIMUM' | 'HABIS';
}

export interface RekapLaporanTotal {
  totalItem: number;
  totalNilaiStokAwal: number;
  totalNilaiPenerimaan: number;
  totalNilaiPengeluaran: number;
  totalNilaiSisaStok: number;
  
  totalJumlahStokAwal: number;
  totalJumlahPenerimaan: number;
  totalJumlahPengeluaran: number;
  totalJumlahSisaStok: number;
}

export function hitungRekapLaporan(
  listBarang: Barang[],
  listPenerimaan: PenerimaanBarang[],
  listPengeluaran: PengeluaranBarang[],
  filterKategori: string = 'SEMUA',
  startDate?: string,
  endDate?: string
): { rows: ItemLaporanRow[]; total: RekapLaporanTotal } {
  const filteredBarang = filterKategori === 'SEMUA' 
    ? listBarang 
    : listBarang.filter(b => b.kategori === filterKategori);

  const rows: ItemLaporanRow[] = [];

  let sumAwalRp = 0;
  let sumMasukRp = 0;
  let sumKeluarRp = 0;
  let sumSisaRp = 0;

  let sumAwalJml = 0;
  let sumMasukJml = 0;
  let sumKeluarJml = 0;
  let sumSisaJml = 0;

  filteredBarang.forEach((b, idx) => {
    // Filter penerimaan for this item within date range if provided
    let itemPenerimaan = listPenerimaan.filter(p => p.barangId === b.id);
    let itemPengeluaran = listPengeluaran.filter(p => p.barangId === b.id);

    if (startDate) {
      itemPenerimaan = itemPenerimaan.filter(p => p.tanggal >= startDate);
      itemPengeluaran = itemPengeluaran.filter(p => p.tanggal >= startDate);
    }
    if (endDate) {
      itemPenerimaan = itemPenerimaan.filter(p => p.tanggal <= endDate);
      itemPengeluaran = itemPengeluaran.filter(p => p.tanggal <= endDate);
    }

    const penerimaanJumlah = itemPenerimaan.reduce((acc, curr) => acc + curr.jumlahMasuk, 0);
    const penerimaanTotalHarga = penerimaanJumlah * b.hargaSatuan;

    const pengeluaranJumlah = itemPengeluaran.reduce((acc, curr) => acc + curr.jumlahKeluar, 0);
    const pengeluaranTotalHarga = pengeluaranJumlah * b.hargaSatuan;

    const stokAwalJumlah = b.stokAwalMaster || 0;
    const stokAwalTotalHarga = stokAwalJumlah * b.hargaSatuan;

    const sisaStokJumlah = b.stokSaatIni;
    const sisaStokTotalHarga = sisaStokJumlah * b.hargaSatuan;

    let statusStok: 'AMAN' | 'MINIMUM' | 'HABIS' = 'AMAN';
    if (sisaStokJumlah <= 0) {
      statusStok = 'HABIS';
    } else if (sisaStokJumlah <= (b.stokMinimum || 5)) {
      statusStok = 'MINIMUM';
    }

    sumAwalRp += stokAwalTotalHarga;
    sumMasukRp += penerimaanTotalHarga;
    sumKeluarRp += pengeluaranTotalHarga;
    sumSisaRp += sisaStokTotalHarga;

    sumAwalJml += stokAwalJumlah;
    sumMasukJml += penerimaanJumlah;
    sumKeluarJml += pengeluaranJumlah;
    sumSisaJml += sisaStokJumlah;

    rows.push({
      no: idx + 1,
      barangId: b.id,
      kode: b.kode,
      namaBarang: b.nama,
      kategori: b.kategori,
      satuan: b.satuan,
      hargaSatuan: b.hargaSatuan,
      
      stokAwalJumlah,
      stokAwalTotalHarga,
      
      penerimaanJumlah,
      penerimaanTotalHarga,
      
      pengeluaranJumlah,
      pengeluaranTotalHarga,
      
      sisaStokJumlah,
      sisaStokTotalHarga,
      
      statusStok
    });
  });

  return {
    rows,
    total: {
      totalItem: rows.length,
      totalNilaiStokAwal: sumAwalRp,
      totalNilaiPenerimaan: sumMasukRp,
      totalNilaiPengeluaran: sumKeluarRp,
      totalNilaiSisaStok: sumSisaRp,
      totalJumlahStokAwal: sumAwalJml,
      totalJumlahPenerimaan: sumMasukJml,
      totalJumlahPengeluaran: sumKeluarJml,
      totalJumlahSisaStok: sumSisaJml
    }
  };
}
