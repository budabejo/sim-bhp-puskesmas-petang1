import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Scan, 
  Calendar, 
  AlertTriangle, 
  Building, 
  X, 
  CheckCircle2,
  Send,
  UserCheck
} from 'lucide-react';
import { RupiahIcon } from './icons/RupiahIcon';
import { Barang, CategoryType, KopPuskesmas, PengeluaranBarang, UserProfile } from '../types';
import { CATEGORIES, DAFTAR_RUANGAN } from '../data/initialData';
import { formatRupiah, formatAngka, formatTanggalIndo } from '../utils/formatters';

interface Props {
  listPengeluaran: PengeluaranBarang[];
  listBarang: Barang[];
  currentUser: UserProfile;
  kop: KopPuskesmas;
  preSelectedBarangForPengeluaran: Barang | null;
  onClearPreSelectedBarang: () => void;
  onAddPengeluaran: (item: PengeluaranBarang) => void;
  onUpdatePengeluaran: (item: PengeluaranBarang, oldQty: number) => void;
  onDeletePengeluaran: (id: string, qty: number, barangId: string) => void;
  onOpenScanModal: () => void;
  onOpenWhatsAppModal: () => void;
}

export const PengeluaranView: React.FC<Props> = ({
  listPengeluaran,
  listBarang,
  currentUser,
  kop,
  preSelectedBarangForPengeluaran,
  onClearPreSelectedBarang,
  onAddPengeluaran,
  onUpdatePengeluaran,
  onDeletePengeluaran,
  onOpenScanModal,
  onOpenWhatsAppModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalSearchText, setModalSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengeluaranBarang | null>(null);

  // Form states
  const [formNoBukti, setFormNoBukti] = useState('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formBarangId, setFormBarangId] = useState('');
  const [formKategori, setFormKategori] = useState<CategoryType>('ATK');
  const [formSatuan, setFormSatuan] = useState('Rim');
  const [formHargaSatuan, setFormHargaSatuan] = useState<number>(55000);
  const [formStokAwal, setFormStokAwal] = useState<number>(20);
  const [formJumlahKeluar, setFormJumlahKeluar] = useState<number>(1);
  const [formTujuanRuangan, setFormTujuanRuangan] = useState('Poli Umum');
  const [formPenerima, setFormPenerima] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('Pelayanan');

  const isAdmin = currentUser.role === 'admin';
  const isPetugas = currentUser.role === 'petugas';
  const canEdit = isAdmin || isPetugas;

  // Auto-open modal if item came from Barcode Scanner
  useEffect(() => {
    if (preSelectedBarangForPengeluaran) {
      handleOpenAdd(preSelectedBarangForPengeluaran);
      onClearPreSelectedBarang();
    }
  }, [preSelectedBarangForPengeluaran]);

  // Filtered list
  const filtered = listPengeluaran.filter(q => {
    const matchCat = selectedCategory === 'SEMUA' || q.kategori === selectedCategory;
    const matchSearch = q.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        q.noBukti.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        q.tujuanRuangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (q.penerima || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalNilaiKeluar = filtered.reduce((acc, curr) => acc + curr.totalHarga, 0);
  const totalVolumeKeluar = filtered.reduce((acc, curr) => acc + curr.jumlahKeluar, 0);

  const handleOpenAdd = (preferredBarang?: Barang) => {
    setEditingItem(null);
    const dateCode = new Date().toISOString().slice(2, 7).replace('-', '');
    const randNum = Math.floor(100 + Math.random() * 900);
    setFormNoBukti(`BK-${dateCode}/${randNum}`);
    setFormTanggal(new Date().toISOString().split('T')[0]);

    const target = preferredBarang || listBarang[0];
    if (target) {
      setFormBarangId(target.id);
      setFormKategori(target.kategori);
      setFormSatuan(target.satuan);
      setFormHargaSatuan(target.hargaSatuan);
      setFormStokAwal(target.stokSaatIni);
    }
    setFormJumlahKeluar(1);
    setFormTujuanRuangan(DAFTAR_RUANGAN[0]);
    setFormPenerima('');
    setFormKeterangan('Kebutuhan operasional harian pelayanan');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: PengeluaranBarang) => {
    setEditingItem(q);
    setFormNoBukti(q.noBukti);
    setFormTanggal(q.tanggal);
    setFormBarangId(q.barangId);
    setFormKategori(q.kategori);
    setFormSatuan(q.satuan);
    setFormHargaSatuan(q.hargaSatuan);
    setFormStokAwal(q.stokAwal);
    setFormJumlahKeluar(q.jumlahKeluar);
    setFormTujuanRuangan(q.tujuanRuangan);
    setFormPenerima(q.penerima || '');
    setFormKeterangan(q.keterangan || '');
    setIsModalOpen(true);
  };

  const handleBarangChange = (barangId: string) => {
    setFormBarangId(barangId);
    const found = listBarang.find(b => b.id === barangId);
    if (found) {
      setFormKategori(found.kategori);
      setFormSatuan(found.satuan);
      setFormHargaSatuan(found.hargaSatuan);
      setFormStokAwal(found.stokSaatIni);
    }
  };

  const calculatedSisaStok = formStokAwal - formJumlahKeluar;
  const calculatedTotalHarga = formJumlahKeluar * formHargaSatuan;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBarang = listBarang.find(b => b.id === formBarangId);
    if (!targetBarang) {
      alert('Pilih barang terlebih dahulu!');
      return;
    }

    if (formJumlahKeluar <= 0) {
      alert('Jumlah barang keluar harus lebih besar dari 0!');
      return;
    }

    // Validation: cannot exceed available stock
    if (!editingItem && formJumlahKeluar > targetBarang.stokSaatIni) {
      alert(`Stok tidak mencukupi! Stok fisik tersedia hanya ${targetBarang.stokSaatIni} ${targetBarang.satuan}, sedangkan permintaan keluar ${formJumlahKeluar} ${targetBarang.satuan}.`);
      return;
    }

    if (editingItem) {
      const updated: PengeluaranBarang = {
        ...editingItem,
        noBukti: formNoBukti,
        tanggal: formTanggal,
        barangId: targetBarang.id,
        namaBarang: targetBarang.nama,
        kategori: targetBarang.kategori,
        satuan: formSatuan,
        hargaSatuan: Number(formHargaSatuan),
        stokAwal: formStokAwal,
        jumlahKeluar: Number(formJumlahKeluar),
        sisaStok: calculatedSisaStok,
        totalHarga: calculatedTotalHarga,
        tujuanRuangan: formTujuanRuangan,
        penerima: formPenerima,
        keterangan: formKeterangan
      };
      onUpdatePengeluaran(updated, editingItem.jumlahKeluar);
    } else {
      const newItem: PengeluaranBarang = {
        id: `OUT-${Date.now()}`,
        noBukti: formNoBukti,
        tanggal: formTanggal,
        barangId: targetBarang.id,
        namaBarang: targetBarang.nama,
        kategori: targetBarang.kategori,
        satuan: formSatuan,
        hargaSatuan: Number(formHargaSatuan),
        stokAwal: formStokAwal,
        jumlahKeluar: Number(formJumlahKeluar),
        sisaStok: calculatedSisaStok,
        totalHarga: calculatedTotalHarga,
        tujuanRuangan: formTujuanRuangan,
        penerima: formPenerima,
        keterangan: formKeterangan
      };
      onAddPengeluaran(newItem);
    }

    setIsModalOpen(false);

    // Otomatis kirim notifikasi WhatsApp jika sisa stok <= 5 buah
    if (calculatedSisaStok <= (targetBarang.stokMinimum || 5)) {
      const cleanPhone = (kop?.nomorWhatsAppNotif || '6281234567890').replace(/\D/g, '');
      const pesanWA = encodeURIComponent(
`🚨 *PERINGATAN STOK MINIMUM OTOMATIS (BHP BLUD)* 🚨
*${kop?.namaPuskesmas || 'UPTD PUSKESMAS BLUD'}*

Pemberitahuan Otomatis Sistem Persediaan:
Baru saja diinput transaksi pengeluaran barang:
📦 *Nama Barang:* ${targetBarang.nama}
🏷️ *Kode / Barcode:* ${targetBarang.kode}
📂 *Kategori:* ${targetBarang.kategori}
📉 *Jumlah Dikeluarkan:* ${formJumlahKeluar} ${formSatuan} ke ${formTujuanRuangan} (Penerima: ${formPenerima || '-'})
⚠️ *SISA STOK TERSISA:* *${calculatedSisaStok} ${formSatuan}* (Batas Minimum: ${targetBarang.stokMinimum || 5} ${formSatuan})

Harap segera ditindaklanjuti proses pengadaan barang BLUD Puskesmas. Terima kasih.
_Sistem Informasi Manajemen BHP BLUD_`
      );
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${pesanWA}`;
      
      // Buka otomatis WhatsApp
      window.open(waUrl, '_blank');

      alert(`🚨 PERINGATAN OTOMATIS: Stok barang "${targetBarang.nama}" kini tersisa ${calculatedSisaStok} ${targetBarang.satuan} (≤ 5).\n\nSistem telah OTOMATIS membuka WhatsApp dan menyiapkan pesan peringatan resmi untuk Pejabat Pengadaan / KTU (+${cleanPhone})!`);
    }
  };

  const handleDelete = (item: PengeluaranBarang) => {
    if (!isAdmin) {
      alert('Hanya Administrator yang memiliki wewenang membatalkan/menghapus transaksi pengeluaran barang.');
      return;
    }
    if (confirm(`Batalkan pengeluaran ${item.noBukti} (${item.namaBarang})? Stok barang akan dikembalikan sebanyak ${item.jumlahKeluar} ${item.satuan}.`)) {
      onDeletePengeluaran(item.id, item.jumlahKeluar, item.barangId);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-amber-600" />
            <span>Pengeluaran Barang BHP</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
              {filtered.length} Transaksi
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribusi BHP ke poli dan unit pelayanan dengan pengurangan sisa stok otomatis.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenScanModal}
              className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
            >
              <Scan className="w-4 h-4 text-emerald-700" />
              <span>Scan Barcode</span>
            </button>
            <button
              onClick={() => handleOpenAdd()}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Input Pengeluaran</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Volume Keluar</div>
            <div className="text-xs font-black text-amber-950">{formatAngka(totalVolumeKeluar)} Unit</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <RupiahIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Nilai Pemakaian</div>
            <div className="text-xs font-black text-blue-700">{formatRupiah(totalNilaiKeluar)}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Unit Distribusi</div>
            <div className="text-xs font-black text-slate-800">{DAFTAR_RUANGAN.length} Ruangan Poli</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
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
            Semua ({listPengeluaran.length})
          </button>

          {CATEGORIES.map(cat => {
            const count = listPengeluaran.filter(q => q.kategori === cat).length;
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
            placeholder="Cari berdasarkan No Bukti, Nama Barang, Ruangan Poli, atau Penerima..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">No. Bukti Keluar</th>
                <th className="py-3 px-4">Tanggal Keluar</th>
                <th className="py-3 px-4">Nama Barang BHP</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Stok Awal</th>
                <th className="py-3 px-4 text-center">Jumlah Keluar</th>
                <th className="py-3 px-4 text-center">Sisa Stok</th>
                <th className="py-3 px-4 text-right">Nilai Total</th>
                <th className="py-3 px-4">Tujuan Ruangan / Penerima</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Belum ada data transaksi pengeluaran barang.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const isKritis = item.sisaStok <= 5;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono-code font-bold text-slate-800">
                        {item.noBukti}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {formatTanggalIndo(item.tanggal)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">{item.namaBarang}</div>
                        <div className="text-[10px] text-slate-400">Satuan: {item.satuan}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600">
                        {item.stokAwal}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-sm text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          -{item.jumlahKeluar}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-extrabold text-xs px-2 py-0.5 rounded-full ${
                          isKritis 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.sisaStok}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        {formatRupiah(item.totalHarga)}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-bold text-xs text-emerald-950 flex items-center gap-1">
                          <Building className="w-3 h-3 text-emerald-700" />
                          <span>{item.tujuanRuangan}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Penerima: {item.penerima || '-'}
                        </div>
                        {item.keterangan && (
                          <div className="text-[10px] text-slate-400 italic line-clamp-1">
                            {item.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Edit Pengeluaran"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Batalkan Pengeluaran"
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
          <span>Menampilkan <strong>{filtered.length}</strong> transaksi pengeluaran barang.</span>
          <div className="flex items-center gap-4">
            <span>Total Volume: <strong className="text-amber-800 font-bold">{formatAngka(totalVolumeKeluar)} Unit</strong></span>
            <span>Total Nilai: <strong className="text-blue-700 font-bold">{formatRupiah(totalNilaiKeluar)}</strong></span>
          </div>
        </div>
      </div>

      {/* Input / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-800/20">
            
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 border border-amber-400/40 rounded-xl">
                  <ArrowUpRight className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {editingItem ? 'Edit Transaksi Pengeluaran Barang' : 'Input Pengeluaran Barang BHP'}
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Distribusi barang ke poli & ruangan pelayanan Puskesmas
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* No Bukti */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Bukti Pengeluaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNoBukti}
                    onChange={(e) => setFormNoBukti(e.target.value)}
                    placeholder="Contoh: BK-2026/09/001"
                    className="w-full px-3 py-2 text-xs font-mono-code font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Tanggal Keluar */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Keluar Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                    required
                  />
                </div>

                {/* Pilih Barang (Ketik Manual / Filter & Dropdown) */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Pilih Barang BHP Yang Keluar <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        onOpenScanModal();
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>Scan Barcode Kamera HP</span>
                    </button>
                  </div>

                  {/* Input Ketik Manual untuk Filter Nama / Kode */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={modalSearchText}
                      onChange={(e) => setModalSearchText(e.target.value)}
                      placeholder="Ketik manual nama barang atau kode barcode..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <select
                    value={formBarangId}
                    onChange={(e) => handleBarangChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800 bg-white"
                    required
                  >
                    {listBarang
                      .filter(b => 
                        b.nama.toLowerCase().includes(modalSearchText.toLowerCase()) || 
                        b.kode.toLowerCase().includes(modalSearchText.toLowerCase())
                      )
                      .map(b => (
                        <option key={b.id} value={b.id}>
                          [{b.kode}] {b.nama} — Sisa Stok: {b.stokSaatIni} {b.satuan}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Stok Awal (Read only indicator) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stok Awal Tersedia
                  </label>
                  <div className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 font-bold text-slate-800">
                    {formStokAwal} {formSatuan}
                  </div>
                </div>

                {/* Jumlah Keluar */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Barang Keluar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formJumlahKeluar}
                    onChange={(e) => setFormJumlahKeluar(Number(e.target.value))}
                    min={1}
                    max={formStokAwal}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-extrabold text-amber-800 text-sm"
                    required
                  />
                </div>

                {/* Sisa Stok Kalkulasi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sisa Stok Setelah Transaksi
                  </label>
                  <div className={`w-full px-3 py-2 text-xs border rounded-lg font-extrabold flex items-center justify-between ${
                    calculatedSisaStok <= 5 
                      ? 'bg-amber-50 border-amber-300 text-amber-900' 
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}>
                    <span>{calculatedSisaStok} {formSatuan}</span>
                    {calculatedSisaStok <= 5 && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                        Stok Minimum! (WA Otomatis)
                      </span>
                    )}
                  </div>
                </div>

                {/* Total Nilai Keluar */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Nilai Transaksi (Rp)
                  </label>
                  <div className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-800">
                    {formatRupiah(calculatedTotalHarga)}
                  </div>
                </div>

                {/* Tujuan Ruangan */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Keterangan Barang Dikeluarkan Kemana (Poli / Ruangan) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formTujuanRuangan}
                    onChange={(e) => setFormTujuanRuangan(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-950"
                    required
                  >
                    {DAFTAR_RUANGAN.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Penerima / Penanggung Jawab Ruangan */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Penerima / Penanggung Jawab Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPenerima}
                    onChange={(e) => setFormPenerima(e.target.value)}
                    placeholder="Contoh: dr. Ningsih / Ns. Hendra / Andi Saputra..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
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
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Pengeluaran Barang'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
