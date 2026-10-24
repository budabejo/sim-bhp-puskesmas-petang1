import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Boxes, 
  Building2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Barang, CategoryType, KopPuskesmas, PenerimaanBarang, PengeluaranBarang } from '../types';
import { CATEGORIES } from '../data/initialData';
import { buildKartuStok, formatRupiah, formatAngka, formatTanggalIndo } from '../utils/formatters';
import { LogoBadung } from './logos/LogoBadung';
import { LogoPuskesmas } from './logos/LogoPuskesmas';

interface Props {
  listBarang: Barang[];
  listPenerimaan: PenerimaanBarang[];
  listPengeluaran: PengeluaranBarang[];
  kop: KopPuskesmas;
}

export const KartuStokView: React.FC<Props> = ({
  listBarang,
  listPenerimaan,
  listPengeluaran,
  kop
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [selectedBarangId, setSelectedBarangId] = useState<string>(
    listBarang.length > 0 ? listBarang[0].id : ''
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Filter barang list
  const filteredBarang = listBarang.filter(b => {
    const matchCat = selectedCategory === 'SEMUA' || b.kategori === selectedCategory;
    const matchSearch = b.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.kode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // Current active barang
  const currentBarang = listBarang.find(b => b.id === selectedBarangId) || filteredBarang[0] || listBarang[0];

  // Build mutasi for active barang
  const mutasiList = currentBarang 
    ? buildKartuStok(currentBarang, listPenerimaan, listPengeluaran)
    : [];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!currentBarang) return;
    const headers = ['No', 'Tanggal', 'No Transaksi', 'Jenis', 'Keterangan', 'Stok Awal', 'Masuk', 'Keluar', 'Sisa Stok', 'Harga Satuan', 'Nilai Saldo'];
    const rows = mutasiList.map((m, idx) => [
      idx + 1,
      m.tanggal,
      m.noTransaksi,
      m.jenis,
      `"${m.keterangan.replace(/"/g, '""')}"`,
      m.stokAwal,
      m.masuk,
      m.keluar,
      m.sisaStok,
      m.hargaSatuan,
      m.sisaStok * m.hargaSatuan
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kartu_Stok_${currentBarang.kode}_${currentBarang.nama.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header (No Print) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Mutasi Saldo Berjalan (Ledger Kumulatif)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Kartu Stok Barang Habis Pakai (BHP)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Setiap penerimaan masuk ditambahkan pada sisa stok terakhir menjadi stok awal transaksi berikutnya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu Stok (Print)</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Selector, Right Detailed Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 1 Col: Selector list of items (No Print) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 no-print flex flex-col max-h-[820px]">
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Pilih Barang BHP
            </span>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-2"
            >
              <option value="SEMUA">Semua Kategori ({listBarang.length})</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari barang..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* List items scrollable */}
          <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 divide-y divide-slate-100">
            {filteredBarang.map(b => {
              const isSelected = currentBarang && currentBarang.id === b.id;
              const isKritis = b.stokSaatIni <= (b.stokMinimum || 5);
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBarangId(b.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                    isSelected 
                      ? 'bg-emerald-800 text-white shadow-md' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono-code font-bold ${isSelected ? 'text-emerald-200' : 'text-emerald-700'}`}>
                        {b.kode}
                      </span>
                    </div>
                    <div className="text-xs font-bold truncate leading-snug">
                      {b.nama}
                    </div>
                    <div className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                      Kategori: {b.kategori}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-emerald-700 text-white' 
                        : isKritis
                        ? 'bg-amber-100 text-amber-800 font-bold'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {b.stokSaatIni} {b.satuan}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Kartu Stok Printable Sheet */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 print-card">
          
          {/* KOP PUSKESMAS RESMI (Appears on print & web) */}
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

          {/* Kartu Stok Title and Item Header */}
          {currentBarang ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 underline underline-offset-4">
                  KARTU STOK BARANG
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Sumber Dana: <strong>PENGADAAN BLUD</strong> • Tahun Anggaran 2026
                </p>
              </div>

              {/* Item Info Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Kode / Barcode:</span>
                  <span className="font-mono-code font-bold text-emerald-800 text-sm">{currentBarang.kode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Nama Barang:</span>
                  <span className="font-bold text-slate-900 text-sm line-clamp-1">{currentBarang.nama}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Kategori & Satuan:</span>
                  <span className="font-semibold text-slate-800">{currentBarang.kategori} ({currentBarang.satuan})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Harga Satuan Standar:</span>
                  <span className="font-extrabold text-blue-700">{formatRupiah(currentBarang.hargaSatuan)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lokasi Penyimpanan:</span>
                  <span className="font-medium text-slate-700">{currentBarang.lokasiRak || 'Gudang Logistik Utama'}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sisa Stok Fisik Terkini:</span>
                  <span className="font-black text-emerald-800 text-base">
                    {currentBarang.stokSaatIni} {currentBarang.satuan}
                  </span>
                </div>
              </div>

              {/* Mutasi Ledger Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-300">
                      <th className="py-2.5 px-3 border-r border-slate-300 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Tanggal</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">No. Bukti / Transaksi</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Uraian / Keterangan</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-center bg-slate-200/50">Stok Awal</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-center bg-teal-50">Masuk (+)</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-center bg-amber-50">Keluar (-)</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-center bg-emerald-100 font-black">Sisa Stok</th>
                      <th className="py-2.5 px-3 text-right">Total Nilai (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mutasiList.map((m, idx) => {
                      const totalNilaiBaris = m.sisaStok * m.hargaSatuan;
                      return (
                        <tr 
                          key={m.id} 
                          className={`hover:bg-slate-50 transition-colors ${
                            m.jenis === 'AWAL' ? 'bg-slate-50/60 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                            {formatTanggalIndo(m.tanggal)}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-mono-code font-bold text-slate-800">
                            {m.noTransaksi}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700">
                            <div>{m.keterangan}</div>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-slate-700 bg-slate-50/50">
                            {m.stokAwal}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-teal-700 bg-teal-50/40">
                            {m.masuk > 0 ? `+${m.masuk}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-amber-700 bg-amber-50/40">
                            {m.keluar > 0 ? `-${m.keluar}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center font-black text-emerald-900 bg-emerald-50">
                            {m.sisaStok}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatRupiah(totalNilaiBaris)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan Dokumen (Signatures) */}
              <div className="mt-12 pt-6 grid grid-cols-2 text-center text-xs break-inside-avoid max-w-2xl mx-auto">
                <div>
                  <p className="text-slate-500 font-medium">Mengetahui / Mengesahkan,</p>
                  <p className="font-bold text-slate-900 mt-0.5">Kepala UPTD Puskesmas Petang I</p>
                  <div className="h-20"></div>
                  <p className="font-extrabold text-slate-900 underline text-sm">{kop.namaKapusk || 'dr. I Ketut Dwipayana, M.Kes.'}</p>
                  <p className="text-[11px] text-slate-600 font-mono-code">NIP. {kop.nipKapusk || '19783112 200712 1 004'}</p>
                </div>

                <div>
                  <p className="text-slate-500 font-medium">
                    Petang, {formatTanggalIndo(new Date().toISOString().split('T')[0])}
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5">Pengurus Barang Pembantu BHP</p>
                  <div className="h-20"></div>
                  <p className="font-extrabold text-slate-900 underline text-sm">{kop.namaPengurusBarang || 'I Ketut Buda Antara'}</p>
                  <p className="text-[11px] text-slate-600 font-mono-code">NIP. {kop.nipPengurusBarang || '19930920 201802 1 003'}</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              Silakan pilih barang pada daftar sebelah kiri untuk menampilkan rincian kartu stok.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
