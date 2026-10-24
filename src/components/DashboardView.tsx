import React, { useState } from 'react';
import { 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  Scan, 
  CreditCard,
  TrendingUp, 
  Calendar, 
  Activity,
  Layers,
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  Flame,
  PieChart,
  BarChart3
} from 'lucide-react';
import { RupiahIcon } from './icons/RupiahIcon';
import { Barang, CategoryType, PenerimaanBarang, PengeluaranBarang, UserProfile } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatRupiah, formatAngka, formatTanggalIndo } from '../utils/formatters';

interface Props {
  listBarang: Barang[];
  listPenerimaan: PenerimaanBarang[];
  listPengeluaran: PengeluaranBarang[];
  currentUser: UserProfile;
  onNavigate: (view: string) => void;
  onOpenScanModal: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenPrintLabel: (b: Barang) => void;
}

export const DashboardView: React.FC<Props> = ({
  listBarang,
  listPenerimaan,
  listPengeluaran,
  currentUser,
  onNavigate,
  onOpenScanModal,
  onOpenWhatsAppModal,
  onOpenPrintLabel
}) => {
  const [activeChartTimeframe, setActiveChartTimeframe] = useState<'mingguan' | 'bulanan'>('bulanan');

  const totalItems = listBarang.length;
  const totalNilaiPersediaan = listBarang.reduce(
    (acc, curr) => acc + (curr.stokSaatIni * curr.hargaSatuan), 
    0
  );

  const totalMasukJml = listPenerimaan.reduce((acc, curr) => acc + curr.jumlahMasuk, 0);
  const totalMasukRp = listPenerimaan.reduce((acc, curr) => acc + curr.jumlahTotal, 0);

  const totalKeluarJml = listPengeluaran.reduce((acc, curr) => acc + curr.jumlahKeluar, 0);
  const totalKeluarRp = listPengeluaran.reduce((acc, curr) => acc + curr.totalHarga, 0);

  const criticalItems = listBarang.filter(b => b.stokSaatIni <= (b.stokMinimum || 5));
  const safeItemsCount = totalItems - criticalItems.length;
  const healthPercentage = totalItems > 0 ? Math.round((safeItemsCount / totalItems) * 100) : 100;

  // Category stats
  const categoryStats = CATEGORIES.map(cat => {
    const items = listBarang.filter(b => b.kategori === cat);
    const count = items.length;
    const totalQty = items.reduce((acc, curr) => acc + curr.stokSaatIni, 0);
    const totalVal = items.reduce((acc, curr) => acc + (curr.stokSaatIni * curr.hargaSatuan), 0);
    const percentage = totalNilaiPersediaan > 0 ? Math.round((totalVal / totalNilaiPersediaan) * 100) : 0;
    return { category: cat, count, totalQty, totalVal, percentage };
  });

  // Distribution to Rooms
  const roomDistributionMap: Record<string, number> = {};
  listPengeluaran.forEach(p => {
    const room = p.tujuanRuangan || 'Poli Lainnya';
    roomDistributionMap[room] = (roomDistributionMap[room] || 0) + p.jumlahKeluar;
  });

  const sortedRooms = Object.entries(roomDistributionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxRoomQty = sortedRooms.length > 0 ? sortedRooms[0][1] : 1;

  // Recent activity stream (last 5 transactions combined)
  const recentActivities = [
    ...listPenerimaan.map(p => ({
      id: p.id,
      type: 'MASUK' as const,
      title: `Penerimaan ${p.namaBarang}`,
      subtitle: `${p.jumlahMasuk} ${p.satuan} • Faktur ${p.noFaktur}`,
      date: p.tanggal,
      amount: p.jumlahTotal,
      badge: 'Barang Masuk',
      color: 'emerald'
    })),
    ...listPengeluaran.map(k => ({
      id: k.id,
      type: 'KELUAR' as const,
      title: `Distribusi ${k.namaBarang}`,
      subtitle: `${k.jumlahKeluar} ${k.satuan} ke ${k.tujuanRuangan}`,
      date: k.tanggal,
      amount: k.totalHarga,
      badge: k.tujuanRuangan,
      color: 'amber'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* 1. TOP 5 METRIC KPI CARDS WITH 3D VIBRANT FLOATING ICON BADGES (GLANCE DASHBOARD STYLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Nilai Persediaan (Purple 3D) */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Nilai Persediaan
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5 truncate">
              {formatRupiah(totalNilaiPersediaan)}
            </div>
            <div className="text-[10px] text-purple-700 font-bold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
              <span>Aset BHP Aktif</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform shrink-0">
            <RupiahIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Item Terdaftar (Rose 3D) */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Katalog Master
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              {totalItems} <span className="text-xs font-semibold text-slate-500">Item</span>
            </div>
            <div className="text-[10px] text-rose-700 font-bold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              <span>Barcode Terdaftar</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-110 transition-transform shrink-0">
            <Boxes className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 3: Total Pengadaan Masuk (Cyan 3D) */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Penerimaan Masuk
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5 truncate">
              {formatAngka(totalMasukJml)} <span className="text-xs font-semibold text-slate-500">Unit</span>
            </div>
            <div className="text-[10px] text-teal-700 font-bold mt-1 truncate">
              {listPenerimaan.length} Faktur BAP
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 group-hover:scale-110 transition-transform shrink-0">
            <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 4: Total Pengeluaran Keluar (Orange 3D) */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Distribusi Keluar
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5 truncate">
              {formatAngka(totalKeluarJml)} <span className="text-xs font-semibold text-slate-500">Unit</span>
            </div>
            <div className="text-[10px] text-amber-700 font-bold mt-1 truncate">
              {listPengeluaran.length} Transaksi Poli
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-600/30 group-hover:scale-110 transition-transform shrink-0">
            <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 5: Kesiapan Persediaan (Emerald 3D) */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Kesiapan Stok
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-900 tracking-tight mt-0.5">
              {healthPercentage}%
            </div>
            <div className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>{safeItemsCount} dari {totalItems} Aman</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

      </div>

      {/* 2. MIDDLE ROW: MODERN DIGITAL CHART + RADIAL GAUGES (GLANCE DASHBOARD INSPIRATION) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left (2 Cols): Grafik Tren Mutasi Pengadaan vs Pengeluaran BHP */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Tren Mutasi Persediaan BHP</span>
                </h3>
                <p className="text-xs text-slate-500">Perbandingan volume barang masuk pengadaan vs distribusi keluar</p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                <button
                  onClick={() => setActiveChartTimeframe('bulanan')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeChartTimeframe === 'bulanan' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setActiveChartTimeframe('mingguan')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeChartTimeframe === 'mingguan' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  Mingguan
                </button>
              </div>
            </div>

            {/* Visual Modern Digital SVG Multi-Line Chart */}
            <div className="h-56 w-full relative pt-2">
              <svg viewBox="0 0 650 200" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="30" y1="20" x2="630" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="30" y1="65" x2="630" y2="65" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="30" y1="110" x2="630" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="30" y1="155" x2="630" y2="155" stroke="#f1f5f9" strokeDasharray="3 3" />

                {/* Area Fills */}
                <path 
                  d="M 50 155 Q 150 70, 240 100 T 430 40 T 610 85 L 610 160 L 50 160 Z" 
                  fill="url(#cyanGrad)" 
                />
                <path 
                  d="M 50 155 Q 140 115, 240 130 T 430 75 T 610 120 L 610 160 L 50 160 Z" 
                  fill="url(#amberGrad)" 
                />

                {/* Line 1: Barang Masuk (Cyan/Teal) */}
                <path 
                  d="M 50 155 Q 150 70, 240 100 T 430 40 T 610 85" 
                  fill="none" 
                  stroke="#0d9488" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />

                {/* Line 2: Barang Keluar (Amber/Orange) */}
                <path 
                  d="M 50 155 Q 140 115, 240 130 T 430 75 T 610 120" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />

                {/* Interactive Dot Points */}
                <circle cx="50" cy="155" r="4.5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                <circle cx="150" cy="70" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="240" cy="100" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="430" cy="40" r="5.5" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="610" cy="85" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" />

                <circle cx="140" cy="115" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <circle cx="240" cy="130" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <circle cx="430" cy="75" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="610" cy="120" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />

                {/* X Axis Labels */}
                <text x="50" y="185" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Jan</text>
                <text x="190" y="185" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Feb</text>
                <text x="330" y="185" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Mar</text>
                <text x="470" y="185" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Apr</text>
                <text x="610" y="185" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Mei</text>
              </svg>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-bold text-teal-800">
                <span className="w-3 h-3 rounded-full bg-teal-600"></span>
                <span>Barang Masuk: {formatAngka(totalMasukJml)} Unit</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-amber-700">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Barang Keluar: {formatAngka(totalKeluarJml)} Unit</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
              Data Sinkronisasi Kartu Stok Real-Time
            </span>
          </div>
        </div>

        {/* Right (1 Col): 3 Circular Radial Gauges (Glance Dashboard Style) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>Efisiensi & Indikator Logistik</span>
            </h3>
            <p className="text-xs text-slate-500">Tingkat capaian operasional pengelolaan BHP</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-around">
            
            {/* Gauge 1: Ketersediaan Stok */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-800">Ketersediaan Stok Aman</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{safeItemsCount} dari {totalItems} item aman</div>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-600 transition-all duration-1000" strokeDasharray={`${healthPercentage}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-[10px] font-black text-emerald-900">{healthPercentage}%</span>
              </div>
            </div>

            {/* Gauge 2: Ketepatan Distribusi Poli */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-800">Ketepatan Distribusi Poli</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Pemenuhan permintaan ruangan</div>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-purple-600 transition-all duration-1000" strokeDasharray="92, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-[10px] font-black text-purple-900">92%</span>
              </div>
            </div>

            {/* Gauge 3: Akurasi Mutasi Kartu Stok */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-800">Validitas Kartu Stok Fisik</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Sinkronisasi saldo awal s/d akhir</div>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-amber-500 transition-all duration-1000" strokeDasharray="98, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-[10px] font-black text-amber-900">98%</span>
              </div>
            </div>

          </div>

          <div className="pt-2 text-center text-[11px] font-bold text-emerald-800 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
            ✓ Seluruh Laporan Sesuai Standar Kemendagri & Dinkes
          </div>
        </div>

      </div>

      {/* 3. THIRD ROW: BAR CHART KATEGORI & DISTRIBUSI RUANGAN TERBANYAK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left: Nilai & Komposisi per Kategori */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                <span>Proporsi Nilai per Kategori BHP</span>
              </h3>
              <p className="text-xs text-slate-500">Distribusi alokasi persediaan barang habis pakai</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              5 Kategori
            </span>
          </div>

          <div className="space-y-3.5">
            {categoryStats.map(stat => (
              <div key={stat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{stat.category} ({stat.count} item)</span>
                  <span className="text-slate-900">{formatRupiah(stat.totalVal)} <span className="text-slate-400 font-normal">({stat.percentage}%)</span></span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500"
                    style={{ width: `${Math.max(stat.percentage, 4)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Distribusi Pengeluaran ke Ruangan / Poli Terbanyak */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Ruangan / Poli Penerima Terbanyak</span>
              </h3>
              <p className="text-xs text-slate-500">Alokasi distribusi pemakaian BHP tertinggi</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
              Top 5 Unit
            </span>
          </div>

          <div className="space-y-3.5">
            {sortedRooms.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada transaksi distribusi pengeluaran.
              </div>
            ) : (
              sortedRooms.map(([room, qty], idx) => {
                const percent = Math.round((qty / maxRoomQty) * 100);
                return (
                  <div key={room} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-black">
                          {idx + 1}
                        </span>
                        <span>{room}</span>
                      </span>
                      <span className="text-slate-900 font-extrabold">{formatAngka(qty)} Unit</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 4. FOURTH ROW: QUICK ACTION LAUNCHPAD & RECENT ACTIVITY STREAM (NO CROWDED TABLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left (1 Col): Quick Action Launchpad Tiles */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Akses Cepat Logistik</span>
            </h3>
            <p className="text-xs text-slate-500">Shortcut operasional harian petugas persediaan</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onNavigate('penerimaan')}
              className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-left hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-md mb-2">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-emerald-950">Input Masuk</div>
              <div className="text-[10px] text-emerald-700">Faktur Baru</div>
            </button>

            <button
              onClick={() => onNavigate('pengeluaran')}
              className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-left hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-md mb-2">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-amber-950">Input Keluar</div>
              <div className="text-[10px] text-amber-700">Distribusi Poli</div>
            </button>

            <button
              onClick={() => onNavigate('barang')}
              className="p-3 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 text-left hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-md mb-2">
                <Boxes className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-teal-950">Katalog Barang</div>
              <div className="text-[10px] text-teal-700">Master Data</div>
            </button>

            <button
              onClick={() => onNavigate('kartustok')}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 text-left hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-md mb-2">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-purple-950">Kartu Stok</div>
              <div className="text-[10px] text-purple-700">Mutasi Real-time</div>
            </button>
          </div>
        </div>

        {/* Right (2 Cols): Live Digital Activity Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Aktivitas Mutasi Terkini</span>
              </h3>
              <p className="text-xs text-slate-500">Aliran logistik masuk dan distribusi keluar terbaru</p>
            </div>
            <button
              onClick={() => onNavigate('kartustok')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
            >
              <span>Lihat Seluruh Kartu Stok</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada aktivitas mutasi yang tercatat.
              </div>
            ) : (
              recentActivities.map(act => (
                <div 
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                      act.type === 'MASUK' ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}>
                      {act.type === 'MASUK' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{act.title}</div>
                      <div className="text-[11px] text-slate-500">{act.subtitle}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-slate-900">{formatRupiah(act.amount)}</div>
                    <div className="text-[10px] text-slate-400">{formatTanggalIndo(act.date)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
