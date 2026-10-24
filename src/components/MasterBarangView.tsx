import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Printer, 
  Boxes, 
  Check, 
  AlertTriangle, 
  X, 
  Scan, 
  Sparkles, 
  ArrowUpDown,
  ArrowRight,
  Info
} from 'lucide-react';
import { Barang, CategoryType, UserProfile } from '../types';
import { CATEGORIES, SUMBER_DANA_OPTIONS } from '../data/initialData';
import { formatRupiah, formatAngka } from '../utils/formatters';
import { generateBarcodeSVG } from '../utils/barcode';

interface Props {
  listBarang: Barang[];
  currentUser: UserProfile;
  onNavigateToPenerimaan?: () => void;
  onAddBarang: (barang: Barang) => void;
  onUpdateBarang: (barang: Barang) => void;
  onDeleteBarang: (id: string) => void;
  onOpenPrintLabel: (barang: Barang) => void;
}

export const MasterBarangView: React.FC<Props> = ({
  listBarang,
  currentUser,
  onNavigateToPenerimaan,
  onAddBarang,
  onUpdateBarang,
  onDeleteBarang,
  onOpenPrintLabel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Barang | null>(null);

  // Form states
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState<CategoryType>('ATK');
  const [formSumberDana, setFormSumberDana] = useState('BLUD');
  const [formSatuan, setFormSatuan] = useState('Pcs');
  const [formHarga, setFormHarga] = useState<number>(10000);
  const [formStokAwal, setFormStokAwal] = useState<number>(10);
  const [formStokMinimum, setFormStokMinimum] = useState<number>(5);
  const [formLokasiRak, setFormLokasiRak] = useState('');
  const [formSpesifikasi, setFormSpesifikasi] = useState('');

  const isAdmin = currentUser.role === 'admin';
  const isPetugas = currentUser.role === 'petugas';
  const canEdit = isAdmin || isPetugas;

  // Filtered barang
  const filtered = listBarang.filter(b => {
    const matchCat = selectedCategory === 'SEMUA' || b.kategori === selectedCategory;
    const matchSearch = b.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (b.sumberDana || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (b.lokasiRak || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormKode(`BHP-${formKategori.substring(0, 3).toUpperCase()}-${randomSuffix}`);
    setFormNama('');
    setFormKategori('ATK');
    setFormSumberDana('BLUD');
    setFormSatuan('Pcs');
    setFormHarga(15000);
    setFormStokAwal(10);
    setFormStokMinimum(5);
    setFormLokasiRak('Lemari ATK-1');
    setFormSpesifikasi('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Barang) => {
    setEditingItem(b);
    setFormKode(b.kode);
    setFormNama(b.nama);
    setFormKategori(b.kategori);
    setFormSumberDana(b.sumberDana || 'BLUD');
    setFormSatuan(b.satuan);
    setFormHarga(b.hargaSatuan);
    setFormStokAwal(b.stokAwalMaster);
    setFormStokMinimum(b.stokMinimum || 5);
    setFormLokasiRak(b.lokasiRak || '');
    setFormSpesifikasi(b.spesifikasi || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formKode.trim()) {
      alert('Nama barang dan Kode/Barcode wajib diisi!');
      return;
    }

    if (editingItem) {
      // Update
      const updated: Barang = {
        ...editingItem,
        kode: formKode.trim().toUpperCase(),
        nama: formNama.trim(),
        kategori: formKategori,
        sumberDana: 'BLUD',
        satuan: formSatuan.trim(),
        hargaSatuan: Number(formHarga),
        stokAwalMaster: Number(formStokAwal),
        stokMinimum: Number(formStokMinimum) || 5,
        lokasiRak: formLokasiRak.trim(),
        spesifikasi: ''
      };
      onUpdateBarang(updated);
      setIsModalOpen(false);
    } else {
      // Create new
      const newItem: Barang = {
        id: `BRG-${Date.now()}`,
        kode: formKode.trim().toUpperCase(),
        nama: formNama.trim(),
        kategori: formKategori,
        sumberDana: 'BLUD',
        satuan: formSatuan.trim(),
        hargaSatuan: Number(formHarga),
        stokAwalMaster: Number(formStokAwal),
        stokSaatIni: Number(formStokAwal),
        stokMinimum: Number(formStokMinimum) || 5,
        lokasiRak: formLokasiRak.trim(),
        spesifikasi: '',
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddBarang(newItem);
      setIsModalOpen(false);

      // Automatically offer to print barcode immediately
      setTimeout(() => {
        onOpenPrintLabel(newItem);
      }, 200);
    }
  };

  const handleDelete = (id: string, nama: string) => {
    if (!isAdmin) {
      alert('Hanya Administrator yang memiliki wewenang menghapus data master barang.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus barang "${nama}"? Semua riwayat kartu stok terkait barang ini akan disesuaikan.`)) {
      onDeleteBarang(id);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      
      {/* Header section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-700" />
            <span>Master Data Barang BHP</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {listBarang.length} Item
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Katalog barang persediaan BLUD, barcode terintegrasi & monitoring stok minimum.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {onNavigateToPenerimaan && (
              <button
                onClick={onNavigateToPenerimaan}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                title="Input pengadaan barang baru langsung lewat faktur penerimaan (1 langkah jadi semua)"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>+ Input Pengadaan Baru</span>
              </button>
            )}
            <button
              onClick={handleOpenAdd}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-all"
              title="Daftarkan master barang saja tanpa transaksi faktur masuk"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Master Saja</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </span>

          <button
            onClick={() => setSelectedCategory('SEMUA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCategory === 'SEMUA'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Kategori ({listBarang.length})
          </button>

          {CATEGORIES.map(cat => {
            const count = listBarang.filter(b => b.kategori === cat).length;
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

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama barang, kode barcode, atau lokasi rak..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table of items */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Kode / Barcode</th>
                <th className="py-3 px-4">Nama Barang & Spesifikasi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-3 text-center">Sumber Dana</th>
                <th className="py-3 px-4 text-center">Satuan</th>
                <th className="py-3 px-4 text-right">Harga Standar</th>
                <th className="py-3 px-4 text-center">Stok Fisik</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Lokasi Rak</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data barang yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const isHabis = item.stokSaatIni <= 0;
                  const isKritis = item.stokSaatIni <= (item.stokMinimum || 5);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono-code font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                          <span>{item.kode}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono-code">ID: {item.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.nama}</div>
                        {item.spesifikasi && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {item.spesifikasi}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {item.sumberDana || 'BLUD'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {item.satuan}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        {formatRupiah(item.hargaSatuan)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-sm text-slate-900">
                          {item.stokSaatIni}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Min: {item.stokMinimum || 5}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isHabis ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            HABIS
                          </span>
                        ) : isKritis ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            KRITIS (≤5)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            AMAN
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {item.lokasiRak || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenPrintLabel(item)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Cetak Ulang Stiker Barcode (Re-Print)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Edit Data Barang"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(item.id, item.nama)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Hapus Barang"
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

        {/* Table footer count */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan <strong>{filtered.length}</strong> dari total <strong>{listBarang.length}</strong> barang BHP</span>
          <span className="font-semibold text-emerald-800">Standar Pengadaan BLUD Puskesmas</span>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-800/20">
            
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-700/60 rounded-xl">
                  <Boxes className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {editingItem ? 'Edit Data Master Barang' : 'Tambah Master Barang BHP Baru'}
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Sistem Persediaan Barang Habis Pakai Puskesmas BLUD
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

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Rekomendasi Bebas Double Input */}
              {!editingItem && (
                <div className="bg-emerald-50/90 border border-emerald-300 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-emerald-950">💡 Tips Efisiensi (Bebas Double Input):</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Jika barang baru ini masuk bersamaan dengan faktur pengadaan BLUD, disarankan menginput langsung lewat menu <strong>Penerimaan Barang</strong>. Sekali input, otomatis tersimpan ke Master Barang, Faktur Penerimaan, Kartu Stok, dan stiker Barcode langsung dicetak!
                    </p>
                    {onNavigateToPenerimaan && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          onNavigateToPenerimaan();
                        }}
                        className="mt-2 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-xs"
                      >
                        <span>Buka Menu Penerimaan Barang Masuk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Kode Barcode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Barang / Barcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value.toUpperCase())}
                    placeholder="Contoh: BHP-ATK-001"
                    className="w-full px-3 py-2 text-xs font-mono-code font-bold uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Kode ini menjadi teks barcode yang dicetak.</span>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori BHP <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => {
                      const newCat = e.target.value as CategoryType;
                      setFormKategori(newCat);
                      if (!editingItem) {
                        const randomSuffix = Math.floor(100 + Math.random() * 900);
                        setFormKode(`BHP-${newCat.substring(0, 3).toUpperCase()}-${randomSuffix}`);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Sumber Dana BLUD (Otomatis Terkunci BLUD) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sumber Dana Pengadaan
                  </label>
                  <div className="w-full px-3 py-2 text-xs border border-emerald-400 bg-emerald-50 rounded-lg flex items-center justify-between font-black text-emerald-950">
                    <span>BLUD</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded">
                      BLUD Puskesmas
                    </span>
                  </div>
                </div>

                {/* Nama Barang */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Barang Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Kertas HVS A4 70gr Sinar Dunia"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                    required
                  />
                </div>

                {/* Satuan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Satuan Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formSatuan}
                    onChange={(e) => setFormSatuan(e.target.value)}
                    placeholder="Rim, Pcs, Kotak, Dus, Buah..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Harga Satuan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga Satuan Standar (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formHarga}
                    onChange={(e) => setFormHarga(Number(e.target.value))}
                    min={0}
                    step={500}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                    required
                  />
                </div>

                {/* Stok Awal Master */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stok Awal Baseline (Awal Periode)
                  </label>
                  <input
                    type="number"
                    value={formStokAwal}
                    onChange={(e) => setFormStokAwal(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Stok Minimum Trigger Notif WA */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batas Stok Minimum (Trigger Notif WA)
                  </label>
                  <input
                    type="number"
                    value={formStokMinimum}
                    onChange={(e) => setFormStokMinimum(Number(e.target.value))}
                    min={1}
                    max={50}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-amber-800"
                    required
                  />
                  <span className="text-[10px] text-amber-700">Default 5 buah (otomatis kirim WA)</span>
                </div>

                {/* Lokasi Rak / Lemari */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lokasi Rak / Lemari Penyimpanan
                  </label>
                  <input
                    type="text"
                    value={formLokasiRak}
                    onChange={(e) => setFormLokasiRak(e.target.value)}
                    placeholder="Contoh: Lemari ATK-1, Rak Sanitasi A-02..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

              </div>

              {/* Barcode preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">Preview Barcode Otomatis:</span>
                <div 
                  className="w-48 mx-auto"
                  dangerouslySetInnerHTML={{ __html: generateBarcodeSVG(formKode || 'BHP-001', 220, 55) }}
                />
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
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan Barang'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
