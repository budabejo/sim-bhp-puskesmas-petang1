import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Printer, 
  Calendar, 
  FileText, 
  Building2, 
  X, 
  Boxes,
  CheckCircle2,
  Barcode,
  Sparkles,
  Layers
} from 'lucide-react';
import { RupiahIcon } from './icons/RupiahIcon';
import { Barang, CategoryType, PenerimaanBarang, UserProfile } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatRupiah, formatAngka, formatTanggalIndo } from '../utils/formatters';

interface Props {
  listPenerimaan: PenerimaanBarang[];
  listBarang: Barang[];
  currentUser: UserProfile;
  onAddBarang?: (barang: Barang) => void;
  onAddPenerimaan: (item: PenerimaanBarang) => void;
  onUpdatePenerimaan: (item: PenerimaanBarang, oldQty: number) => void;
  onDeletePenerimaan: (id: string, qty: number, barangId: string) => void;
  onOpenPrintLabel: (b: Barang) => void;
}

export const PenerimaanView: React.FC<Props> = ({
  listPenerimaan,
  listBarang,
  currentUser,
  onAddBarang,
  onAddPenerimaan,
  onUpdatePenerimaan,
  onDeletePenerimaan,
  onOpenPrintLabel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PenerimaanBarang | null>(null);

  // Mode: Barang Lama vs + Barang Baru Langsung (Smart 1-Gate Input)
  const [isNewBarangMode, setIsNewBarangMode] = useState<boolean>(false);

  // Form states
  const [formNoUrut, setFormNoUrut] = useState('');
  const [formNoFaktur, setFormNoFaktur] = useState('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formSumberPengadaan, setFormSumberPengadaan] = useState('BLUD');
  const [formBarangId, setFormBarangId] = useState('');
  const [formKategori, setFormKategori] = useState<CategoryType>('ATK');
  const [formSatuan, setFormSatuan] = useState('Rim');
  const [formHargaSatuan, setFormHargaSatuan] = useState<number>(55000);
  const [formJumlahMasuk, setFormJumlahMasuk] = useState<number>(10);
  const [formSupplier, setFormSupplier] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('Pengadaan Rutin BHP BLUD');

  // New Barang Direct Input states
  const [formNewNama, setFormNewNama] = useState('');
  const [formNewKategori, setFormNewKategori] = useState<CategoryType>('ATK');
  const [formNewSatuan, setFormNewSatuan] = useState('Pcs');
  const [formNewLokasiRak, setFormNewLokasiRak] = useState('Lemari ATK-1');
  const [formNewStokMin, setFormNewStokMin] = useState<number>(5);

  const isAdmin = currentUser.role === 'admin';
  const isPetugas = currentUser.role === 'petugas';
  const canEdit = isAdmin || isPetugas;

  // Filtered list
  const filtered = listPenerimaan.filter(p => {
    const matchCat = selectedCategory === 'SEMUA' || p.kategori === selectedCategory;
    const matchSearch = p.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.noUrut.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.noFaktur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalNilaiMasuk = filtered.reduce((acc, curr) => acc + curr.jumlahTotal, 0);
  const totalVolumeMasuk = filtered.reduce((acc, curr) => acc + curr.jumlahMasuk, 0);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsNewBarangMode(false);
    const dateCode = new Date().toISOString().slice(2, 7).replace('-', '');
    const randNum = Math.floor(100 + Math.random() * 900);
    setFormNoUrut(`BM-${dateCode}/${randNum}`);
    setFormNoFaktur(`FAK-BLUD/${randNum}`);
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormSumberPengadaan('BLUD');
    
    // Pick first barang
    if (listBarang.length > 0) {
      const b = listBarang[0];
      setFormBarangId(b.id);
      setFormKategori(b.kategori);
      setFormSatuan(b.satuan);
      setFormHargaSatuan(b.hargaSatuan);
    }
    setFormJumlahMasuk(10);
    setFormSupplier('CV. Sejahtera Mandiri Jaya');
    setFormKeterangan('Pengadaan Rutin Belanja Bahan Habis Pakai BLUD');
    
    // Reset new item states
    setFormNewNama('');
    setFormNewKategori('ATK');
    setFormNewSatuan('Pcs');
    setFormNewLokasiRak('Lemari ATK-1');
    setFormNewStokMin(5);

    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PenerimaanBarang) => {
    setEditingItem(p);
    setIsNewBarangMode(false);
    setFormNoUrut(p.noUrut);
    setFormNoFaktur(p.noFaktur);
    setFormTanggal(p.tanggal);
    setFormSumberPengadaan(p.sumberPengadaan);
    setFormBarangId(p.barangId);
    setFormKategori(p.kategori);
    setFormSatuan(p.satuan);
    setFormHargaSatuan(p.hargaSatuan);
    setFormJumlahMasuk(p.jumlahMasuk);
    setFormSupplier(p.supplier || '');
    setFormKeterangan(p.keterangan || '');
    setIsModalOpen(true);
  };

  const handleBarangChange = (barangId: string) => {
    setFormBarangId(barangId);
    const found = listBarang.find(b => b.id === barangId);
    if (found) {
      setFormKategori(found.kategori);
      setFormSatuan(found.satuan);
      setFormHargaSatuan(found.hargaSatuan);
    }
  };

  const calculatedTotal = formJumlahMasuk * formHargaSatuan;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formJumlahMasuk <= 0) {
      alert('Jumlah barang masuk harus lebih besar dari 0!');
      return;
    }

    // 1. KASUS SMART: Input Barang Baru Langsung (Sekali Input Jadi Banyak Output)
    if (isNewBarangMode && !editingItem) {
      if (!formNewNama.trim()) {
        alert('Silakan isi Nama Barang Baru!');
        return;
      }

      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newKode = `BHP-${formNewKategori.substring(0, 3).toUpperCase()}-${randomSuffix}`;
      
      const newBarang: Barang = {
        id: `BRG-${Date.now()}`,
        kode: newKode,
        nama: formNewNama.trim(),
        kategori: formNewKategori,
        sumberDana: 'BLUD',
        satuan: formNewSatuan.trim() || 'Pcs',
        hargaSatuan: Number(formHargaSatuan),
        stokAwalMaster: 0,
        stokSaatIni: Number(formJumlahMasuk),
        stokMinimum: Number(formNewStokMin) || 5,
        lokasiRak: formNewLokasiRak.trim() || 'Gudang Utama',
        spesifikasi: '',
        createdAt: formTanggal
      };

      // Simpan ke Master Barang
      if (onAddBarang) {
        onAddBarang(newBarang);
      }

      // Simpan ke Penerimaan Barang
      const newPenerimaan: PenerimaanBarang = {
        id: `RCV-${Date.now()}`,
        noUrut: formNoUrut,
        noFaktur: formNoFaktur,
        tanggal: formTanggal,
        sumberPengadaan: 'BLUD',
        barangId: newBarang.id,
        namaBarang: newBarang.nama,
        kategori: newBarang.kategori,
        satuan: newBarang.satuan,
        hargaSatuan: Number(formHargaSatuan),
        jumlahMasuk: Number(formJumlahMasuk),
        jumlahTotal: calculatedTotal,
        supplier: formSupplier,
        keterangan: 'Penerimaan Pengadaan Barang Baru BLUD'
      };
      onAddPenerimaan(newPenerimaan);

      setIsModalOpen(false);

      // Otomatis buka jendela cetak label barcode
      setTimeout(() => {
        onOpenPrintLabel(newBarang);
      }, 200);

      alert(`✅ Berhasil! Barang "${newBarang.nama}" telah otomatis terdaftar ke Master Data Barang (Kode: ${newBarang.kode}) dan saldo stok penerimaan bertambah ${formJumlahMasuk} ${newBarang.satuan}.\n\nJendela cetak stiker barcode otomatis dibuka.`);
      return;
    }

    // 2. KASUS BIASA: Barang yang Sudah Ada
    const targetBarang = listBarang.find(b => b.id === formBarangId);
    if (!targetBarang) {
      alert('Pilih barang terlebih dahulu!');
      return;
    }

    if (editingItem) {
      const updated: PenerimaanBarang = {
        ...editingItem,
        noUrut: formNoUrut,
        noFaktur: formNoFaktur,
        tanggal: formTanggal,
        sumberPengadaan: 'BLUD',
        barangId: targetBarang.id,
        namaBarang: targetBarang.nama,
        kategori: targetBarang.kategori,
        satuan: formSatuan,
        hargaSatuan: Number(formHargaSatuan),
        jumlahMasuk: Number(formJumlahMasuk),
        jumlahTotal: calculatedTotal,
        supplier: formSupplier,
        keterangan: formKeterangan
      };
      onUpdatePenerimaan(updated, editingItem.jumlahMasuk);
    } else {
      const newItem: PenerimaanBarang = {
        id: `RCV-${Date.now()}`,
        noUrut: formNoUrut,
        noFaktur: formNoFaktur,
        tanggal: formTanggal,
        sumberPengadaan: 'BLUD',
        barangId: targetBarang.id,
        namaBarang: targetBarang.nama,
        kategori: targetBarang.kategori,
        satuan: formSatuan,
        hargaSatuan: Number(formHargaSatuan),
        jumlahMasuk: Number(formJumlahMasuk),
        jumlahTotal: calculatedTotal,
        supplier: formSupplier,
        keterangan: formKeterangan
      };
      onAddPenerimaan(newItem);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: PenerimaanBarang) => {
    if (!isAdmin) {
      alert('Hanya Administrator yang memiliki wewenang membatalkan/menghapus transaksi penerimaan barang.');
      return;
    }
    if (confirm(`Hapus transaksi penerimaan ${item.noUrut} (${item.namaBarang})? Stok fisik barang akan dikurangi sebesar ${item.jumlahMasuk} ${item.satuan}.`)) {
      onDeletePenerimaan(item.id, item.jumlahMasuk, item.barangId);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-teal-600" />
            <span>Penerimaan Barang Masuk (BLUD)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">
              {filtered.length} Transaksi
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan pengadaan BHP BLUD dan penambahan saldo kartu stok otomatis.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Input Penerimaan</span>
          </button>
        )}
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sumber Pengadaan</div>
            <div className="text-xs font-black text-emerald-950">BLUD PUSKESMAS</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Volume Masuk</div>
            <div className="text-xs font-black text-slate-900">{formatAngka(totalVolumeMasuk)} Unit</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <RupiahIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nilai Total Penerimaan</div>
            <div className="text-xs font-black text-blue-700">{formatRupiah(totalNilaiMasuk)}</div>
          </div>
        </div>
      </div>

      {/* Category Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Kategori:</span>
          </span>

          <button
            onClick={() => setSelectedCategory('SEMUA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCategory === 'SEMUA'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({listPenerimaan.length})
          </button>

          {CATEGORIES.map(cat => {
            const count = listPenerimaan.filter(p => p.kategori === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan No Urut, No Faktur, Nama Barang, atau Supplier..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Penerimaan Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">No. Urut / Bukti Faktur</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4">Sumber Pengadaan</th>
                <th className="py-3 px-4">Nama Barang BHP</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Satuan</th>
                <th className="py-3 px-4 text-right">Harga Satuan</th>
                <th className="py-3 px-4 text-center">Jumlah Masuk</th>
                <th className="py-3 px-4 text-right">Jumlah Total (Rp)</th>
                <th className="py-3 px-4">Penyedia / Supplier</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    Belum ada data penerimaan barang masuk.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const targetBarang = listBarang.find(b => b.id === item.barangId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono-code">
                        <div className="font-bold text-emerald-900">{item.noUrut}</div>
                        <div className="text-[10px] text-slate-400">{item.noFaktur}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {formatTanggalIndo(item.tanggal)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {item.sumberPengadaan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">{item.namaBarang}</div>
                        {targetBarang && (
                          <div className="text-[10px] font-mono-code text-slate-400">
                            Barcode: {targetBarang.kode}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {item.satuan}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {formatRupiah(item.hargaSatuan)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-sm text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          +{item.jumlahMasuk}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        {formatRupiah(item.jumlahTotal)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-xs text-slate-800">{item.supplier || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {targetBarang && (
                            <button
                              onClick={() => onOpenPrintLabel(targetBarang)}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Cetak Barcode Label untuk Ditempel di Fisik Barang"
                            >
                              <Barcode className="w-4 h-4" />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Edit Penerimaan"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Hapus Penerimaan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <span>Menampilkan <strong>{filtered.length}</strong> transaksi penerimaan barang masuk BLUD.</span>
          <div className="flex items-center gap-4">
            <span>Total Volume: <strong className="text-teal-800 font-bold">{formatAngka(totalVolumeMasuk)} Unit</strong></span>
            <span>Total Nilai: <strong className="text-blue-700 font-bold">{formatRupiah(totalNilaiMasuk)}</strong></span>
          </div>
        </div>
      </div>

      {/* Input Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-800/20">
            
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-700/60 rounded-xl">
                  <ArrowDownLeft className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {editingItem ? 'Edit Penerimaan Barang Masuk' : 'Input Penerimaan Barang Masuk (BLUD)'}
                  </h3>
                  <p className="text-xs text-emerald-300">
                    {isNewBarangMode 
                      ? 'Sekali Input: Otomatis masuk Master Barang & Penerimaan!' 
                      : 'Mencatat pengadaan barang habis pakai dan menambah kartu stok'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* SMART SWITCH: Barang Sudah Ada VS + Barang Baru Langsung */}
              {!editingItem && (
                <div className="bg-emerald-50/90 p-3 rounded-xl border border-emerald-300 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-emerald-950 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Status Barang Masuk:</span>
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      {isNewBarangMode ? 'Otomatis membuat Master Barang + Barcode baru' : 'Menambah stok barang yang sudah terdaftar'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setIsNewBarangMode(false)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        !isNewBarangMode 
                          ? 'bg-emerald-700 text-white shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Barang Sudah Ada
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewBarangMode(true)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        isNewBarangMode 
                          ? 'bg-emerald-700 text-white shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Barang Baru (Langsung Jadi)
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* No Urut Transaksi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Urut Penerimaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNoUrut}
                    onChange={(e) => setFormNoUrut(e.target.value)}
                    placeholder="Contoh: BM-2026/09/001"
                    className="w-full px-3 py-2 text-xs font-mono-code font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* No Faktur / BAP */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Faktur / Surat Jalan (BAP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNoFaktur}
                    onChange={(e) => setFormNoFaktur(e.target.value)}
                    placeholder="Contoh: FAK-BLUD/981"
                    className="w-full px-3 py-2 text-xs font-mono-code border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Tanggal Penerimaan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Penerimaan Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                    required
                  />
                </div>

                {/* Sumber Pengadaan (BLUD Otomatis Terkunci) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sumber Pengadaan
                  </label>
                  <div className="w-full px-3 py-2 text-xs border border-emerald-400 bg-emerald-50 rounded-lg flex items-center justify-between font-black text-emerald-950">
                    <span>BLUD</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded">
                      BLUD Puskesmas
                    </span>
                  </div>
                </div>

                {/* SECTION 1: JIKA BARANG SUDAH ADA */}
                {!isNewBarangMode ? (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pilih Barang BHP Yang Sudah Ada <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formBarangId}
                        onChange={(e) => handleBarangChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                        required
                      >
                        {listBarang.map(b => (
                          <option key={b.id} value={b.id}>
                            [{b.kode}] {b.nama} (Stok Saat Ini: {b.stokSaatIni} {b.satuan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Satuan Barang
                      </label>
                      <input
                        type="text"
                        value={formSatuan}
                        onChange={(e) => setFormSatuan(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                        required
                      />
                    </div>
                  </>
                ) : (
                  /* SECTION 2: JIKA BARANG BARU (SMART 1-GATE INPUT) */
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Barang Baru <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formNewNama}
                        onChange={(e) => setFormNewNama(e.target.value)}
                        placeholder="Contoh: Kertas HVS Folio 70gr Sinar Dunia / Tinta Epson..."
                        className="w-full px-3 py-2 text-xs sm:text-sm border-2 border-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-900 bg-white"
                        required
                      />
                      <span className="text-[10px] text-emerald-700 font-medium">Barang ini akan langsung dibuatkan Barcode dan disimpan ke Data Barang otomatis.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kategori BHP <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formNewKategori}
                        onChange={(e) => setFormNewKategori(e.target.value as CategoryType)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                        required
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Satuan Barang <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formNewSatuan}
                        onChange={(e) => setFormNewSatuan(e.target.value)}
                        placeholder="Rim, Pcs, Kotak, Dus, Buah..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lokasi Rak / Lemari
                      </label>
                      <input
                        type="text"
                        value={formNewLokasiRak}
                        onChange={(e) => setFormNewLokasiRak(e.target.value)}
                        placeholder="Contoh: Lemari ATK-1, Rak B-02..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Batas Minimum Stok (Alert WA)
                      </label>
                      <input
                        type="number"
                        value={formNewStokMin}
                        onChange={(e) => setFormNewStokMin(Number(e.target.value))}
                        min={1}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-amber-800"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Harga Satuan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga Satuan Faktur (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formHargaSatuan}
                    onChange={(e) => setFormHargaSatuan(Number(e.target.value))}
                    min={0}
                    step={100}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-900"
                    required
                  />
                </div>

                {/* Jumlah Barang Masuk */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Barang Masuk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formJumlahMasuk}
                    onChange={(e) => setFormJumlahMasuk(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 text-xs border border-emerald-400 bg-emerald-50/40 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-extrabold text-teal-800 text-sm"
                    required
                  />
                </div>

                {/* Total Harga Terhitung Otomatis */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Jumlah Harga Penerimaan (Rp)
                  </label>
                  <div className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg bg-emerald-50 font-black text-emerald-950 flex items-center justify-between">
                    <span>{formatRupiah(calculatedTotal)}</span>
                    <span className="text-xs font-normal text-emerald-700">
                      ({formJumlahMasuk} x {formatRupiah(formHargaSatuan)})
                    </span>
                  </div>
                </div>

                {/* Penyedia / Supplier */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Rekanan / Penyedia / Supplier
                  </label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="Contoh: CV. Sejahtera Mandiri Jaya"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
                >
                  {isNewBarangMode 
                    ? 'Simpan Barang Baru & Penerimaan Masuk' 
                    : editingItem 
                    ? 'Simpan Perubahan' 
                    : 'Simpan Penerimaan Masuk'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
