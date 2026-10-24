import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  Lock, 
  Layers
} from 'lucide-react';
import { Barang, CategoryType, KopPuskesmas, PenerimaanBarang, PengeluaranBarang, UserProfile } from '../types';
import { CATEGORIES } from '../data/initialData';
import { hitungRekapLaporan, formatRupiah, formatAngka, formatTanggalIndo } from '../utils/formatters';
import { LogoBadung } from './logos/LogoBadung';
import { LogoPuskesmas } from './logos/LogoPuskesmas';

interface Props {
  listBarang: Barang[];
  listPenerimaan: PenerimaanBarang[];
  listPengeluaran: PengeluaranBarang[];
  kop: KopPuskesmas;
  currentUser: UserProfile;
}

export const LaporanView: React.FC<Props> = ({
  listBarang,
  listPenerimaan,
  listPengeluaran,
  kop,
  currentUser
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Role check: Only admin and kapusk can view
  const canView = currentUser.role === 'admin' || currentUser.role === 'kapusk';

  if (!canView) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
        <Lock className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Akses Dibatasi</h3>
        <p className="text-xs text-slate-500 mt-1">
          Menu Laporan Rekapitulasi Persediaan Resmi hanya dapat diakses oleh Kepala Puskesmas (KAPUSK), 
          Kepala Tata Usaha (KTU), dan Administrator Sistem.
        </p>
      </div>
    );
  }

  const { rows, total } = hitungRekapLaporan(
    listBarang,
    listPenerimaan,
    listPengeluaran,
    selectedCategory,
    startDate,
    endDate
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No', 'Kode', 'Nama Barang', 'Kategori', 'Satuan', 'Harga Satuan',
      'Stok Awal Jml', 'Stok Awal Rp',
      'Penerimaan Jml', 'Penerimaan Rp',
      'Pengeluaran Jml', 'Pengeluaran Rp',
      'Sisa Stok Jml', 'Sisa Stok Rp'
    ];

    const dataRows = rows.map(r => [
      r.no,
      r.kode,
      `"${r.namaBarang.replace(/"/g, '""')}"`,
      r.kategori,
      r.satuan,
      r.hargaSatuan,
      r.stokAwalJumlah,
      r.stokAwalTotalHarga,
      r.penerimaanJumlah,
      r.penerimaanTotalHarga,
      r.pengeluaranJumlah,
      r.pengeluaranTotalHarga,
      r.sisaStokJumlah,
      r.sisaStokTotalHarga
    ]);

    // Total row
    dataRows.push([
      'TOTAL',
      '',
      'REKAPITULASI KESELURUHAN',
      '',
      '',
      '',
      total.totalJumlahStokAwal,
      total.totalNilaiStokAwal,
      total.totalJumlahPenerimaan,
      total.totalNilaiPenerimaan,
      total.totalJumlahPengeluaran,
      total.totalNilaiPengeluaran,
      total.totalJumlahSisaStok,
      total.totalNilaiSisaStok
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...dataRows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Rekapitulasi_BHP_BLUD_${selectedCategory}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Controller Bar (No Print) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Laporan Akuntansi Persediaan BLUD</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Rekapitulasi Mutasi Persediaan BHP
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Format resmi 4 kolom (Stok Awal, Penerimaan, Pengeluaran, Sisa Stok) lengkap dengan kop dan pengesahan tanda tangan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Laporan (Print)</span>
          </button>
        </div>
      </div>

      {/* Filter Controllers (No Print) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print text-xs">
        
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="SEMUA">Semua Kategori Persediaan</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Periode:</span>
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold"
          />
          <span className="text-slate-400 font-bold">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold"
          />
        </div>

        {/* Role indicator chip */}
        <div className="flex items-center gap-2 text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengguna Aktif: {currentUser.role.toUpperCase()} ({currentUser.nama.split(',')[0]})</span>
        </div>

      </div>

      {/* Main Printable Document Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-10 print-card">
        
        {/* KOP PUSKESMAS RESMI (STANDAR PEMKAB BADUNG & DINAS KESEHATAN) */}
        <div className="border-b-4 border-double border-slate-900 pb-3 mb-6 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <LogoBadung className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
          </div>

          <div className="space-y-0.5 text-center flex-1">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-800">
              {kop.namaPemerintah || 'PEMERINTAH KABUPATEN BADUNG'}
            </h4>
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
              {kop.namaDinas || 'DINAS KESEHATAN'}
            </h3>
            <h2 className="text-base sm:text-xl font-black uppercase text-emerald-950 tracking-tight">
              {kop.namaPuskesmas || 'UPTD PUSKESMAS PETANG I'}
            </h2>
            <p className="text-[11px] text-slate-700 leading-tight">
              {kop.alamat || 'Jl. Jahuripan-Petang, Desa Petang, Kecamatan Petang, Kabupaten Badung'}
            </p>
            <p className="text-[10.5px] text-slate-600 leading-tight font-medium">
              Telp. {kop.telepon || '0361 813379'}, Email : {kop.email || 'petang1_dikesbadung@yahoo.com'}, Website : {kop.website || 'https://puskesmaspetang1.badungkab.go.id/'}
            </p>
          </div>

          <div className="shrink-0">
            <LogoPuskesmas className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center mb-6">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 underline underline-offset-4">
            LAPORAN REKAPITULASI MUTASI PERSEDIAAN BARANG HABIS PAKAI (BHP)
          </h3>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Sumber Dana: PENGADAAN BLUD PUSKESMAS • Kategori: <strong className="text-emerald-900">{selectedCategory}</strong>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Periode: {formatTanggalIndo(startDate)} s/d {formatTanggalIndo(endDate)}
          </p>
        </div>

        {/* The 4-Block Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border border-slate-400 border-collapse">
            
            {/* Table Head Multi-level */}
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[10px] tracking-wider border-b border-slate-400">
                <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 text-center w-8">No</th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 min-w-[140px]">Nama Barang & Kode</th>
                <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 text-center">Satuan</th>
                <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 text-right">Harga Satuan</th>
                
                {/* 1. STOK AWAL */}
                <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-slate-200/70">
                  1. STOK AWAL
                </th>

                {/* 2. PENERIMAAN */}
                <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-teal-100/70">
                  2. PENERIMAAN
                </th>

                {/* 3. PENGELUARAN */}
                <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-amber-100/70">
                  3. PENGELUARAN
                </th>

                {/* 4. SISA STOK */}
                <th colSpan={2} className="py-1 px-2 border-slate-300 text-center bg-emerald-100 font-black">
                  4. SISA STOK
                </th>
              </tr>

              <tr className="bg-slate-50 text-slate-700 font-bold text-[9px] uppercase tracking-wider border-b-2 border-slate-400">
                {/* Stok Awal Sub */}
                <th className="py-1.5 px-2 border-r border-slate-300 text-center w-12 bg-slate-200/40">Jumlah</th>
                <th className="py-1.5 px-2 border-r border-slate-300 text-right bg-slate-200/40">Harga Total</th>

                {/* Penerimaan Sub */}
                <th className="py-1.5 px-2 border-r border-slate-300 text-center w-12 bg-teal-50">Jumlah</th>
                <th className="py-1.5 px-2 border-r border-slate-300 text-right bg-teal-50">Harga Total</th>

                {/* Pengeluaran Sub */}
                <th className="py-1.5 px-2 border-r border-slate-300 text-center w-12 bg-amber-50">Jumlah</th>
                <th className="py-1.5 px-2 border-r border-slate-300 text-right bg-amber-50">Harga Total</th>

                {/* Sisa Stok Sub */}
                <th className="py-1.5 px-2 border-r border-slate-300 text-center w-12 bg-emerald-50">Jumlah</th>
                <th className="py-1.5 px-2 text-right bg-emerald-50">Harga Total</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-300">
              {rows.map((row) => (
                <tr key={row.barangId} className="hover:bg-slate-50/70">
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-400">
                    {row.no}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200">
                    <div className="font-bold text-slate-900 leading-tight">{row.namaBarang}</div>
                    <div className="text-[9px] font-mono-code text-slate-400">{row.kode}</div>
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center text-slate-600 font-medium">
                    {row.satuan}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-right font-medium text-slate-700 whitespace-nowrap">
                    {formatRupiah(row.hargaSatuan)}
                  </td>

                  {/* Stok Awal */}
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-semibold text-slate-700 bg-slate-50/30">
                    {row.stokAwalJumlah}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-right font-semibold text-slate-800 bg-slate-50/30 whitespace-nowrap">
                    {formatRupiah(row.stokAwalTotalHarga)}
                  </td>

                  {/* Penerimaan */}
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-teal-800 bg-teal-50/20">
                    {row.penerimaanJumlah > 0 ? `+${row.penerimaanJumlah}` : '0'}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-right font-semibold text-teal-900 bg-teal-50/20 whitespace-nowrap">
                    {formatRupiah(row.penerimaanTotalHarga)}
                  </td>

                  {/* Pengeluaran */}
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-amber-800 bg-amber-50/20">
                    {row.pengeluaranJumlah > 0 ? `-${row.pengeluaranJumlah}` : '0'}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-right font-semibold text-amber-900 bg-amber-50/20 whitespace-nowrap">
                    {formatRupiah(row.pengeluaranTotalHarga)}
                  </td>

                  {/* Sisa Stok */}
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-black text-emerald-950 bg-emerald-50/40">
                    {row.sisaStokJumlah}
                  </td>
                  <td className="py-2 px-2 text-right font-black text-emerald-950 bg-emerald-50/40 whitespace-nowrap">
                    {formatRupiah(row.sisaStokTotalHarga)}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Baris Rekap Total Paling Bawah */}
            <tfoot>
              <tr className="bg-slate-200 text-slate-900 font-black border-t-2 border-slate-400">
                <td colSpan={4} className="py-3 px-3 border-r border-slate-300 text-center uppercase tracking-wider text-xs">
                  JUMLAH TOTAL REKAPITULASI (RP)
                </td>

                {/* Total Stok Awal */}
                <td className="py-3 px-2 border-r border-slate-300 text-center text-xs">
                  {formatAngka(total.totalJumlahStokAwal)}
                </td>
                <td className="py-3 px-2 border-r border-slate-300 text-right whitespace-nowrap text-xs">
                  {formatRupiah(total.totalNilaiStokAwal)}
                </td>

                {/* Total Penerimaan */}
                <td className="py-3 px-2 border-r border-slate-300 text-center text-teal-950 text-xs">
                  {formatAngka(total.totalJumlahPenerimaan)}
                </td>
                <td className="py-3 px-2 border-r border-slate-300 text-right text-teal-950 whitespace-nowrap text-xs">
                  {formatRupiah(total.totalNilaiPenerimaan)}
                </td>

                {/* Total Pengeluaran */}
                <td className="py-3 px-2 border-r border-slate-300 text-center text-amber-950 text-xs">
                  {formatAngka(total.totalJumlahPengeluaran)}
                </td>
                <td className="py-3 px-2 border-r border-slate-300 text-right text-amber-950 whitespace-nowrap text-xs">
                  {formatRupiah(total.totalNilaiPengeluaran)}
                </td>

                {/* Total Sisa Stok */}
                <td className="py-3 px-2 border-r border-slate-300 text-center text-emerald-950 text-xs bg-emerald-200/60">
                  {formatAngka(total.totalJumlahSisaStok)}
                </td>
                <td className="py-3 px-2 text-right text-emerald-950 whitespace-nowrap text-xs bg-emerald-200/60">
                  {formatRupiah(total.totalNilaiSisaStok)}
                </td>
              </tr>
            </tfoot>

          </table>
        </div>

        {/* Tanda Tangan Dokumen Lengkap (Signatures) */}
        <div className="mt-12 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs break-inside-avoid max-w-3xl mx-auto">
          {/* Kolom 1: KAPUSK */}
          <div>
            <p className="text-slate-500 font-medium">Mengetahui / Mengesahkan,</p>
            <p className="font-bold text-slate-900 mt-0.5">Kepala UPTD Puskesmas Petang I</p>
            <div className="h-24"></div>
            <p className="font-extrabold text-slate-900 underline text-sm">{kop.namaKapusk || 'dr. I Ketut Dwipayana, M.Kes.'}</p>
            <p className="text-[11px] text-slate-600 font-mono-code">NIP. {kop.nipKapusk || '19783112 200712 1 004'}</p>
          </div>

          {/* Kolom 2: Pengurus Barang */}
          <div>
            <p className="text-slate-500 font-medium">
              Petang, {formatTanggalIndo(endDate)}
            </p>
            <p className="font-bold text-slate-900 mt-0.5">Pengurus Barang Pembantu BHP</p>
            <div className="h-24"></div>
            <p className="font-extrabold text-slate-900 underline text-sm">{kop.namaPengurusBarang || 'I Ketut Buda Antara'}</p>
            <p className="text-[11px] text-slate-600 font-mono-code">NIP. {kop.nipPengurusBarang || '19930920 201802 1 003'}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
